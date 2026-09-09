import Product from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import type { AuthenticatedUser, ProductScope } from '../types/express';

export function resolveProductScope(user: AuthenticatedUser): ProductScope {
  if (user.role === 'SUPER_ADMIN') return { type: 'all' };
  if (!user.productId) {
    throw new AppError(403, 'FORBIDDEN', 'Product admin has no assigned product');
  }
  return { type: 'single', productId: user.productId };
}

export function assertProductInScope(scope: ProductScope | undefined, productId: string): void {
  if (!scope || scope.type === 'all') return;
  if (scope.productId !== productId) {
    throw new AppError(403, 'FORBIDDEN', 'You do not have access to this product');
  }
}

// For create: PRODUCT_ADMIN is forced to their own product (client value ignored).
// SUPER_ADMIN must supply a valid productId.
export async function resolveProductIdForCreate(
  scope: ProductScope | undefined,
  clientProductId?: string,
): Promise<string> {
  if (scope && scope.type === 'single') return scope.productId;
  if (!clientProductId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'productId is required');
  }
  const product = await Product.findByPk(clientProductId);
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }
  return clientProductId;
}
