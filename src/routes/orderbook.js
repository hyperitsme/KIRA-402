import { Router } from 'express';
import { requireX402 } from '../middleware/x402.js';

const router = Router();

/**
 * Protected example resource.
 * Client must retry this request with Authorization: Bearer <x402_jwt>.
 */
router.get('/orderbook', requireX402('orderbook:read'), (req, res) => {
  const symbol = (req.query.symbol || 'SOL/USDT').toUpperCase();
  // demo data; replace with real provider
  res.json({
    symbol,
    ts: Date.now(),
    bids: [[155.23, 12.1], [155.20, 5.4]],
    asks: [[155.30, 9.7], [155.35, 3.2]],
    x402_tx: req.x402?.tx_signature
  });
});

export default router;
