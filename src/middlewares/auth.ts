import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      productId: payload.productId,
    };
    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token'));
  }
}
