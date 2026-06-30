import { Router } from 'express';
import crypto from 'crypto';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { transactions, users } from '../db/schema';
import { bot, notifyDepositConfirmed } from '../bot';

const router = Router();

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

/* ------------------------------------------------------------------ */
/*  Telegram bot webhook                                               */
/* ------------------------------------------------------------------ */

/**
 * POST /api/webhooks/telegram
 * Receives Telegram updates and hands them to the Telegraf instance.
 * Always answers 200 quickly so Telegram does not retry.
 */
router.post('/telegram', async (req, res) => {
  if (!bot) {
    res.sendStatus(200);
    return;
  }
  try {
    await bot.handleUpdate(req.body);
  } catch (err) {
    console.error('[webhook:telegram] handleUpdate failed:', err);
  }
  res.sendStatus(200);
});

/* ------------------------------------------------------------------ */
/*  NowPayments IPN webhook                                            */
/* ------------------------------------------------------------------ */

/**
 * Recursively sort object keys — NowPayments signs the alphabetically-sorted
 * JSON representation of the payload.
 */
function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = obj[key];
      acc[key] =
        value && typeof value === 'object' && !Array.isArray(value)
          ? sortObject(value as Record<string, unknown>)
          : value;
      return acc;
    }, {});
}

/**
 * Verify the `x-nowpayments-sig` HMAC-SHA512 signature.
 */
function verifySignature(payload: Record<string, unknown>, signature: string): boolean {
  if (!IPN_SECRET || !signature) return false;
  const expected = crypto
    .createHmac('sha512', IPN_SECRET)
    .update(JSON.stringify(sortObject(payload)))
    .digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * POST /api/webhooks/nowpayments
 * Verifies the HMAC signature, then on a `finished` payment marks the matching
 * transaction completed, credits the user's balance (idempotently) and notifies
 * the user via the Telegram bot.
 */
router.post('/nowpayments', async (req, res) => {
  const payload = req.body as Record<string, unknown>;
  const signature = req.header('x-nowpayments-sig') || '';

  if (!verifySignature(payload, signature)) {
    console.warn('[webhook:nowpayments] invalid signature');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  const paymentId = String(payload.payment_id ?? '');
  const status = String(payload.payment_status ?? '');
  console.log(`[webhook:nowpayments] payment ${paymentId} -> ${status}`);

  try {
    if (status === 'finished') {
      // Credit balance atomically and idempotently.
      const result = await db.transaction(async (tx) => {
        const [txn] = await tx
          .select()
          .from(transactions)
          .where(eq(transactions.paymentId, paymentId))
          .for('update')
          .limit(1);

        if (!txn) return { state: 'NOT_FOUND' as const };
        if (txn.status === 'completed') return { state: 'ALREADY' as const };

        await tx
          .update(transactions)
          .set({ status: 'completed' })
          .where(eq(transactions.id, txn.id));

        const [u] = await tx
          .update(users)
          .set({ balance: sql`${users.balance} + ${txn.amount}` })
          .where(eq(users.id, txn.userId))
          .returning({ balance: users.balance, telegramId: users.telegramId });

        return {
          state: 'CREDITED' as const,
          amount: Number(txn.amount),
          newBalance: Number(u.balance),
          telegramId: u.telegramId,
        };
      });

      if (result.state === 'CREDITED') {
        await notifyDepositConfirmed(result.telegramId, result.amount, result.newBalance);
      } else if (result.state === 'NOT_FOUND') {
        console.warn(`[webhook:nowpayments] no transaction for payment_id ${paymentId}`);
      }
    } else if (['failed', 'expired', 'refunded'].includes(status)) {
      await db
        .update(transactions)
        .set({ status: 'failed' })
        .where(eq(transactions.paymentId, paymentId));
    }
    // waiting / confirming / confirmed / sending / partially_paid -> leave pending.
  } catch (err) {
    console.error('[webhook:nowpayments] processing error:', err);
    // Still ack so NowPayments does not hammer us; reconciliation can retry.
  }

  res.json({ received: true });
});

export default router;
