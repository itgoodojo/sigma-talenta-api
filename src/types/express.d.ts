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

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      productScope?: ProductScope;
    }
  }
}
