import type { Request } from 'express';
import AuditLog from '../models/AuditLog';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH';

export interface AuditContext {
  userId: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function auditContextFromRequest(req: Request): AuditContext {
  return {
    userId: req.user?.id ?? null,
    ipAddress: req.ip ?? null,
    userAgent: req.get('user-agent') ?? null,
  };
}

export async function recordAudit(params: {
  userId?: string | null;
  productId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    await AuditLog.create({
      userId: params.userId ?? null,
      productId: params.productId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      metadata: params.metadata ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });
  } catch (err) {
    // Auditing must never break the main request flow.
    console.error('Failed to record audit log:', err);
  }
}

export async function recordEntityAudit(
  audit: AuditContext | undefined,
  action: AuditAction,
  entity: string,
  entityId: string,
  productId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!audit) return;
  await recordAudit({
    userId: audit.userId,
    productId,
    action,
    entity,
    entityId,
    metadata,
    ipAddress: audit.ipAddress,
    userAgent: audit.userAgent,
  });
}

// Map a status transition to PUBLISH / UNPUBLISH / UPDATE.
// `publishedValue` is PUBLISHED for articles/pages, ACTIVE for faqs/services/industries.
export function auditActionForStatusChange(
  oldStatus: string,
  newStatus: string,
  publishedValue: string,
): AuditAction {
  if (oldStatus === newStatus) return 'UPDATE';
  if (newStatus === publishedValue) return 'PUBLISH';
  if (oldStatus === publishedValue) return 'UNPUBLISH';
  return 'UPDATE';
}
