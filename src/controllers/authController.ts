import type { Request, Response } from 'express';
import { login } from '../services/authService';
import { recordAudit } from '../services/auditService';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/response';

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await login(email, password);

  await recordAudit({
    userId: result.user.id,
    action: 'LOGIN',
    entity: 'User',
    entityId: result.user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  ok(res, result, 'Login successful');
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  ok(res, req.user, 'Success');
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  await recordAudit({
    userId: req.user?.id ?? null,
    action: 'LOGOUT',
    entity: 'User',
    entityId: req.user?.id ?? null,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Stateless JWT — no server-side revocation. The client discards its token.
  ok(res, null, 'Logout successful');
});
