import Faq from '../models/Faq';
import Product from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import type { ProductScope } from '../types/express';
import { assertProductInScope, resolveProductIdForCreate } from '../utils/productScope';
import { auditActionForStatusChange, recordEntityAudit, type AuditContext } from './auditService';

const PRODUCT_INCLUDE = { model: Product, as: 'product', attributes: ['id', 'code', 'name'] };

export interface CreateFaqInput {
  question: string;
  answer: string;
  sortOrder?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  productId?: string;
}

export type UpdateFaqInput = Partial<CreateFaqInput>;

export interface FaqListOptions {
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

export async function listFaqs(scope: ProductScope | undefined, opts: FaqListOptions) {
  const where = buildWhere(scope, opts);
  const { rows, count } = await Faq.findAndCountAll({
    where,
    include: [PRODUCT_INCLUDE],
    order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getFaqById(scope: ProductScope | undefined, id: string): Promise<Faq> {
  const faq = await Faq.findByPk(id, { include: [PRODUCT_INCLUDE] });
  if (!faq) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'FAQ not found');
  assertProductInScope(scope, faq.productId);
  return faq;
}

export async function createFaq(
  scope: ProductScope | undefined,
  input: CreateFaqInput,
  audit?: AuditContext,
): Promise<Faq> {
  const productId = await resolveProductIdForCreate(scope, input.productId);
  const faq = await Faq.create({
    productId,
    question: input.question,
    answer: input.answer,
    sortOrder: input.sortOrder ?? 0,
    status: input.status ?? 'ACTIVE',
  });
  await recordEntityAudit(audit, 'CREATE', 'Faq', faq.id, faq.productId);
  return faq;
}

export async function updateFaq(
  scope: ProductScope | undefined,
  id: string,
  input: UpdateFaqInput,
  audit?: AuditContext,
): Promise<Faq> {
  const faq = await getFaqById(scope, id);
  const oldStatus = faq.status;
  await faq.update({
    question: input.question ?? faq.question,
    answer: input.answer ?? faq.answer,
    sortOrder: input.sortOrder ?? faq.sortOrder,
    status: input.status ?? faq.status,
  });
  const action = auditActionForStatusChange(oldStatus, faq.status, 'ACTIVE');
  await recordEntityAudit(audit, action, 'Faq', faq.id, faq.productId);
  return faq;
}

export async function deleteFaq(scope: ProductScope | undefined, id: string, audit?: AuditContext): Promise<void> {
  const faq = await getFaqById(scope, id);
  await recordEntityAudit(audit, 'DELETE', 'Faq', faq.id, faq.productId);
  await faq.destroy();
}

export async function listPublicFaqs(productId: string, opts: { page: number; limit: number }) {
  const { rows, count } = await Faq.findAndCountAll({
    where: { productId, status: 'ACTIVE' },
    include: [PRODUCT_INCLUDE],
    order: [['sortOrder', 'ASC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}
