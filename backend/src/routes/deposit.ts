import { Router } from 'express';
import { db } from '../db';
import { transactions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Deposit bounds (in account currency / USD-equivalent).
const MIN_DEPOSIT = 1;
const MAX_DEPOSIT = 10000;

/**
 * POST /api/deposit
 * Creates a pending deposit transaction. Payment provider integration
 * (NowPayments) is stubbed — the returned transaction is settled later by
 * the webhook handler.
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

    const [tx] = await db
      .insert(transactions)
      .values({
        userId: req.user!.id,
        type: 'deposit',
        amount: amount.toFixed(8),
        status: 'pending',
      })
      .returning();

    res.status(201).json({
      transaction_id: tx.id,
      amount: tx.amount,
      status: tx.status,
      message:
        'Payment integration pending. This deposit is recorded as pending and ' +
        'will be credited once payment processing is wired up.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
