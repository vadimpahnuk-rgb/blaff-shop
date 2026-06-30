import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';

import authRouter from './routes/auth';
import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';
import userRouter from './routes/user';
import purchaseRouter from './routes/purchase';
import depositRouter from './routes/deposit';
import webhooksRouter from './routes/webhooks';
import adminRouter from './routes/admin';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

/* ------------------------------------------------------------------ */
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */

// CORS — allow the Telegram Mini App origin and any dev origins.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
  }),
);

// Body parsing.
app.use(express.json());

/* ------------------------------------------------------------------ */
/*  Routes                                                             */
/* ------------------------------------------------------------------ */

/**
 * GET /api/health
 * Health-check endpoint.
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/user', userRouter);
app.use('/api/purchase', purchaseRouter);
app.use('/api/deposit', depositRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/admin', adminRouter);

/* ------------------------------------------------------------------ */
/*  Global error handler                                               */
/* ------------------------------------------------------------------ */

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

/* ------------------------------------------------------------------ */
/*  Start server                                                       */
/* ------------------------------------------------------------------ */

// Only start a long-running listener outside of serverless (Vercel) runtimes.
// On Vercel the app is exported and invoked per-request via api/index.ts.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[server] BLA AFF SHOP API running on port ${PORT}`);
  });
}

export default app;
