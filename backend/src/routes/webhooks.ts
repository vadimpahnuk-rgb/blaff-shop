import { Router } from 'express';

const router = Router();

/**
 * POST /api/webhooks/nowpayments
 * Stub IPN handler.
 *
 * Real implementation (TODO):
 *   1. Verify the `x-nowpayments-sig` HMAC signature against NOWPAYMENTS_IPN_SECRET.
 *   2. On payment_status === 'finished'/'confirmed', look up the matching
 *      pending transaction by payment_id, mark it 'completed', and credit the
 *      user's balance atomically (db.transaction).
 *   3. Handle 'failed'/'expired'/'refunded' statuses accordingly.
 *   4. Be idempotent — the same IPN may be delivered more than once.
 */
router.post('/nowpayments', async (req, res) => {
  // 1. Log incoming payload for debugging / future processing.
  console.log('[webhook:nowpayments] received:', JSON.stringify(req.body));

  // 2. Acknowledge receipt. Always return 200 quickly so the provider does
  //    not retry; actual processing happens out-of-band once implemented.
  res.status(200).json({ received: true });
});

export default router;
