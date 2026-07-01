import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, referrals } from '../db/schema';
import type { AuthUser, TelegramWebAppUser } from '../types';

const BOT_TOKEN = process.env.BOT_TOKEN || '';

/**
 * Validate the Telegram WebApp initData string.
 * Returns the parsed key/value map if valid, otherwise null.
 *
 * Algorithm (per Telegram docs):
 *   secret_key = HMAC_SHA256(key="WebAppData", msg=bot_token)
 *   hash       = HMAC_SHA256(key=secret_key, msg=data_check_string)
 *   data_check_string = sorted "key=value" pairs (excluding hash) joined by "\n"
 */
export function validateInitData(
  initData: string,
  botToken: string,
): Record<string, string> | null {
  if (!initData || !botToken) return null;

  // 2. Parse query string manually (split on '&', then '=' with URI decoding).
  const pairs: Record<string, string> = {};
  for (const part of initData.split('&')) {
    if (!part) continue;
    const eqIdx = part.indexOf('=');
    if (eqIdx === -1) continue;
    const key = decodeURIComponent(part.slice(0, eqIdx));
    const value = decodeURIComponent(part.slice(eqIdx + 1));
    pairs[key] = value;
  }

  // 3. Extract hash.
  const providedHash = pairs['hash'];
  if (!providedHash) return null;

  // 4 + 5. Sort remaining pairs by key, build data_check_string.
  const dataCheckString = Object.keys(pairs)
    .filter((k) => k !== 'hash')
    .sort()
    .map((k) => `${k}=${pairs[k]}`)
    .join('\n');

  // 6. secret_key = HMAC-SHA256('WebAppData', bot_token)
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // 7. hash = HMAC-SHA256(secret_key, data_check_string)
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // 8. Timing-safe compare.
  const a = Buffer.from(calculatedHash, 'hex');
  const b = Buffer.from(providedHash, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  return pairs;
}

/**
 * Record a referral for a freshly-created user based on the Telegram
 * `start_param` (`ref_<referrerUserId>`). Best-effort: any malformed value,
 * self-referral, or missing referrer is silently ignored.
 */
async function trackReferral(
  newUserId: number,
  parsed?: Record<string, string>,
): Promise<void> {
  const startParam = parsed?.['start_param'];
  if (!startParam || !startParam.startsWith('ref_')) return;

  const referrerId = Number(startParam.slice(4));
  if (!Number.isInteger(referrerId) || referrerId <= 0) return;

  // No self-referral.
  if (referrerId === newUserId) return;

  try {
    // Referrer must exist.
    const [referrer] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, referrerId))
      .limit(1);
    if (!referrer) return;

    // UNIQUE(referred_id) also guards against duplicates at the DB level.
    await db
      .insert(referrals)
      .values({ referrerId, referredId: newUserId })
      .onConflictDoNothing();
  } catch {
    // Silently skip — a broken referral must never block auth.
  }
}

/**
 * Find an existing user by telegram_id or create one. When a new user is
 * created, the validated initData map (if provided) is inspected for a
 * `start_param` referral tag.
 */
async function findOrCreateUser(
  tgUser: TelegramWebAppUser,
  parsed?: Record<string, string>,
): Promise<AuthUser> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.telegramId, tgUser.id))
    .limit(1);

  let row = existing[0];

  if (!row) {
    const [inserted] = await db
      .insert(users)
      .values({
        telegramId: tgUser.id,
        firstName: tgUser.first_name ?? null,
        username: tgUser.username ?? null,
      })
      .returning();
    row = inserted;

    await trackReferral(row.id, parsed);
  }

  return {
    id: row.id,
    telegram_id: row.telegramId,
    role: row.role,
    balance: Number(row.balance),
    is_banned: row.isBanned,
  };
}

/**
 * Extract the Telegram WebApp initData string from the request.
 *
 * Primary scheme (matches the frontend api/client.ts): the `Authorization`
 * header carrying `tma <initData>` — the official Telegram Mini App convention.
 * Falls back to the legacy `x-telegram-init-data` header for compatibility.
 */
function extractInitData(req: Request): string | undefined {
  const auth = req.header('authorization');
  if (auth && auth.startsWith('tma ')) {
    return auth.slice(4).trim();
  }
  return req.header('x-telegram-init-data') ?? undefined;
}

/**
 * Auth middleware: validates the Telegram WebApp initData (sent as
 * `Authorization: tma <initData>`) and attaches req.user. Returns 401 on
 * invalid data, 403 if the user is banned.
 *
 * Dev convenience: when NODE_ENV !== 'production' and no BOT_TOKEN is set,
 * an `x-dev-telegram-id` header can be used to authenticate locally.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const initData = extractInitData(req);

    // ---- Local dev bypass (only when explicitly unconfigured) ----
    if (
      process.env.NODE_ENV !== 'production' &&
      !BOT_TOKEN &&
      req.header('x-dev-telegram-id')
    ) {
      const devId = Number(req.header('x-dev-telegram-id'));
      const user = await findOrCreateUser({ id: devId, first_name: 'Dev' });
      if (user.is_banned) {
        res.status(403).json({ error: 'User is banned' });
        return;
      }
      req.user = user;
      next();
      return;
    }

    if (!initData) {
      res.status(401).json({ error: 'Missing Telegram init data (Authorization: tma <initData>)' });
      return;
    }

    const parsed = validateInitData(initData, BOT_TOKEN);
    if (!parsed) {
      res.status(401).json({ error: 'Invalid Telegram init data' });
      return;
    }

    // Parse the `user` JSON field from the validated payload.
    let tgUser: TelegramWebAppUser;
    try {
      tgUser = JSON.parse(parsed['user'] ?? '');
    } catch {
      res.status(401).json({ error: 'Invalid user payload in init data' });
      return;
    }

    if (!tgUser?.id) {
      res.status(401).json({ error: 'Missing user id in init data' });
      return;
    }

    const user = await findOrCreateUser(tgUser, parsed);

    if (user.is_banned) {
      res.status(403).json({ error: 'User is banned' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export default authMiddleware;
