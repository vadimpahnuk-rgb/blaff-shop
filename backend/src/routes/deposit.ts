import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { transactions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Deposit bounds (in account currency / USD-equivalent).
const MIN_DEPOSIT = 1;
const MAX_DEPOSIT = 10000;

// Per-user rate limit: max 3 deposit creations per 5 minutes. In-memory only —
// resets on cold start, which is acceptable for abuse throttling.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const depositHits = new Map<number, number[]>();

/** Returns true if the user has exhausted their deposit quota for the window. */
function isRateLimited(userId: number): boolean {
  const now = Date.now();
  const hits = (depositHits.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (hits.length >= RATE_LIMIT_MAX) {
    depositHits.set(userId, hits);
    return true;
  }
  hits.push(now);
  depositHits.set(userId, hits);
  return false;
}

const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1';
const API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
// Crypto the buyer pays in. usdttrc20 = USDT on TRON (low fees, popular).
const PAY_CURRENCY = process.env.NOWPAYMENTS_PAY_CURRENCY || 'usdttrc20';
// Public backend URL, used to build the IPN callback. Optional — when unset,
// NowPayments falls back to the IPN URL configured in its dashboard.
const PUBLIC_URL = process.env.PUBLIC_URL || '';

/**
 * POST /api/deposit
 * Creates a pending deposit transaction and a NowPayments payment, returning
 * the crypto pay address + a QR code for the frontend to display. The balance
 * is credited later by POST /api/webhooks/nowpayments once payment finishes.
 */
router.post('/', async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }
    if (amount < MIN_DEPOSIT || amount > MAX_DEPOSIT) {
      res.status(400).json({
        error: `Amount must be between ${MIN_DEPOSIT} and ${MAX_DEPOSIT}`,
      });
      return;
    }

    if (!API_KEY) {
      res.status(503).json({ error: 'Payment provider is not configured' });
      return;
    }

    if (isRateLimited(req.user!.id)) {
      res.status(429).json({ error: 'Too many deposit requests, try again later' });
      return;
    }

    // 1. Record a pending deposit transaction.
    const [tx] = await db
      .insert(transactions)
      .values({
        userId: req.user!.id,
        type: 'deposit',
        amount: amount.toFixed(8),
        status: 'pending',
      })
      .returning();

    // 2. Create the NowPayments payment.
    const npRes = await fetch(`${NOWPAYMENTS_API}/payment`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: PAY_CURRENCY,
        order_id: String(tx.id),
        order_description: `BLA AFF SHOP deposit #${tx.id}`,
        ...(PUBLIC_URL
          ? { ipn_callback_url: `${PUBLIC_URL}/api/webhooks/nowpayments` }
          : {}),
      }),
    });

    if (!npRes.ok) {
      const detail = await npRes.text();
      console.error('[deposit] NowPayments error:', npRes.status, detail);
      await db
        .update(transactions)
        .set({ status: 'failed' })
        .where(eq(transactions.id, tx.id));
      res.status(502).json({ error: 'Failed to create payment' });
      return;
    }

    const payment = (await npRes.json()) as {
      payment_id: number | string;
      pay_address: string;
      pay_amount: number;
      pay_currency: string;
    };

    // 3. Persist the NowPayments payment id for webhook matching.
    const paymentId = String(payment.payment_id);
    await db
      .update(transactions)
      .set({ paymentId })
      .where(eq(transactions.id, tx.id));

    // 4. QR encoding the pay address.
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      payment.pay_address,
    )}`;

    res.status(201).json({
      transaction_id: tx.id,
      payment_id: paymentId,
      address: payment.pay_address,
      currency: payment.pay_currency.toUpperCase(),
      amount, // USD amount (frontend displays this)
      pay_amount: payment.pay_amount, // crypto amount to send
      qr_code: qrCode,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
