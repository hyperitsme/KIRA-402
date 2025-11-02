import { signX402Token, verifyX402Token } from '../lib/jwt.js';

const MIN_USD_ORDERBOOK = Number(process.env.MIN_USD_ORDERBOOK || '0.01');
const RECEIVER_SOL = process.env.RECEIVER_SOL;

function makeChallenge(req, scope) {
  const sessionId = req.headers['x-session-id'] || crypto.randomUUID();
  const memo = `${scope}:${sessionId}`;
  return {
    message: 'Payment Required',
    required: {
      chain: 'solana',
      currency: 'USDC',
      amount_usd: scope === 'orderbook:read' ? MIN_USD_ORDERBOOK : 0.01,
      receiver: RECEIVER_SOL,
      memo
    },
    retry: {
      method: req.method,
      endpoint: req.path,
      headers: ['Authorization: Bearer <x402_jwt>']
    },
    verify_endpoint: '/x402/verify',
    session_id: sessionId
  };
}

export function requireX402(scope) {
  return (req, res, next) => {
    const hdr = req.headers.authorization || '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) {
      return res.status(402).json(makeChallenge(req, scope));
    }
    try {
      const claims = verifyX402Token(token);
      if (claims.scope !== scope) return res.status(402).json(makeChallenge(req, scope));
      req.x402 = claims;
      next();
    } catch (_e) {
      return res.status(402).json(makeChallenge(req, scope));
    }
  };
}

// helper for issuing token after verification endpoint
export function issueOrderbookJWT({ session_id, tx_signature, chain, amount_usd }) {
  return signX402Token({
    scope: 'orderbook:read',
    session_id,
    tx_signature,
    chain,
    amount_usd: Number(amount_usd)
  });
}
