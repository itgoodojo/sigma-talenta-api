import type { UserRole } from '../models/User';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  productId: string | null;
}

export type ProductScope =
  // `defaultProductId` is the X-Product header resolved for a SUPER_ADMIN. It is
  // the create target when the client sends no explicit productId; reads stay
  // cross-product.
  | { type: 'all'; defaultProductId?: string }
  | { type: 'single'; productId: string };

export interface ProductContext {
  id: string;
  code: string;
  name: string;
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      productScope?: ProductScope;
      product?: ProductContext;
    }
  }
}
