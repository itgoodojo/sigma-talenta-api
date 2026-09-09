import type { NextFunction, Request, Response } from 'express';
import Product from '../models/Product';
import { AppError } from './errorHandler';

export function resolveProduct(req: Request, _res: Response, next: NextFunction): void {
  const code = req.header('X-Product');
  if (!code) {
    next(new AppError(400, 'PRODUCT_REQUIRED', 'X-Product header is required'));
    return;
  }

  Product.findOne({ where: { code } })
    .then((product) => {
      if (!product) {
        next(new AppError(404, 'PRODUCT_NOT_FOUND', 'Unknown product'));
        return;
      }
      req.product = {
        id: product.id,
        code: product.code,
        name: product.name,
        status: product.status,
      };
      next();
    })
    .catch(next);
}
