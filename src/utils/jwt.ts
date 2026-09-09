import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../models/User';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  productId: string | null;
}

function getSecret(): string {
  if (env.jwtSecret) return env.jwtSecret;
  if (env.nodeEnv === 'production') {
    throw new Error('JWT_SECRET is not configured');
  }
  // Development-only fallback so local dev works without a configured secret.
  return 'dev-secret-change-me-in-prod';
}

export function signToken(payload: AuthTokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, getSecret(), options);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getSecret()) as AuthTokenPayload;
}
