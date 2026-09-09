import type { NextFunction, Request, Response } from 'express';
import { resolveProductScope } from '../utils/productScope';
import { AppError } from './errorHandler';

export function requireProductAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }
  req.productScope = resolveProductScope(req.user);
  next();
}
