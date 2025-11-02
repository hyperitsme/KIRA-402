import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { buildCors } from './middleware/cors.js';
import { tinyRateLimit } from './middleware/rateLimit.js';
import orderbookRoutes from './routes/orderbook.js';
import verifyRoutes from './routes/verify.js';

const app = express();

// Security + parsing
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(buildCors(process.env.CORS_ORIGINS));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(tinyRateLimit());

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/api', orderbookRoutes);
app.use('/x402', verifyRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'not_found', path: req.path }));

// Boot
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`[x402] backend running on :${port}`);
  console.log(`[x402] CORS origins: ${process.env.CORS_ORIGINS}`);
});
