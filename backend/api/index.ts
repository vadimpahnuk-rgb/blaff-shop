/**
 * Vercel serverless entry point.
 *
 * Re-exports the Express app as the request handler. The app guards its
 * app.listen() call behind `!process.env.VERCEL`, so importing it here is safe
 * — Vercel invokes the exported handler per request instead.
 */
import app from '../src/index';

export default app;
