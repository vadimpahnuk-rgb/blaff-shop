# Deployment — BLA AFF SHOP

Production runs on **Vercel** (two projects: backend + frontend) backed by **Supabase** PostgreSQL, deployed from GitHub `vadimpahnuk-rgb/blaff-shop`.

```
GitHub (vadimpahnuk-rgb/blaff-shop)
   main  ─────────────► Vercel production
   dev / PR branches ─► Vercel preview deployments
            backend project  → blaff-backend.vercel.app  (serverless Express)
            frontend project → blaff-frontend.vercel.app (static SPA)
                                   │
                              Supabase Postgres (project zidlpvidptleqwncvsxi, via pooler)
```

## Environments

| | Production | Development |
|---|------------|-------------|
| Branch | `main` | `dev` (+ PR branches) |
| Vercel | Production deploy | Preview deploy |
| Backend URL | `blaff-backend.vercel.app` | preview `*.vercel.app` URL |
| Frontend URL | `blaff-frontend.vercel.app` | preview `*.vercel.app` URL |
| Database | Supabase `zidlpvidptleqwncvsxi` (pooler) | local docker PG, or a separate Supabase project (see below) |

**Do not point dev/preview at the production database** — purchases mutate balances and stock. Use local PG for day-to-day dev; if you need a shared dev DB, create a separate Supabase project and set its URL on the preview environment.

## Current wiring status (verified 2026-06-30)
Vercel team `vadym3`, owner `vadimpahnuk@gmail.com`.

| Item | State |
|------|-------|
| `blaff-backend` ↔ GitHub | **Connected** (`vadimpahnuk-rgb/blaff-shop`, production branch `main`). Branch pushes build previews automatically. `dev` preview is live. |
| `blaff-frontend` ↔ GitHub | **Not connected** (CLI-deployed). Branch pushes do **not** auto-deploy. Connect the repo in Vercel → Project → Settings → Git, or deploy previews via `vercel` CLI. |
| Backend env vars | All scoped to **`production` only** (`DATABASE_URL`, `BOT_TOKEN`, `NOWPAYMENTS_*`, `APP_URL`, `PUBLIC_URL`, `CORS_ORIGIN`, `NODE_ENV`, `SUPPORT_HANDLE`). |
| Preview backend | Boots and serves `/api/health`, but **DB/bot/payment routes are inert** — no preview-scoped env vars yet. |
| Preview access | Behind Vercel **Deployment Protection** (preview URLs redirect to login). |

To make the `dev` preview fully functional: add **Preview-scoped** env vars to `blaff-backend` — at minimum a `DATABASE_URL` pointing at a **separate** dev database (never prod), plus `NODE_ENV=development` and a `CORS_ORIGIN` for the dev frontend.

## Deploy flow
1. Work on `dev` (or a feature branch off `dev`). Push → Vercel builds a **preview**.
2. Open a PR `dev → main`. Verify the preview.
3. Merge to `main` → Vercel auto-deploys **production**.

Vercel detects each project's root via its `vercel.json`. Backend `backend/vercel.json` builds `api/index.ts` and routes everything to it; frontend `frontend/vercel.json` rewrites all paths to `index.html` (SPA).

## Environment variables (Vercel)

Set these in each Vercel project's **Settings → Environment Variables**. Never commit real values — `backend/.env.example` and `frontend/.env.example` hold placeholders only.

### Backend project
| Var | Example / note |
|-----|----------------|
| `DATABASE_URL` | Supabase **pooler** connection string (`...pooler.supabase.com`). Code parses the dotted username automatically. |
| `BOT_TOKEN` | Telegram bot token from BotFather. |
| `NOWPAYMENTS_API_KEY` | NowPayments API key. |
| `NOWPAYMENTS_IPN_SECRET` | IPN secret (HMAC verification). |
| `NOWPAYMENTS_PAY_CURRENCY` | `usdttrc20` (default). |
| `APP_URL` | Frontend Mini App URL (`https://blaff-frontend.vercel.app`). |
| `PUBLIC_URL` | This backend's URL (`https://blaff-backend.vercel.app`) — builds the IPN callback. |
| `CORS_ORIGIN` | Frontend origin. |
| `SUPPORT_HANDLE` | `@blaff_support`. |
| `NODE_ENV` | `production`. |

`VERCEL` is set automatically by Vercel and disables `app.listen()`.

### Frontend project
| Var | Note |
|-----|------|
| `VITE_API_URL` | `https://blaff-backend.vercel.app/api` (baked at build time). |

## Post-deploy wiring (one-time per environment)
1. **DB schema**: run the migration against the target DB. Either locally with `DATABASE_URL` pointed at Supabase (`cd backend && npm run migrate && npm run seed`), or via the Supabase SQL editor using the DDL in `backend/src/db/migrate.ts`.
2. **Set admin**: `ADMIN_TELEGRAM_ID=<your id> npm run seed`, or promote yourself via SQL: `UPDATE users SET role='admin' WHERE telegram_id=<id>;`
3. **Telegram webhook** → backend:
   ```bash
   curl "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=https://blaff-backend.vercel.app/api/webhooks/telegram"
   ```
4. **NowPayments IPN**: set the IPN callback to `https://blaff-backend.vercel.app/api/webhooks/nowpayments` (also auto-sent per-payment when `PUBLIC_URL` is set), and confirm the IPN secret matches `NOWPAYMENTS_IPN_SECRET`.
5. **BotFather** → set the Mini App / menu button URL to the frontend.

## Verify a deployment
```bash
curl https://blaff-backend.vercel.app/api/health           # {status:"ok",...}
curl https://blaff-backend.vercel.app/api/categories       # seeded categories
# open the frontend URL; in Telegram, /start the bot and tap the shop button
```

## Setting up the `dev` environment (separate Supabase, optional)
1. Create a new Supabase project (separate from prod `zidlpvidptleqwncvsxi`).
2. In the Vercel **backend** project, add the new `DATABASE_URL` scoped to the **Preview** environment only (Production keeps the prod URL).
3. Run `npm run migrate && npm run seed` against the dev DB.
4. Push the `dev` branch — its preview deploy now uses the dev database.

## Rollback
- Vercel: redeploy a previous successful deployment from the dashboard (instant).
- Code: revert the offending commit on `main` and push.
- DB: migration is additive (`CREATE TABLE IF NOT EXISTS`), so redeploys won't drop data.

## Secrets hygiene
- `.env`, `backend/.env`, `*.env.local` are gitignored — keep real tokens there and in Vercel only.
- If a token (Vercel, GitHub PAT, bot, NowPayments, DB) is ever shared in plaintext, rotate it.

See also: [ARCHITECTURE.md](./ARCHITECTURE.md) · [DEVELOPMENT.md](./DEVELOPMENT.md) · [API.md](./API.md)
