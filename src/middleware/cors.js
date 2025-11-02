import cors from 'cors';

export function buildCors(originsCsv) {
  const whitelist = (originsCsv || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  // default strict: only https://kiraai.io
  const allowed = whitelist.length ? whitelist : ['https://kiraai.io'];

  return cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true); // allow curl/postman
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'), false);
    },
    credentials: false,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
  });
}
