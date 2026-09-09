import { UniqueConstraintError } from 'sequelize';
import LandingPage from '../models/LandingPage';
import type { LandingPageStatus } from '../models/LandingPage';
import Product from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import type { ProductScope } from '../types/express';
import { assertProductInScope, resolveProductIdForCreate } from '../utils/productScope';
import { auditActionForStatusChange, recordEntityAudit, type AuditContext } from './auditService';

const PRODUCT_INCLUDE = { model: Product, as: 'product', attributes: ['id', 'code', 'name'] };

export interface CreateLandingPageInput {
  title: string;
  slug: string;
  content?: object | null;
  status?: LandingPageStatus;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  robotsIndex?: boolean;
  publishedAt?: Date | null;
  productId?: string;
}

export type UpdateLandingPageInput = Partial<CreateLandingPageInput>;

export interface LandingPageListOptions {
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

export async function listLandingPages(scope: ProductScope | undefined, opts: LandingPageListOptions) {
  const where = buildWhere(scope, opts);
  const { rows, count } = await LandingPage.findAndCountAll({
    where,
    include: [PRODUCT_INCLUDE],
    order: [['createdAt', 'DESC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getLandingPageById(scope: ProductScope | undefined, id: string): Promise<LandingPage> {
  const page = await LandingPage.findByPk(id, { include: [PRODUCT_INCLUDE] });
  if (!page) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Landing page not found');
  assertProductInScope(scope, page.productId);
  return page;
}

export async function createLandingPage(
  scope: ProductScope | undefined,
  input: CreateLandingPageInput,
  audit?: AuditContext,
): Promise<LandingPage> {
  const productId = await resolveProductIdForCreate(scope, input.productId);
  const status = input.status ?? 'DRAFT';
  const publishedAt = status === 'PUBLISHED' ? (input.publishedAt ?? new Date()) : null;

  try {
    const page = await LandingPage.create({
      productId,
      title: input.title,
      slug: input.slug,
      content: input.content ?? null,
      status,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      ogTitle: input.ogTitle ?? null,
      ogDescription: input.ogDescription ?? null,
      ogImage: input.ogImage ?? null,
      robotsIndex: input.robotsIndex ?? true,
      publishedAt,
    });
    await recordEntityAudit(audit, 'CREATE', 'LandingPage', page.id, page.productId);
    return page;
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw toConflict();
    throw err;
  }
}

export async function updateLandingPage(
  scope: ProductScope | undefined,
  id: string,
  input: UpdateLandingPageInput,
  audit?: AuditContext,
): Promise<LandingPage> {
  const page = await getLandingPageById(scope, id);
  const oldStatus = page.status;
  const status = input.status ?? page.status;
  const publishedAt =
    status === 'PUBLISHED' ? (input.publishedAt ?? page.publishedAt ?? new Date()) : null;

  try {
    await page.update({
      title: input.title ?? page.title,
      slug: input.slug ?? page.slug,
      content: input.content !== undefined ? input.content : page.content,
      status,
      seoTitle: input.seoTitle !== undefined ? input.seoTitle : page.seoTitle,
      seoDescription: input.seoDescription !== undefined ? input.seoDescription : page.seoDescription,
      canonicalUrl: input.canonicalUrl !== undefined ? input.canonicalUrl : page.canonicalUrl,
      ogTitle: input.ogTitle !== undefined ? input.ogTitle : page.ogTitle,
      ogDescription: input.ogDescription !== undefined ? input.ogDescription : page.ogDescription,
      ogImage: input.ogImage !== undefined ? input.ogImage : page.ogImage,
      robotsIndex: input.robotsIndex ?? page.robotsIndex,
      publishedAt,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw toConflict();
    throw err;
  }

  const action = auditActionForStatusChange(oldStatus, status, 'PUBLISHED');
  await recordEntityAudit(audit, action, 'LandingPage', page.id, page.productId);

  return page;
}

export async function deleteLandingPage(
  scope: ProductScope | undefined,
  id: string,
  audit?: AuditContext,
): Promise<void> {
  const page = await getLandingPageById(scope, id);
  await recordEntityAudit(audit, 'DELETE', 'LandingPage', page.id, page.productId);
  await page.destroy();
}

export async function getPublishedLandingPageBySlug(productId: string, slug: string): Promise<LandingPage> {
  const page = await LandingPage.findOne({
    where: { productId, slug, status: 'PUBLISHED' },
    include: [PRODUCT_INCLUDE],
  });
  if (!page) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Landing page not found');
  return page;
}
