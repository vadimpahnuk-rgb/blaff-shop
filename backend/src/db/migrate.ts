import 'dotenv/config';
import { Pool } from 'pg';

/**
 * Lightweight migration runner.
 *
 * Rather than depending on drizzle-kit codegen at runtime, this applies the
 * schema as idempotent raw SQL (CREATE TABLE IF NOT EXISTS ...). It mirrors
 * src/db/schema.ts exactly. Safe to run repeatedly ("push" semantics).
 */

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  telegram_id   BIGINT NOT NULL UNIQUE,
  first_name    VARCHAR(255),
  username      VARCHAR(255),
  balance       NUMERIC(18, 8) NOT NULL DEFAULT 0,
  referral_balance NUMERIC(18, 8) NOT NULL DEFAULT 0,
  role          VARCHAR(32) NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE
);

-- Ensure the referral_balance column exists on pre-existing databases
-- (CREATE TABLE IF NOT EXISTS above is a no-op once the table exists).
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_balance NUMERIC(18, 8) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS categories (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  icon          VARCHAR(255),
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  category_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  price         NUMERIC(18, 8) NOT NULL,
  stock         INTEGER NOT NULL DEFAULT 0,
  tags          TEXT[],
  data          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          VARCHAR(32) NOT NULL,
  amount        NUMERIC(18, 8) NOT NULL,
  status        VARCHAR(32) NOT NULL DEFAULT 'pending',
  payment_id    VARCHAR(255),
  product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id    INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_data  TEXT,
  price         NUMERIC(18, 8) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id            SERIAL PRIMARY KEY,
  referrer_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(referred_id)
);

CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_transactions_user    ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user       ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer   ON referrals(referrer_id);
`;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set.');
  }

  const pool = new Pool({
    connectionString,
    ssl: /localhost|127\.0\.0\.1/.test(connectionString)
      ? false
      : { rejectUnauthorized: false },
  });

  console.log('[migrate] applying schema...');
  try {
    await pool.query(DDL);
    console.log('[migrate] done.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
