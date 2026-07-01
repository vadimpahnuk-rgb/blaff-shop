import {
  pgTable,
  serial,
  bigint,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from 'drizzle-orm/pg-core';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

/**
 * users
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  telegramId: bigint('telegram_id', { mode: 'number' }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }),
  username: varchar('username', { length: 255 }),
  balance: numeric('balance', { precision: 18, scale: 8 }).notNull().default('0'),
  referralBalance: numeric('referral_balance', { precision: 18, scale: 8 })
    .notNull()
    .default('0'),
  role: varchar('role', { length: 32 }).notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  isBanned: boolean('is_banned').notNull().default(false),
});

/**
 * categories
 */
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  icon: varchar('icon', { length: 255 }),
  sortOrder: integer('sort_order').notNull().default(0),
});

/**
 * products
 */
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 18, scale: 8 }).notNull(),
  stock: integer('stock').notNull().default(0),
  tags: text('tags').array(),
  data: text('data'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * transactions
 */
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 32 }).notNull(),
  amount: numeric('amount', { precision: 18, scale: 8 }).notNull(),
  status: varchar('status', { length: 32 }).notNull().default('pending'),
  paymentId: varchar('payment_id', { length: 255 }),
  productId: integer('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * purchases
 */
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, {
    onDelete: 'set null',
  }),
  productData: text('product_data'),
  price: numeric('price', { precision: 18, scale: 8 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * referrals
 *
 * One row per referred user (UNIQUE on referred_id): records who invited whom.
 */
export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: integer('referrer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  referredId: integer('referred_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Select types ----
export type User = InferSelectModel<typeof users>;
export type Category = InferSelectModel<typeof categories>;
export type Product = InferSelectModel<typeof products>;
export type Transaction = InferSelectModel<typeof transactions>;
export type Purchase = InferSelectModel<typeof purchases>;
export type Referral = InferSelectModel<typeof referrals>;

// ---- Insert types ----
export type NewUser = InferInsertModel<typeof users>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewProduct = InferInsertModel<typeof products>;
export type NewTransaction = InferInsertModel<typeof transactions>;
export type NewPurchase = InferInsertModel<typeof purchases>;
export type NewReferral = InferInsertModel<typeof referrals>;
