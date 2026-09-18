import type { NextFunction, Request, Response } from 'express';
import Product from '../models/Product';
import { resolveProductScope } from '../utils/productScope';
import { AppError } from './errorHandler';

/**
 * Resolves the caller's product scope, and for SUPER_ADMIN also resolves the
 * `X-Product` header into `req.product`.
 *
 * SUPER_ADMIN has scope `all`, so creates would otherwise demand an explicit
 * `productId` in the body — which a single-product CMS front end has no way of
 * knowing. Falling back to the header lets those clients create records while
 * SUPER_ADMIN keeps cross-product read access.
 */
export function requireProductAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }

  let scope;
  try {
    scope = resolveProductScope(req.user);
  } catch (err) {
    next(err);
    return;
  }
  req.productScope = scope;

  const code = req.header('X-Product');
  if (scope.type !== 'all' || !code) {
    next();
    return;
  }

  Product.findOne({ where: { code } })
    .then((product) => {
      if (!product) {
        next(new AppError(404, 'PRODUCT_NOT_FOUND', 'Unknown product'));
        return;
      }
      req.productScope = { type: 'all', defaultProductId: product.id };
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
