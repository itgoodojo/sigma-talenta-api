import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { UserRole } from '../models/User';
import { AppError } from './errorHandler';

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
      return;
    }
    next();
  };
}
