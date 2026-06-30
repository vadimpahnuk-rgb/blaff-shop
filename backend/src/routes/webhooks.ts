import { Router } from 'express';

const router = Router();

/**
 * POST /api/webhooks/nowpayments
 * Webhook endpoint for NowPayments payment status updates.
 *
 * ⚠️ STUB: Logs incoming payload and acknowledges receipt.
 * TODO: Implement real processing:
 *   - Verify HMAC signature from NowPayments
 *   - Update transaction status (payment_id match)
 *   - Credit user balance on 'finished' status
 *   - Notify user via Telegram bot
 */
router.post('/nowpayments', async (req, res) => {
  const payload = req.body;

  console.log('[webhook:nowpayments] received:', JSON.stringify(payload, null, 2));

  // Acknowledge receipt immediately (NowPayments requires 200).
  res.json({ received: true });
});

export default router;
