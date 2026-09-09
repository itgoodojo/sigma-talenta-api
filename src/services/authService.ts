import User from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import { signToken } from '../utils/jwt';
import { comparePassword } from '../utils/password';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  productId: string | null;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    productId: user.productId,
  };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(403, 'ACCOUNT_DISABLED', 'Account is disabled');
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    productId: user.productId,
  });

  return { token, user: toAuthUser(user) };
}
