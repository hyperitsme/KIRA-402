import { Router } from 'express';
import { verifySolanaPayment } from '../lib/solana.js';
import { issueOrderbookJWT } from '../middleware/x402.js';

const router = Router();
const MIN_USD_ORDERBOOK = Number(process.env.MIN_USD_ORDERBOOK || '0.01');
const RECEIVER_SOL = process.env.RECEIVER_SOL;

/**
 * POST /x402/verify
 * Body: { tx_signature, chain, amount_usd, receiver, memo, session_id, secret? }
 * Returns: { token, ttl_seconds }
 */
router.post('/verify', async (req, res) => {
  const { tx_signature, chain, amount_usd, receiver, memo, session_id, secret } = req.body || {};

  // Dev backdoor (optional)
  if (secret) {
    if (secret !== process.env.VERIFY_SHARED_SECRET) {
      return res.status(401).json({ error: 'invalid_secret' });
    }
  }

  // Basic checks
  if (!tx_signature || !chain || !amount_usd || !receiver || !memo || !session_id) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  if (receiver !== RECEIVER_SOL) {
    return res.status(400).json({ error: 'wrong_receiver' });
  }
  if (Number(amount_usd) < MIN_USD_ORDERBOOK) {
    return res.status(400).json({ error: 'amount_too_small', min: MIN_USD_ORDERBOOK });
  }

  // On-chain verification (stubbed)
  const result = await verifySolanaPayment({
    txSignature: tx_signature,
    amountUsd: Number(amount_usd),
    receiver,
    memo
  });
  if (!result.ok) {
    return res.status(400).json({ error: 'verify_failed', reason: result.reason });
  }

  // Issue x402 JWT
  const token = issueOrderbookJWT({
    session_id,
    tx_signature,
    chain,
    amount_usd
  });

  return res.json({ token, ttl_seconds: Number(process.env.JWT_TTL_SECONDS || 900) });
});

export default router;
