import type { NextFunction, Request, Response } from 'express';
import {
  DatabaseError,
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError as SequelizeValidationError,
} from 'sequelize';
import { ZodError } from 'zod';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, details: err.details ?? {} },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: err.flatten() },
    });
    return;
  }

  if (err instanceof UniqueConstraintError) {
    res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'Resource already exists', details: {} },
    });
    return;
  }

  if (err instanceof ForeignKeyConstraintError) {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'Related resource does not exist or is still in use',
        details: {},
      },
    });
    return;
  }

  if (err instanceof SequelizeValidationError) {
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.errors.map((e) => e.message),
      },
    });
    return;
  }

  if (err instanceof DatabaseError) {
    const pgCode = (err.parent as { code?: string } | undefined)?.code;
    if (pgCode === '22P02') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_PARAMETER', message: 'Invalid parameter value', details: {} },
      });
      return;
    }
  }

  // Do not leak stack traces or raw database errors in production.
  console.error(err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', details: {} },
  });
}
