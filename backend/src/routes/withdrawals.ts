import { Router } from 'express';
import { db } from '../db';
import { withdrawals, users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

// All routes require auth
router.use(authMiddleware);

// POST /api/user/withdrawals — create withdrawal request
router.post('/', async (req, res) => {
  try {
    const { amount, wallet_address } = req.body;
    const userId = (req as any).user.id;

    // Validate
    if (!amount || amount < 20) {
      return res.status(400).json({ error: 'Мінімальна сума виведення — $20' });
    }
    if (!wallet_address || wallet_address.length < 10) {
      return res.status(400).json({ error: 'Введіть коректну адресу USDT TRC20 гаманця' });
    }

    // Check user balance
    const [user] = await db.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user || Number(user.balance) < amount) {
      return res.status(400).json({ error: 'Недостатньо коштів на балансі' });
    }

    const fee = parseFloat((amount * 0.02).toFixed(8));
    const netAmount = parseFloat((amount - fee).toFixed(8));

    // Use transaction: deduct balance + create withdrawal
    const result = await db.transaction(async (tx) => {
      // Deduct balance
      await tx.update(users)
        .set({ balance: sql`${users.balance} - ${amount}` })
        .where(eq(users.id, userId));

      // Create withdrawal record
      const [withdrawal] = await tx.insert(withdrawals).values({
        userId,
        amount: amount.toString(),
        fee: fee.toString(),
        netAmount: netAmount.toString(),
        walletAddress: wallet_address,
        status: 'pending',
      }).returning();

      return withdrawal;
    });

    res.json(result);
  } catch (err) {
    console.error('[withdraw]', err);
    res.status(500).json({ error: 'Помилка створення запиту' });
  }
});

// GET /api/user/withdrawals — list user's withdrawals
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const list = await db.select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.createdAt))
      .limit(50);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Помилка завантаження' });
  }
});

export default router;
