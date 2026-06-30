# Local Development — BLA AFF SHOP

## Prerequisites
- Node.js 20+ and npm
- Docker (for local PostgreSQL) — or any PostgreSQL 16

## 1. Database (docker)
```bash
docker compose up -d        # starts Postgres 16 on :5432 (db blaff / blauser / blapass)
docker compose ps           # should show blaff-db healthy
```
Local connection string:
```
postgresql://blauser:blapass@localhost:5432/blaff
```

## 2. Backend
```bash
cd backend
npm install
cp .env.example .env        # then edit (see below)
npm run migrate             # create tables (idempotent raw SQL)
npm run seed                # admin user + categories + sample products
npm run dev                 # tsx watch → http://localhost:3001
```

Minimal local `backend/.env`:
```
DATABASE_URL=postgresql://blauser:blapass@localhost:5432/blaff
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
# Leave BOT_TOKEN unset locally to enable the x-dev-telegram-id auth bypass.
# NOWPAYMENTS_* optional — /api/deposit returns 503 without them.
```

Health check: `curl http://localhost:3001/api/health`

### Auth without Telegram
With `BOT_TOKEN` unset and `NODE_ENV != production`, authenticate any request with a header instead of real Telegram init data:
```bash
curl http://localhost:3001/api/user/balance -H "x-dev-telegram-id: 123456789"
```
`123456789` is the default seeded admin id (`ADMIN_TELEGRAM_ID`), so that id also passes admin routes.

## 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # set VITE_API_URL=http://localhost:3001/api
npm run dev                 # vite → http://localhost:5173
```
Outside Telegram, `window.Telegram.WebApp.initData` is empty, so no `Authorization` header is sent and auth-protected calls 401. For full local auth testing, either use the backend directly with `x-dev-telegram-id`, or run the Mini App through Telegram against a tunnel (below).

## 4. (Optional) Test inside Telegram
To exercise real init-data auth and the bot end-to-end locally:
1. Expose the backend: `ngrok http 3001` (or `cloudflared tunnel`).
2. Set `BOT_TOKEN`, `APP_URL` (frontend URL), `PUBLIC_URL` (tunnel URL) in `backend/.env`.
3. Point the Telegram webhook at `<tunnel>/api/webhooks/telegram`:
   ```bash
   curl "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=<tunnel>/api/webhooks/telegram"
   ```
4. Open the bot, `/start`, tap the WebApp button.

## Common commands
| Command | Dir | What |
|---------|-----|------|
| `docker compose up -d` | root | Start local Postgres |
| `docker compose down` | root | Stop (keep data) |
| `docker compose down -v` | root | Stop + **wipe** data (`pgdata` volume) |
| `npm run dev` | backend | API with watch |
| `npm run migrate` | backend | Apply schema (safe to re-run) |
| `npm run seed` | backend | Seed admin/categories/products |
| `npm run build` | backend | `tsc` typecheck/build |
| `npm run dev` | frontend | Vite dev server |
| `npm run build` | frontend | `tsc -b && vite build` |
| `npm run lint` | frontend | oxlint |

## Project layout
```
backend/
  api/index.ts            Vercel serverless entry (re-exports app)
  src/index.ts            Express app + route mounting
  src/bot.ts              Telegraf bot (webhook mode)
  src/db/{schema,index,migrate,seed}.ts
  src/middleware/{auth,admin}.ts
  src/routes/{auth,categories,products,user,purchase,deposit,webhooks}.ts
  src/routes/admin/index.ts
frontend/
  src/api/                axios client + per-resource calls
  src/pages/ src/admin/ src/components/ src/hooks/
docker-compose.yml        Local Postgres
docs/                     This documentation
```

## Branch / env workflow
- `main` → production (auto-deploys to Vercel prod).
- `dev` → integration branch; Vercel auto-creates **preview** deployments for it and for PR branches.
- Local → docker Postgres (data is disposable; re-seed freely).

See [DEPLOY.md](./DEPLOY.md) for the full two-environment setup, and [ARCHITECTURE.md](./ARCHITECTURE.md) for how the pieces fit.
