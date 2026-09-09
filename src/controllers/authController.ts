import type { Request, Response } from 'express';
import { login } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await login(email, password);
  ok(res, result, 'Login successful');
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  ok(res, req.user, 'Success');
});

export const logoutHandler = asyncHandler(async (_req: Request, res: Response) => {
  // Stateless JWT — no server-side revocation. The client discards its token.
  ok(res, null, 'Logout successful');
});
