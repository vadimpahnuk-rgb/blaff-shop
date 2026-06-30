import type { Request } from 'express';

/**
 * Minimal authenticated-user shape attached to req.user by the auth middleware.
 */
export interface AuthUser {
  id: number;
  telegram_id: number;
  role: string;
  balance: number;
  is_banned: boolean;
}

/**
 * Express Request guaranteed to carry an authenticated user.
 * Routes mounted behind authMiddleware can cast/treat req as UserRequest.
 */
export interface UserRequest extends Request {
  user: AuthUser;
}

/**
 * Parsed Telegram WebApp user (from initData `user` field).
 */
export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

// Augment Express' Request type so `req.user` is available everywhere.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
