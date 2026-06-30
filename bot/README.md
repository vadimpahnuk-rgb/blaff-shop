# BLA AFF SHOP — Telegram Bot

The bot is implemented inside the **backend** at [`backend/src/bot.ts`](../backend/src/bot.ts),
not as a standalone process. This is deliberate:

- It needs the **database** for `/balance`.
- It must push **deposit-confirmation notifications**, which are triggered by the
  NowPayments IPN handler that also lives in the backend.
- The whole stack deploys to **Vercel serverless**, where a long-running polling
  process can't run — webhook mode is required.

## How it works

- Telegraf instance: `backend/src/bot.ts` (created only when `BOT_TOKEN` is set).
- Updates arrive at `POST /api/webhooks/telegram` and are passed to
  `bot.handleUpdate()` (see `backend/src/routes/webhooks.ts`).
- Commands: `/start` (welcome + WebApp button), `/balance`, `/support`.
- Notifications: `notifyDepositConfirmed()` / `notifyUser()` exported from `bot.ts`.

## Setup (after deploy)

Register the webhook (replace the host with the deployed backend URL):

```
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<backend-domain>/api/webhooks/telegram"
```

Set `APP_URL` (frontend Mini App URL) in the backend environment so the WebApp
button opens the store.

## Local development (optional polling)

For quick local testing without a public webhook, run the backend and use a
tunnel (e.g. ngrok) to expose `/api/webhooks/telegram`, or add a small
`bot.launch()` script that imports the instance from `backend/src/bot.ts`.
