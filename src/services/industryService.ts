import { UniqueConstraintError } from 'sequelize';
import Industry from '../models/Industry';
import Product from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import type { ProductScope } from '../types/express';
import { assertProductInScope, resolveProductIdForCreate } from '../utils/productScope';
import { auditActionForStatusChange, recordEntityAudit, type AuditContext } from './auditService';

const PRODUCT_INCLUDE = { model: Product, as: 'product', attributes: ['id', 'code', 'name'] };

export interface CreateIndustryInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  productId?: string;
}

export type UpdateIndustryInput = Partial<CreateIndustryInput>;

export interface IndustryListOptions {
  page: number;
  limit: number;
  status?: string;
  productId?: string;
}

function buildWhere(scope: ProductScope | undefined, opts: { status?: string; productId?: string }) {
  const where: Record<string, unknown> = {};
  if (scope && scope.type === 'single') where.productId = scope.productId;
  else if (opts.productId) where.productId = opts.productId;
  if (opts.status) where.status = opts.status;
  return where;
}

function toConflict(): AppError {
  return new AppError(409, 'CONFLICT', 'Slug already exists for this product');
}

export async function listIndustries(scope: ProductScope | undefined, opts: IndustryListOptions) {
  const where = buildWhere(scope, opts);
  const { rows, count } = await Industry.findAndCountAll({
    where,
    include: [PRODUCT_INCLUDE],
    order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getIndustryById(scope: ProductScope | undefined, id: string): Promise<Industry> {
  const industry = await Industry.findByPk(id, { include: [PRODUCT_INCLUDE] });
  if (!industry) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Industry not found');
  assertProductInScope(scope, industry.productId);
  return industry;
}

export async function createIndustry(
  scope: ProductScope | undefined,
  input: CreateIndustryInput,
  audit?: AuditContext,
): Promise<Industry> {
  const productId = await resolveProductIdForCreate(scope, input.productId);
  try {
    const industry = await Industry.create({
      productId,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      image: input.image ?? null,
      sortOrder: input.sortOrder ?? 0,
      status: input.status ?? 'ACTIVE',
    });
    await recordEntityAudit(audit, 'CREATE', 'Industry', industry.id, industry.productId);
    return industry;
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw toConflict();
    throw err;
  }
}

export async function updateIndustry(
  scope: ProductScope | undefined,
  id: string,
  input: UpdateIndustryInput,
  audit?: AuditContext,
): Promise<Industry> {
  const industry = await getIndustryById(scope, id);
  const oldStatus = industry.status;
  try {
    await industry.update({
      name: input.name ?? industry.name,
      slug: input.slug ?? industry.slug,
      description: input.description !== undefined ? input.description : industry.description,
      image: input.image !== undefined ? input.image : industry.image,
      sortOrder: input.sortOrder ?? industry.sortOrder,
      status: input.status ?? industry.status,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw toConflict();
    throw err;
  }
  const action = auditActionForStatusChange(oldStatus, industry.status, 'ACTIVE');
  await recordEntityAudit(audit, action, 'Industry', industry.id, industry.productId);
  return industry;
}

export async function deleteIndustry(
  scope: ProductScope | undefined,
  id: string,
  audit?: AuditContext,
): Promise<void> {
  const industry = await getIndustryById(scope, id);
  await recordEntityAudit(audit, 'DELETE', 'Industry', industry.id, industry.productId);
  await industry.destroy();
}

export async function listPublicIndustries(productId: string, opts: { page: number; limit: number }) {
  const { rows, count } = await Industry.findAndCountAll({
    where: { productId, status: 'ACTIVE' },
    include: [PRODUCT_INCLUDE],
    order: [['sortOrder', 'ASC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getPublicIndustryBySlug(productId: string, slug: string): Promise<Industry> {
  const industry = await Industry.findOne({
    where: { productId, slug, status: 'ACTIVE' },
    include: [PRODUCT_INCLUDE],
  });
  if (!industry) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Industry not found');
  return industry;
}
