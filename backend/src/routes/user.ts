import { Router } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { users, purchases, products } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All user routes require authentication.
router.use(authMiddleware);

/**
 * GET /api/user/balance
 * Returns the current user's balance.
 */
router.get('/balance', async (req, res, next) => {
  try {
    const [row] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    res.json({ balance: row?.balance ?? '0' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/purchases
 * Returns the user's purchases with product info, newest first.
 */
router.get('/purchases', async (req, res, next) => {
  try {
    const rows = await db
      .select({
        id: purchases.id,
        product_id: purchases.productId,
        product_data: purchases.productData,
        price: purchases.price,
        quantity: purchases.quantity,
        created_at: purchases.createdAt,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
        },
      })
      .from(purchases)
      .leftJoin(products, eq(purchases.productId, products.id))
      .where(eq(purchases.userId, req.user!.id))
      .orderBy(desc(purchases.createdAt));

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
