-- Adds the "Партнери" (partners) category + one sample partner product.
-- Idempotent: safe to run multiple times. Mirrors backend/src/db/seed.ts.
-- Run against the production Supabase DB (SQL editor or psql via the pooler).

WITH cat AS (
  INSERT INTO categories (name, slug, icon, sort_order)
  VALUES ('Партнери', 'partners', '🤝', 7)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id
)
INSERT INTO products (category_id, name, description, price, stock, tags, data, is_active)
SELECT cat.id,
       'Антидетект браузер (партнер)',
       'Партнерський сервіс — антидетект браузер для мультиакаунтингу. Знижка за нашим посиланням. Поле data містить партнерське посилання.',
       '0.00000000', 999,
       ARRAY['partner', 'antidetect', 'referral'],
       'https://example-partner.com/?ref=blashop',
       true
FROM cat
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE name = 'Антидетект браузер (партнер)'
)
RETURNING id, category_id, name;
