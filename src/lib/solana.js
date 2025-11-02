// Placeholder verifier. In production, validate transaction on-chain:
// - signature exists & confirmed
// - receiver matches RECEIVER_SOL
// - amount >= required
// - memo/session_id matches
// This file exposes a stub for now.

export async function verifySolanaPayment({ txSignature, amountUsd, receiver, memo }) {
  // TODO: implement actual on-chain checks with getTransaction + token price oracle
  if (!txSignature || !receiver || !memo) return { ok: false, reason: 'missing_fields' };
  // Accept for now if fields present:
  return { ok: true, reason: 'dev_ok' };
}
