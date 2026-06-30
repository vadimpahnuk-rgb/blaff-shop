# API Reference — BLA AFF SHOP

Base URL: `/api` (prod `https://blaff-backend.vercel.app/api`, local `http://localhost:3001/api`).
All bodies are JSON. Errors are `{ "error": "<message>" }` with an appropriate status. In non-production the global handler also returns a `stack` field.

## Auth

Protected endpoints require the Telegram Mini App init data:

```
Authorization: tma <initData>
```

`<initData>` is `window.Telegram.WebApp.initData`. Legacy fallback header `x-telegram-init-data: <initData>` is also accepted. **Local dev only** (no `BOT_TOKEN`, `NODE_ENV != production`): use `x-dev-telegram-id: <number>` instead.

| Status | Meaning |
|--------|---------|
| 401 | Missing / invalid init data |
| 403 | User banned, or admin route without admin role |
| 402 | Insufficient balance (purchase) |
| 409 | Out of stock (purchase) |

Legend: 🔓 public · 🔑 auth required · 👑 admin required

---

## Health

### 🔓 `GET /api/health`
```json
{ "status": "ok", "timestamp": "2026-06-30T12:00:00.000Z" }
```

## Auth

### 🔑 `POST /api/auth/init`
Validates init data and returns the (found-or-created) user profile.
```json
{ "id": 1, "telegram_id": 123456789, "first_name": "Alice",
  "username": "alice", "balance": "0.00000000", "role": "user",
  "created_at": "2026-06-30T12:00:00.000Z" }
```

## Categories

### 🔓 `GET /api/categories`
List all categories, ordered by `sort_order` then `id`. Returns an array of `{ id, name, slug, icon, sortOrder }`.

### 🔓 `GET /api/categories/:id`
Single category. `400` invalid id, `404` not found.

## Products

### 🔓 `GET /api/products`
List **active** products with joined category. Ordered by `created_at` desc. Query filters (all optional):

| Param | Effect |
|-------|--------|
| `category_id` | exact category match |
| `search` | `ILIKE` on name OR description |
| `tag` | `tags` array contains tag |
| `min_price` / `max_price` | price bounds |

Each item: `{ id, category_id, name, description, price, stock, tags, is_active, created_at, category: { id, name, slug, icon } }`. **`data` is not included.**

Example:
```bash
curl "http://localhost:3001/api/products?category_id=1&search=aged&max_price=20"
```

### 🔓 `GET /api/products/:id`
Single active product (same shape, no `data`). `404` if not found or inactive.

## User  *(all 🔑)*

### 🔑 `GET /api/user/balance`
```json
{ "balance": "12.50000000" }
```

### 🔑 `GET /api/user/purchases`
User's purchases, newest first: `{ id, product_id, product_data, price, created_at, product: { id, name, description } }`.

## Purchase  *(all 🔑)*

### 🔑 `POST /api/purchase/:productId`
Atomic buy (row-locked): validates active + stock + balance, deducts balance, decrements stock, records purchase + transaction. Returns `201`:
```json
{ "success": true,
  "purchase": { "id": 10, "product_id": 3, "product_name": "Residential Proxy (US)",
    "price": "5.99000000", "data": "host: ...\nport: ...", "created_at": "..." } }
```
Errors: `404` product not found/inactive · `409` out of stock · `402` insufficient balance · `404` user not found.

```bash
curl -X POST "http://localhost:3001/api/purchase/3" -H "x-dev-telegram-id: 123456789"
```

### 🔑 `GET /api/purchase/:id/data`
Re-fetch delivered data for an owned purchase. `404` if not owned/not found.
```json
{ "id": 10, "product_id": 3, "data": "host: ...", "price": "5.99000000", "created_at": "..." }
```

## Deposit

### 🔑 `POST /api/deposit`
Body `{ "amount": <number> }` (1–10000). Creates a pending transaction + NowPayments payment. `503` if `NOWPAYMENTS_API_KEY` unset, `502` if NowPayments errors. Returns `201`:
```json
{ "transaction_id": 7, "payment_id": "5012345678", "address": "T...",
  "currency": "USDTTRC20", "amount": 25, "pay_amount": 25.01,
  "qr_code": "https://api.qrserver.com/v1/create-qr-code/?...&data=T..." }
```
Balance is credited later by the IPN webhook, not here.

## Webhooks  *(called by external services, not the frontend)*

### 🔓 `POST /api/webhooks/telegram`
Telegram updates → `bot.handleUpdate()`. Always `200` (no-op if bot unconfigured). Set this as the bot webhook URL.

### 🔓 `POST /api/webhooks/nowpayments`
NowPayments IPN. Requires valid `x-nowpayments-sig` (HMAC-SHA512 of sorted JSON, key = `NOWPAYMENTS_IPN_SECRET`) → `401` if invalid. On `finished`: credits balance idempotently + notifies user. `failed`/`expired`/`refunded` → marks transaction failed. Returns `{ "received": true }`.

## Admin  *(all 🔑👑)*

### Products
| Method | Path | Body / notes |
|--------|------|--------------|
| `GET` | `/api/admin/products` | All products incl. inactive + `data`, with category |
| `POST` | `/api/admin/products` | `{ name*, price*, category_id?, description?, stock?, tags?, data?, is_active? }` → `201` |
| `PUT` | `/api/admin/products/:id` | Partial update (only provided fields) |
| `DELETE` | `/api/admin/products/:id` | `{ deleted: true, id }` |
| `POST` | `/api/admin/products/:id/restock` | `{ quantity: <+int> }` → `{ id, stock }` |
| `POST` | `/api/admin/products/:id/give` | `{ user_id }` — free grant, creates purchase at price 0 |

### Users
| Method | Path | Body / notes |
|--------|------|--------------|
| `GET` | `/api/admin/users` | All users, newest first |
| `PUT` | `/api/admin/users/:id/role` | `{ role: "user" \| "admin" }` |
| `PUT` | `/api/admin/users/:id/balance` | `{ balance: <number ≥ 0> }` — absolute set, not delta |

### Transactions & stats
| Method | Path | Returns |
|--------|------|---------|
| `GET` | `/api/admin/transactions` | All transactions + user info, newest first |
| `GET` | `/api/admin/stats` | `{ total_users, total_products, total_purchases, revenue_today, revenue_week, revenue_month, top_products[] }` (UTC windows; week starts Monday) |

```bash
# admin call (local dev as the seeded admin)
curl "http://localhost:3001/api/admin/stats" -H "x-dev-telegram-id: 123456789"
```

See also: [ARCHITECTURE.md](./ARCHITECTURE.md) · [DEVELOPMENT.md](./DEVELOPMENT.md)
