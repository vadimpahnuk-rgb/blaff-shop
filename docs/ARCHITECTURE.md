# Architecture — BLA AFF SHOP

A Telegram Mini App store for digital goods (Facebook accounts, proxies, Business Managers, etc.). Users open the shop from a Telegram bot, top up a balance with crypto, and buy products whose secret `data` (logins, proxy creds) is delivered after purchase.

## System diagram

```
        Telegram client
              │  opens Mini App (WebApp button)
              ▼
   Frontend  (React 19 + Vite + Tailwind v4)          Vercel static
   blaff-frontend.vercel.app                          (SPA, rewrites → index.html)
              │  REST,  Authorization: tma <initData>
              ▼
   Backend   (Express 5 + TypeScript)                 Vercel serverless
   blaff-backend.vercel.app  /api/*                   (api/index.ts re-exports app)
              │
     ┌────────┼─────────────────────────┐
     ▼        ▼                          ▼
  Drizzle   Telegraf bot            fetch() → NowPayments
  ORM       (webhook mode)          (crypto deposits)
     │        │  POST /api/webhooks/telegram     │ IPN → POST /api/webhooks/nowpayments
     ▼        ▼                                  ▼
   PostgreSQL (Supabase pooler, prod / docker PG, local)
```

## Components

| Component | Path | Tech | Notes |
|-----------|------|------|-------|
| Frontend | `frontend/` | React 19, Vite 8, Tailwind v4, react-router 7, axios | SPA. API base from `VITE_API_URL` (default `http://localhost:3001/api`). Auth via `window.Telegram.WebApp.initData`. |
| Backend API | `backend/src/` | Express 5, TypeScript, Drizzle ORM, pg | All routes under `/api`. Global JSON error handler. |
| Bot | `backend/src/bot.ts` | Telegraf 4 | Runs in-process in **webhook mode**; shares the DB pool. `/start`, `/balance`, `/support`. Only instantiated when `BOT_TOKEN` is set. |
| DB | `backend/src/db/` | PostgreSQL | Drizzle schema + raw-SQL migration runner + seed. |
| Payments | `backend/src/routes/deposit.ts`, `webhooks.ts` | NowPayments REST + IPN | Crypto deposits (default `usdttrc20`). Balance credited only on verified IPN. |
| Serverless entry | `backend/api/index.ts` | @vercel/node | Re-exports the Express `app`; `app.listen()` is guarded behind `!process.env.VERCEL`. |

## Data model

Drizzle schema: `backend/src/db/schema.ts`. Five tables (`NUMERIC(18,8)` money, `TIMESTAMPTZ` timestamps):

- **users** — `id`, `telegram_id` (unique), `first_name`, `username`, `balance`, `role` (`user`|`admin`), `created_at`, `is_banned`.
- **categories** — `id`, `name`, `slug` (unique), `icon`, `sort_order`.
- **products** — `id`, `category_id` → categories (`ON DELETE SET NULL`), `name`, `description`, `price`, `stock`, `tags` (`text[]`), `data` (secret payload), `is_active`, `created_at`.
- **transactions** — `id`, `user_id` → users (`CASCADE`), `type` (`deposit`|`purchase`), `amount`, `status` (`pending`|`completed`|`failed`), `payment_id` (NowPayments id), `product_id`, `created_at`.
- **purchases** — `id`, `user_id` → users (`CASCADE`), `product_id`, `product_data` (copy of `products.data` at purchase time), `price`, `created_at`.

Key rule: `products.data` is **never** returned by the public product endpoints. It's copied into `purchases.product_data` and only returned to the buyer (purchase response or `GET /api/purchase/:id/data`).

## Authentication

Telegram WebApp `initData` HMAC validation (`backend/src/middleware/auth.ts`):

1. Frontend sends `Authorization: tma <initData>` (legacy fallback: `x-telegram-init-data` header).
2. Middleware validates the HMAC-SHA256 signature against `BOT_TOKEN` (`secret = HMAC_SHA256("WebAppData", BOT_TOKEN)`), timing-safe compared.
3. User is found-or-created by `telegram_id`; `req.user` is attached. Banned users → 403.
4. `adminMiddleware` runs after auth and requires `role === 'admin'`.

**Dev bypass:** when `NODE_ENV !== 'production'` AND `BOT_TOKEN` is unset, header `x-dev-telegram-id: <id>` authenticates locally (find-or-create). Never works in prod or when a token is configured.

## Money flows

**Deposit** (`POST /api/deposit`): insert `pending` transaction → create NowPayments payment → store `payment_id` → return pay address + QR. Balance is **not** credited here.

**IPN** (`POST /api/webhooks/nowpayments`): verify `x-nowpayments-sig` HMAC-SHA512 over the alphabetically-sorted JSON. On `payment_status === 'finished'`, in one DB transaction: mark transaction `completed`, credit balance — idempotent (skips if already `completed`) — then notify the user via the bot. `failed`/`expired`/`refunded` → mark `failed`. Other statuses stay pending.

**Purchase** (`POST /api/purchase/:productId`): single DB transaction with `SELECT ... FOR UPDATE` on product + user. Checks active, stock > 0, balance ≥ price. Deducts balance, decrements stock, inserts purchase (copies `data`) + a `completed` purchase transaction, returns the product `data`. Error codes → 404 / 409 (out of stock) / 402 (insufficient balance).

## Connection handling (serverless)

`backend/src/db/index.ts` uses **lazy** initialization via a Proxy so the function boots even before `DATABASE_URL` is set (e.g. `/api/health` works regardless). Supabase pooler URLs contain a dot in the username (`postgres.<ref>`), which breaks some connection-string parsers — so for `*.pooler.supabase.com` URLs the code parses the URL manually and passes discrete params. Pool is `max: 1` for the pooler (serverless-friendly). SSL is on for any non-localhost host.

## Hosting topology

- **Frontend**: Vercel static deploy of `frontend/`, SPA rewrite to `index.html`.
- **Backend**: Vercel serverless, `backend/vercel.json` routes `/(.*)` → `api/index.ts`.
- **DB**: Supabase PostgreSQL (project `zidlpvidptleqwncvsxi`) via the pooler in prod; docker-compose Postgres locally.
- **Repo**: `vadimpahnuk-rgb/blaff-shop`, `main` → production. See [DEPLOY.md](./DEPLOY.md).

See also: [API.md](./API.md) · [DEPLOY.md](./DEPLOY.md) · [DEVELOPMENT.md](./DEVELOPMENT.md)
