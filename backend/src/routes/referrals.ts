import { Router } from 'express';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { users, referrals, transactions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All referral routes require authentication.
router.use(authMiddleware);

// Telegram deep-link building blocks. Bot: @BLA_TL.
const BOT_USERNAME = process.env.BOT_USERNAME || 'bla_fbshop_bot';

function referralLink(userId: number): string {
  return `https://t.me/${BOT_USERNAME}?start=ref_${userId}`;
}

/**
 * GET /api/user/referrals/stats
 * Aggregate referral figures for the current user plus the list of people
 * they invited.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Invited count.
    const [{ count: invitedCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    // Current referral balance.
    const [me] = await db
      .select({ referralBalance: users.referralBalance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Lifetime earnings = every commission ever credited (whether or not it
    // has since been withdrawn to the main balance).
    const [{ total: totalEarned }] = await db
      .select({ total: sql<string>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'referral_commission'),
        ),
      );

    // The invited users, newest first.
    const invited = await db
      .select({
        id: users.id,
        first_name: users.firstName,
        username: users.username,
        created_at: referrals.createdAt,
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referredId, users.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));

    res.json({
      invited_count: invitedCount ?? 0,
      referral_balance: Number(me?.referralBalance ?? 0),
      total_earned: Number(totalEarned ?? 0),
      referral_link: referralLink(userId),
      referred_users: invited,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/user/referrals/withdraw
 * Moves the entire referral balance to the main balance atomically and
 * records a `referral_withdraw` transaction. Returns the updated balances.
 */
router.post('/withdraw', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const result = await db.transaction(async (tx) => {
      // Lock the user row so the balance can't change under us.
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for('update')
        .limit(1);

      if (!user) {
        return { error: 'USER_NOT_FOUND' as const };
      }

      const amount = Number(user.referralBalance);
      if (!(amount > 0)) {
        return { error: 'NOTHING_TO_WITHDRAW' as const };
      }

      // Move referral_balance -> balance, then zero out referral_balance.
      const [updated] = await tx
        .update(users)
        .set({
          balance: sql`${users.balance} + ${users.referralBalance}`,
          referralBalance: '0',
        })
        .where(eq(users.id, userId))
        .returning({
          balance: users.balance,
          referralBalance: users.referralBalance,
        });

      await tx.insert(transactions).values({
        userId,
        type: 'referral_withdraw',
        amount: user.referralBalance,
        status: 'completed',
      });

      return { updated };
    });

    if ('error' in result) {
      switch (result.error) {
        case 'USER_NOT_FOUND':
          res.status(404).json({ error: 'User not found' });
          return;
        case 'NOTHING_TO_WITHDRAW':
          res.status(400).json({ error: 'No referral balance to withdraw' });
          return;
      }
    }

    res.json({
      balance: Number(result.updated.balance),
      referral_balance: Number(result.updated.referralBalance),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
