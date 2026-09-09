import { UniqueConstraintError } from 'sequelize';
import Service from '../models/Service';
import Product from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import type { ProductScope } from '../types/express';
import { assertProductInScope, resolveProductIdForCreate } from '../utils/productScope';
import { auditActionForStatusChange, recordEntityAudit, type AuditContext } from './auditService';

const PRODUCT_INCLUDE = { model: Product, as: 'product', attributes: ['id', 'code', 'name'] };

export interface CreateServiceInput {
  title: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  sortOrder?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  productId?: string;
}

export type UpdateServiceInput = Partial<CreateServiceInput>;

export interface ServiceListOptions {
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

export async function listServices(scope: ProductScope | undefined, opts: ServiceListOptions) {
  const where = buildWhere(scope, opts);
  const { rows, count } = await Service.findAndCountAll({
    where,
    include: [PRODUCT_INCLUDE],
    order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getServiceById(scope: ProductScope | undefined, id: string): Promise<Service> {
  const service = await Service.findByPk(id, { include: [PRODUCT_INCLUDE] });
  if (!service) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Service not found');
  assertProductInScope(scope, service.productId);
  return service;
}

export async function createService(
  scope: ProductScope | undefined,
  input: CreateServiceInput,
  audit?: AuditContext,
): Promise<Service> {
  const productId = await resolveProductIdForCreate(scope, input.productId);
  try {
    const service = await Service.create({
      productId,
      title: input.title,
      slug: input.slug,
      shortDescription: input.shortDescription ?? null,
      description: input.description ?? null,
      icon: input.icon ?? null,
      image: input.image ?? null,
      sortOrder: input.sortOrder ?? 0,
      status: input.status ?? 'ACTIVE',
    });
    await recordEntityAudit(audit, 'CREATE', 'Service', service.id, service.productId);
    return service;
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw toConflict();
    throw err;
  }
}

export async function updateService(
  scope: ProductScope | undefined,
  id: string,
  input: UpdateServiceInput,
  audit?: AuditContext,
): Promise<Service> {
  const service = await getServiceById(scope, id);
  const oldStatus = service.status;
  try {
    await service.update({
      title: input.title ?? service.title,
      slug: input.slug ?? service.slug,
      shortDescription: input.shortDescription !== undefined ? input.shortDescription : service.shortDescription,
      description: input.description !== undefined ? input.description : service.description,
      icon: input.icon !== undefined ? input.icon : service.icon,
      image: input.image !== undefined ? input.image : service.image,
      sortOrder: input.sortOrder ?? service.sortOrder,
      status: input.status ?? service.status,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw toConflict();
    throw err;
  }
  const action = auditActionForStatusChange(oldStatus, service.status, 'ACTIVE');
  await recordEntityAudit(audit, action, 'Service', service.id, service.productId);
  return service;
}

export async function deleteService(
  scope: ProductScope | undefined,
  id: string,
  audit?: AuditContext,
): Promise<void> {
  const service = await getServiceById(scope, id);
  await recordEntityAudit(audit, 'DELETE', 'Service', service.id, service.productId);
  await service.destroy();
}

export async function listPublicServices(productId: string, opts: { page: number; limit: number }) {
  const { rows, count } = await Service.findAndCountAll({
    where: { productId, status: 'ACTIVE' },
    include: [PRODUCT_INCLUDE],
    order: [['sortOrder', 'ASC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getPublicServiceBySlug(productId: string, slug: string): Promise<Service> {
  const service = await Service.findOne({
    where: { productId, slug, status: 'ACTIVE' },
    include: [PRODUCT_INCLUDE],
  });
  if (!service) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Service not found');
  return service;
}
