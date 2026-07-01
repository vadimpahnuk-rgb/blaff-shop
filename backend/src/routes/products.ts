import { Router } from 'express';
import { and, desc, eq, gte, ilike, lte, or, sql, type SQL } from 'drizzle-orm';
import { db } from '../db';
import { products, categories, productItems } from '../db/schema';

const router = Router();

// Derived stock: number of unsold unique items for the product.
const availableItemsCount = sql<number>`(
  select count(*)::int from ${productItems}
  where ${productItems.productId} = ${products.id}
    and ${productItems.isSold} = false
)`;

/**
 * GET /api/products
 * List active products. Filters: category_id, search, tag, min_price, max_price.
 * Joined with category info. Ordered by created_at desc.
 */
router.get('/', async (req, res, next) => {
  try {
    const { category_id, search, tag, min_price, max_price } = req.query;

    const conditions: SQL[] = [eq(products.isActive, true)];

    if (category_id !== undefined) {
      const cid = Number(category_id);
      if (Number.isInteger(cid)) conditions.push(eq(products.categoryId, cid));
    }

    if (typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      const cond = or(
        ilike(products.name, term),
        ilike(products.description, term),
      );
      if (cond) conditions.push(cond);
    }

    if (typeof tag === 'string' && tag.trim()) {
      // text[] contains the given tag
      conditions.push(sql`${products.tags} @> ARRAY[${tag.trim()}]::text[]`);
    }

    if (min_price !== undefined && !Number.isNaN(Number(min_price))) {
      conditions.push(gte(products.price, String(Number(min_price))));
    }

    if (max_price !== undefined && !Number.isNaN(Number(max_price))) {
      conditions.push(lte(products.price, String(Number(max_price))));
    }

    const rows = await db
      .select({
        id: products.id,
        category_id: products.categoryId,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: availableItemsCount,
        tags: products.tags,
        is_active: products.isActive,
        created_at: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/:id
 * Single active product with category info. Note: `data` is intentionally
 * NOT returned here — it is only delivered to a buyer after purchase.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid product id' });
      return;
    }

    const [row] = await db
      .select({
        id: products.id,
        category_id: products.categoryId,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: availableItemsCount,
        tags: products.tags,
        is_active: products.isActive,
        created_at: products.createdAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          icon: categories.icon,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.id, id), eq(products.isActive, true)))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
