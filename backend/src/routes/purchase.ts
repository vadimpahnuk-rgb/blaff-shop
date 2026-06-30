import { Router } from 'express';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { users, products, purchases, transactions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All purchase routes require authentication.
router.use(authMiddleware);

/**
 * POST /api/purchase/:productId
 * Buy a product atomically: validates stock + balance, deducts balance,
 * decrements stock, records the purchase + transaction, and returns the
 * product data to the buyer.
 */
router.post('/:productId', async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId)) {
      res.status(400).json({ error: 'Invalid product id' });
      return;
    }

    const userId = req.user!.id;

    const result = await db.transaction(async (tx) => {
      // 1. Lock + load product.
      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .for('update')
        .limit(1);

      if (!product || !product.isActive) {
        return { error: 'PRODUCT_NOT_FOUND' as const };
      }

      // 2. Stock check.
      if (product.stock <= 0) {
        return { error: 'OUT_OF_STOCK' as const };
      }

      // 3. Balance check.
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for('update')
        .limit(1);

      if (!user) {
        return { error: 'USER_NOT_FOUND' as const };
      }

      const price = Number(product.price);
      const balance = Number(user.balance);
      if (balance < price) {
        return { error: 'INSUFFICIENT_BALANCE' as const };
      }

      // 4. Deduct balance.
      await tx
        .update(users)
        .set({ balance: sql`${users.balance} - ${product.price}` })
        .where(eq(users.id, userId));

      // 5. Decrement stock.
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - 1` })
        .where(eq(products.id, productId));

      // 6. Create purchase record (copy product.data).
      const [purchase] = await tx
        .insert(purchases)
        .values({
          userId,
          productId: product.id,
          productData: product.data,
          price: product.price,
        })
        .returning();

      // 7. Create transaction record.
      await tx.insert(transactions).values({
        userId,
        type: 'purchase',
        amount: product.price,
        status: 'completed',
        productId: product.id,
      });

      return { purchase, productName: product.name };
    });

    // Map domain errors to HTTP responses.
    if ('error' in result) {
      switch (result.error) {
        case 'PRODUCT_NOT_FOUND':
          res.status(404).json({ error: 'Product not found or inactive' });
          return;
        case 'OUT_OF_STOCK':
          res.status(409).json({ error: 'Product is out of stock' });
          return;
        case 'INSUFFICIENT_BALANCE':
          res.status(402).json({ error: 'Insufficient balance' });
          return;
        case 'USER_NOT_FOUND':
          res.status(404).json({ error: 'User not found' });
          return;
      }
    }

    // 8. Return purchase + product data to the buyer.
    res.status(201).json({
      success: true,
      purchase: {
        id: result.purchase.id,
        product_id: result.purchase.productId,
        product_name: result.productName,
        price: result.purchase.price,
        data: result.purchase.productData,
        created_at: result.purchase.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/purchase/:id/data
 * Returns the delivered product data for a purchase, after verifying ownership.
 */
router.get('/:id/data', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid purchase id' });
      return;
    }

    const [row] = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.id, id), eq(purchases.userId, req.user!.id)))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    res.json({
      id: row.id,
      product_id: row.productId,
      data: row.productData,
      price: row.price,
      created_at: row.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
