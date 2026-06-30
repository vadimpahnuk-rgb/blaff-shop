import { Router } from 'express';
import { asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { categories } from '../db/schema';

const router = Router();

/**
 * GET /api/categories
 * List all categories ordered by sort_order.
 */
router.get('/', async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.id));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/categories/:id
 * Get a single category.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'Invalid category id' });
      return;
    }

    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
