import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/init
 * Validates Telegram initData (via authMiddleware) and returns the user profile.
 */
router.post('/init', authMiddleware, async (req, res, next) => {
  try {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: row.id,
      telegram_id: row.telegramId,
      first_name: row.firstName,
      username: row.username,
      balance: row.balance,
      role: row.role,
      created_at: row.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
