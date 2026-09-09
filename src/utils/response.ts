import type { Response } from 'express';

export function ok<T>(
  res: Response,
  data: T,
  message = 'Success',
  meta?: Record<string, unknown>,
): void {
  const body: Record<string, unknown> = { success: true, data, message };
  if (meta) body.meta = meta;
  res.status(200).json(body);
}

export function created<T>(res: Response, data: T, message = 'Created'): void {
  res.status(201).json({ success: true, data, message });
}
