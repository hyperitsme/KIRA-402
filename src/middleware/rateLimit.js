// ultra-light in-memory rate limit (per ip)
export function tinyRateLimit() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
  const max = Number(process.env.RATE_LIMIT_MAX || 120);
  const buckets = new Map();

  function sweep(now) {
    for (const [ip, b] of buckets) if (now - b.start > windowMs) buckets.delete(ip);
  }

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '0.0.0.0';
    const now = Date.now();
    let b = buckets.get(ip);
    if (!b) {
      b = { start: now, count: 0 };
      buckets.set(ip, b);
    }
    if (now - b.start > windowMs) {
      b.start = now; b.count = 0; sweep(now);
    }
    b.count++;
    if (b.count > max) {
      return res.status(429).json({ error: 'rate_limited', retry_after_ms: windowMs - (now - b.start) });
    }
    next();
  };
}
