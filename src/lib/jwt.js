import jwt from 'jsonwebtoken';

const issuer   = process.env.JWT_ISSUER   || 'kira-x402';
const audience = process.env.JWT_AUDIENCE || 'kira-clients';
const ttl      = Number(process.env.JWT_TTL_SECONDS || 900);
const secret   = process.env.JWT_SECRET || 'jwt-secret';

export function signX402Token(payload) {
  return jwt.sign(payload, secret, { expiresIn: ttl, issuer, audience });
}

export function verifyX402Token(token) {
  return jwt.verify(token, secret, { issuer, audience });
}
