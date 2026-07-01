import { Router } from 'express';
import { eq, desc, and, gte, sql, asc } from 'drizzle-orm';
import { db } from '../../db';
import {
  users,
  categories,
  products,
  transactions,
  purchases,
  productItems,
} from '../../db/schema';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';

const router = Router();

// All admin routes require authentication + admin role.
router.use(authMiddleware);
router.use(adminMiddleware);

/* ------------------------------------------------------------------ */
/*  Products                                                          */
/* ------------------------------------------------------------------ */

/**
 * GET /api/admin/products
 * List all products (including inactive), with category info.
 */
router.get('/products', async (_req, res, next) => {
  try {
    const rows = await db
      .select({
        id: products.id,
        category_id: products.categoryId,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: sql<number>`(
          select count(*)::int from ${productItems}
          where ${productItems.productId} = ${products.id}
            and ${productItems.isSold} = false
        )`,
        items_total: sql<number>`(
          select count(*)::int from ${productItems}
          where ${productItems.productId} = ${products.id}
        )`,
        items_sold: sql<number>`(
          select count(*)::int from ${productItems}
          where ${productItems.productId} = ${products.id}
            and ${productItems.isSold} = true
        )`,
        tags: products.tags,
        data: products.data,
        is_active: products.isActive,
        created_at: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt));

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/products
 * Create a new product.
 */
router.post('/products', async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      stock,
      tags,
      data,
      is_active,
    } = req.body;

    if (!name || price === undefined) {
      res.status(400).json({ error: 'name and price are required' });
      return;
    }

    const [product] = await db
      .insert(products)
      .values({
        categoryId: category_id ?? null,
        name,
        description: description ?? null,
        price: String(price),
        stock: stock ?? 0,
        tags: tags ?? [],
        data: data ?? null,
        isActive: is_active !== undefined ? is_active : true,
      })
      .returning();

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/products/:id
 * Update a product.
 */
router.put('/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid product id' });
      return;
    }

    const {
      category_id,
      name,
      description,
      price,
      stock,
      tags,
      data,
      is_active,
    } = req.body;

    const [product] = await db
      .update(products)
      .set({
        ...(category_id !== undefined && { categoryId: category_id }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: String(price) }),
        ...(stock !== undefined && { stock }),
        ...(tags !== undefined && { tags }),
        ...(data !== undefined && { data }),
        ...(is_active !== undefined && { isActive: is_active }),
      })
      .where(eq(products.id, id))
      .returning();

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/products/:id
 * Delete a product.
 */
router.delete('/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid product id' });
      return;
    }

    const [product] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ deleted: true, id: product.id });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/products/:id/restock
 * Add N units to product stock.
 */
router.post('/products/:id/restock', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid product id' });
      return;
    }

    const quantity = Number(req.body?.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({ error: 'quantity must be a positive integer' });
      return;
    }

    const [product] = await db
      .update(products)
      .set({ stock: sql`${products.stock} + ${quantity}` })
      .where(eq(products.id, id))
      .returning({ id: products.id, stock: products.stock });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Product items (unique sellable units)                             */
/* ------------------------------------------------------------------ */

/**
 * POST /api/admin/products/:id/items
 * Bulk add unique items to a product. Body: { items: string[] }.
 */
router.post('/products/:id/items', async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId)) {
      res.status(400).json({ error: 'Invalid product id' });
      return;
    }

    const raw = req.body?.items;
    if (!Array.isArray(raw)) {
      res.status(400).json({ error: 'items must be an array of strings' });
      return;
    }

    const items = raw
      .filter((i): i is string => typeof i === 'string')
      .map((i) => i.trim())
      .filter(Boolean);

    if (items.length === 0) {
      res.status(400).json({ error: 'items must contain at least one non-empty string' });
      return;
    }

    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const inserted = await db
      .insert(productItems)
      .values(items.map((data) => ({ productId, data })))
      .returning({ id: productItems.id });

    res.status(201).json({ added: inserted.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/products/:id/items
 * List all items of a product with their sold status.
 */
router.get('/products/:id/items', async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId)) {
      res.status(400).json({ error: 'Invalid product id' });
      return;
    }

    const rows = await db
      .select({
        id: productItems.id,
        product_id: productItems.productId,
        data: productItems.data,
        is_sold: productItems.isSold,
        purchase_id: productItems.purchaseId,
        created_at: productItems.createdAt,
      })
      .from(productItems)
      .where(eq(productItems.productId, productId))
      .orderBy(asc(productItems.isSold), desc(productItems.id));

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/products/:id/items/:itemId
 * Delete a single item.
 */
router.delete('/products/:id/items/:itemId', async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(productId) || !Number.isInteger(itemId)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }

    const [item] = await db
      .delete(productItems)
      .where(and(eq(productItems.id, itemId), eq(productItems.productId, productId)))
      .returning({ id: productItems.id });

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json({ deleted: true, id: item.id });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/products/:id/give
 * Give a product to a user for free (creates purchase without charging).
 */
router.post('/products/:id/give', async (req, res, next) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId)) {
      res.status(400).json({ error: 'Invalid product id' });
      return;
    }

    const userId = Number(req.body?.user_id);
    if (!Number.isInteger(userId)) {
      res.status(400).json({ error: 'user_id is required' });
      return;
    }

    // Verify product exists.
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Verify user exists.
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Create purchase (price = 0 for giveaways), consuming one unique item
    // when available; falls back to legacy product.data otherwise.
    const purchase = await db.transaction(async (tx) => {
      const [item] = await tx
        .select()
        .from(productItems)
        .where(and(eq(productItems.productId, product.id), eq(productItems.isSold, false)))
        .limit(1)
        .for('update', { skipLocked: true });

      const [row] = await tx
        .insert(purchases)
        .values({
          userId,
          productId: product.id,
          productData: item ? item.data : product.data,
          price: '0',
        })
        .returning();

      if (item) {
        await tx
          .update(productItems)
          .set({ isSold: true, purchaseId: row.id })
          .where(eq(productItems.id, item.id));
      }

      await tx.insert(transactions).values({
        userId,
        type: 'purchase',
        amount: '0',
        status: 'completed',
        productId: product.id,
      });

      return row;
    });

    res.status(201).json({
      success: true,
      purchase: {
        id: purchase.id,
        product_id: purchase.productId,
        user_id: purchase.userId,
        product_name: product.name,
        created_at: purchase.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Users                                                             */
/* ------------------------------------------------------------------ */

/**
 * GET /api/admin/users
 * List all users.
 */
router.get('/users', async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Change a user's role.
 */
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid user id' });
      return;
    }

    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      res.status(400).json({ error: 'role must be "user" or "admin"' });
      return;
    }

    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({ id: users.id, telegram_id: users.telegramId, role: users.role });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id/balance
 * Adjust a user's balance (absolute set, not delta).
 */
router.put('/users/:id/balance', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid user id' });
      return;
    }

    const balance = Number(req.body?.balance);
    if (!Number.isFinite(balance) || balance < 0) {
      res.status(400).json({ error: 'balance must be a non-negative number' });
      return;
    }

    const [user] = await db
      .update(users)
      .set({ balance: String(balance) })
      .where(eq(users.id, id))
      .returning({ id: users.id, balance: users.balance });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Transactions                                                      */
/* ------------------------------------------------------------------ */

/**
 * GET /api/admin/transactions
 * List transactions with user info.
 */
router.get('/transactions', async (_req, res, next) => {
  try {
    const rows = await db
      .select({
        id: transactions.id,
        user_id: transactions.userId,
        type: transactions.type,
        amount: transactions.amount,
        status: transactions.status,
        payment_id: transactions.paymentId,
        product_id: transactions.productId,
        created_at: transactions.createdAt,
        user: {
          id: users.id,
          telegram_id: users.telegramId,
          username: users.username,
        },
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .orderBy(desc(transactions.createdAt));

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  Stats                                                             */
/* ------------------------------------------------------------------ */

/**
 * GET /api/admin/stats
 * Dashboard statistics:
 *   - Total users, products, purchases
 *   - Revenue today, this week, this month
 *   - Top 5 products by units sold
 */
router.get('/stats', async (_req, res, next) => {
  try {
    const now = new Date();

    // Start of today (UTC).
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    // Start of this week (Monday, UTC).
    const dayOfWeek = now.getUTCDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(todayStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - mondayOffset);
    // Start of this month (UTC).
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    // Run independent queries concurrently.
    const [
      totalUsers,
      totalProducts,
      totalPurchases,
      revenueToday,
      revenueWeek,
      revenueMonth,
      topProducts,
    ] = await Promise.all([
      // Total users.
      db.select({ count: sql<number>`count(*)::int` }).from(users),

      // Total products.
      db.select({ count: sql<number>`count(*)::int` }).from(products),

      // Total purchases.
      db.select({ count: sql<number>`count(*)::int` }).from(purchases),

      // Revenue today.
      db
        .select({ total: sql<string>`coalesce(sum(price),0)` })
        .from(purchases)
        .where(gte(purchases.createdAt, todayStart)),

      // Revenue this week.
      db
        .select({ total: sql<string>`coalesce(sum(price),0)` })
        .from(purchases)
        .where(gte(purchases.createdAt, weekStart)),

      // Revenue this month.
      db
        .select({ total: sql<string>`coalesce(sum(price),0)` })
        .from(purchases)
        .where(gte(purchases.createdAt, monthStart)),

      // Top 5 products by units sold.
      db
        .select({
          product_id: purchases.productId,
          name: products.name,
          units_sold: sql<number>`count(*)::int`,
          revenue: sql<string>`sum(${purchases.price})`,
        })
        .from(purchases)
        .leftJoin(products, eq(purchases.productId, products.id))
        .groupBy(purchases.productId, products.name)
        .orderBy(sql`count(*) desc`)
        .limit(5),
    ]);

    res.json({
      total_users: Number(totalUsers[0]?.count ?? 0),
      total_products: Number(totalProducts[0]?.count ?? 0),
      total_transactions: Number(totalPurchases[0]?.count ?? 0),
      sales_today: Number(revenueToday[0]?.total ?? 0),
      sales_week: Number(revenueWeek[0]?.total ?? 0),
      sales_month: Number(revenueMonth[0]?.total ?? 0),
      top_products: topProducts.map((p) => ({
        id: p.product_id,
        name: p.name,
        sales: Number(p.units_sold),
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
