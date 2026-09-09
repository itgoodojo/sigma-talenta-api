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
