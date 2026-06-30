# BLA AFF SHOP

A Telegram Mini App store for digital goods (Facebook accounts, proxies, Business Managers, agency cabinets, and more) aimed at media buyers. Users open the shop from a Telegram bot, top up a balance with crypto (NowPayments), and buy products whose access data is delivered instantly after purchase.

## Stack
- **Frontend** — React 19 + Vite + Tailwind v4 (SPA, Telegram WebApp)
- **Backend** — Express 5 + TypeScript + Drizzle ORM
- **Bot** — Telegraf (webhook mode, in-process with the API)
- **Database** — PostgreSQL (Supabase in prod, docker locally)
- **Payments** — NowPayments (crypto, default USDT-TRON)
- **Hosting** — Vercel (serverless backend + static frontend), GitHub `vadimpahnuk-rgb/blaff-shop`

## Quick start (local)
```bash
docker compose up -d                    # local Postgres on :5432
cd backend && npm install && cp .env.example .env
npm run migrate && npm run seed && npm run dev   # API on :3001
cd ../frontend && npm install && cp .env.example .env.local
npm run dev                             # UI on :5173
```
Authenticate locally without Telegram using the `x-dev-telegram-id` header (see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)).

## Documentation
| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data model, auth, money flows |
| [docs/API.md](docs/API.md) | All REST endpoints with examples |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local setup, commands, project layout |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Vercel + Supabase deploy, env vars, dev/prod workflow |

## Production
- Frontend: https://blaff-frontend.vercel.app
- Backend: https://blaff-backend.vercel.app
- Bot: [@bla_fbshop_bot](https://t.me/bla_fbshop_bot)

## Repository layout
```
backend/    Express API + Telegraf bot + Drizzle DB layer
frontend/   React/Vite Mini App (storefront + admin panel)
bot/        Bot notes
docs/        Project documentation
docker-compose.yml   Local PostgreSQL
```

> Digital-goods marketplace. Keep real secrets in `.env` files and Vercel env vars only — never commit them.
