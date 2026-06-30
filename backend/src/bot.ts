import { Telegraf, Markup } from 'telegraf';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from './db/schema';

/**
 * BLA AFF SHOP — Telegram bot (Telegraf).
 *
 * Runs in webhook mode inside the backend so it shares the database connection
 * (for /balance) and can push notifications (deposit confirmations). Updates are
 * delivered to POST /api/webhooks/telegram and handed to bot.handleUpdate().
 *
 * The bot is only instantiated when BOT_TOKEN is present, so the API still boots
 * in environments where the token is not configured.
 */

const BOT_TOKEN = process.env.BOT_TOKEN || '';
// Frontend Mini App URL — must be https for the WebApp button to work.
const APP_URL = process.env.APP_URL || '';
const SUPPORT_HANDLE = process.env.SUPPORT_HANDLE || '@blaff_support';

export const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;

if (bot) {
  /* ---- /start — welcome + WebApp button ---- */
  bot.start(async (ctx) => {
    const name = ctx.from?.first_name ?? 'друже';
    const text =
      `👋 Вітаємо у *BLA AFF SHOP*, ${name}!\n\n` +
      `Магазин цифрових товарів для медіабаєрів: акаунти Facebook, проксі, ` +
      `Business Manager та інше.\n\n` +
      `Натисни кнопку нижче, щоб відкрити магазин 👇`;

    const keyboard = APP_URL
      ? Markup.inlineKeyboard([
          [Markup.button.webApp('🛒 Відкрити магазин', APP_URL)],
        ])
      : undefined;

    await ctx.replyWithMarkdown(text, keyboard);
  });

  /* ---- /balance — current balance ---- */
  bot.command('balance', async (ctx) => {
    const tgId = ctx.from?.id;
    if (!tgId) return;

    const [row] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.telegramId, tgId))
      .limit(1);

    if (!row) {
      await ctx.reply(
        'Акаунт ще не створено. Відкрий магазин через /start, щоб зареєструватися.',
      );
      return;
    }

    await ctx.replyWithMarkdown(
      `💰 Твій баланс: *$${Number(row.balance).toFixed(2)}*`,
    );
  });

  /* ---- /support — support contacts ---- */
  bot.command('support', async (ctx) => {
    await ctx.replyWithMarkdown(
      `🛟 *Підтримка BLA AFF SHOP*\n\n` +
        `З питань щодо замовлень, оплати чи заміни товару пиши: ${SUPPORT_HANDLE}\n\n` +
        `Ми на зв'язку щодня.`,
    );
  });

  bot.catch((err, ctx) => {
    console.error(`[bot] error for update ${ctx.update.update_id}:`, err);
  });
}

/**
 * Notify a user that their deposit was confirmed and balance topped up.
 * Safe no-op when the bot is not configured.
 */
export async function notifyDepositConfirmed(
  telegramId: number,
  amountUsd: number,
  newBalance: number,
): Promise<void> {
  if (!bot) return;
  try {
    await bot.telegram.sendMessage(
      telegramId,
      `✅ Поповнення на *$${amountUsd.toFixed(2)}* підтверджено!\n\n` +
        `💰 Новий баланс: *$${newBalance.toFixed(2)}*`,
      { parse_mode: 'Markdown' },
    );
  } catch (err) {
    console.error('[bot] failed to send deposit notification:', err);
  }
}

/**
 * Generic direct-message helper (e.g. delivering purchased product data).
 * Safe no-op when the bot is not configured.
 */
export async function notifyUser(
  telegramId: number,
  message: string,
): Promise<void> {
  if (!bot) return;
  try {
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('[bot] failed to send message:', err);
  }
}

export default bot;
