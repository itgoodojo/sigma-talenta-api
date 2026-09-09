import type { UserRole } from '../models/User';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  productId: string | null;
}

export type ProductScope =
  | { type: 'all' }
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
