import type { Request, Response, NextFunction } from 'express';

/**
 * Admin guard. Must run AFTER authMiddleware (which sets req.user).
 * Returns 403 if the user is missing or not an admin.
 */
export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}

export default adminMiddleware;
