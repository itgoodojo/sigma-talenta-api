import { Op, UniqueConstraintError } from 'sequelize';
import Article from '../models/Article';
import type { ArticleStatus } from '../models/Article';
import Product from '../models/Product';
import User from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import type { ProductScope } from '../types/express';
import { assertProductInScope } from '../utils/productScope';

const PRODUCT_INCLUDE = { model: Product, as: 'product', attributes: ['id', 'code', 'name'] };
const AUTHOR_INCLUDE = { model: User, as: 'author', attributes: ['id', 'name', 'email'] };

export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  status?: ArticleStatus;
  publishedAt?: Date | null;
  productId?: string;
}

export type UpdateArticleInput = Partial<CreateArticleInput>;

export interface ArticleListOptions {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  productId?: string;
}

function buildWhere(
  scope: ProductScope | undefined,
  opts: { status?: string; search?: string; productId?: string },
) {
  const where: Record<string, unknown> = {};
  if (scope && scope.type === 'single') {
    where.productId = scope.productId;
  } else if (opts.productId) {
    where.productId = opts.productId;
  }
  if (opts.status) where.status = opts.status;
  if (opts.search) {
    where[Op.or as unknown as string] = [
      { title: { [Op.iLike]: `%${opts.search}%` } },
      { slug: { [Op.iLike]: `%${opts.search}%` } },
    ];
  }
  return where;
}

function toConflict(): AppError {
  return new AppError(409, 'CONFLICT', 'Slug already exists for this product');
}

async function resolveProductId(
  scope: ProductScope | undefined,
  clientProductId?: string,
): Promise<string> {
  if (scope && scope.type === 'single') return scope.productId;
  if (!clientProductId) {
    throw new AppError(400, 'VALIDATION_ERROR', 'productId is required');
  }
  const product = await Product.findByPk(clientProductId);
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }
  return clientProductId;
}

export async function listArticles(
  scope: ProductScope | undefined,
  opts: ArticleListOptions,
) {
  const where = buildWhere(scope, opts);
  const { rows, count } = await Article.findAndCountAll({
    where,
    include: [PRODUCT_INCLUDE, AUTHOR_INCLUDE],
    order: [['createdAt', 'DESC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getArticleById(scope: ProductScope | undefined, id: string): Promise<Article> {
  const article = await Article.findByPk(id, { include: [PRODUCT_INCLUDE, AUTHOR_INCLUDE] });
  if (!article) {
    throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Article not found');
  }
  assertProductInScope(scope, article.productId);
  return article;
}

export async function createArticle(
  scope: ProductScope | undefined,
  authorId: string | null,
  input: CreateArticleInput,
): Promise<Article> {
  const productId = await resolveProductId(scope, input.productId);
  const status = input.status ?? 'DRAFT';
  const publishedAt = status === 'PUBLISHED' ? (input.publishedAt ?? new Date()) : null;

  try {
    return await Article.create({
      productId,
      authorId,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt ?? null,
      content: input.content ?? null,
      coverImage: input.coverImage ?? null,
      status,
      publishedAt,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw toConflict();
    throw err;
  }
}

export async function updateArticle(
  scope: ProductScope | undefined,
  id: string,
  input: UpdateArticleInput,
): Promise<Article> {
  const article = await getArticleById(scope, id);
  const status = input.status ?? article.status;
  const publishedAt =
    status === 'PUBLISHED' ? (input.publishedAt ?? article.publishedAt ?? new Date()) : null;

  try {
    await article.update({
      title: input.title ?? article.title,
      slug: input.slug ?? article.slug,
      excerpt: input.excerpt !== undefined ? input.excerpt : article.excerpt,
      content: input.content !== undefined ? input.content : article.content,
      coverImage: input.coverImage !== undefined ? input.coverImage : article.coverImage,
      status,
      publishedAt,
    });
  } catch (err) {
    if (err instanceof UniqueConstraintError) throw toConflict();
    throw err;
  }

  return article;
}

export async function deleteArticle(scope: ProductScope | undefined, id: string): Promise<void> {
  const article = await getArticleById(scope, id);
  await article.destroy();
}

export async function listPublishedArticles(productId: string, opts: { page: number; limit: number }) {
  const { rows, count } = await Article.findAndCountAll({
    where: { productId, status: 'PUBLISHED' },
    include: [PRODUCT_INCLUDE, AUTHOR_INCLUDE],
    order: [['publishedAt', 'DESC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getPublishedArticleBySlug(
  productId: string,
  slug: string,
): Promise<Article> {
  const article = await Article.findOne({
    where: { productId, slug, status: 'PUBLISHED' },
    include: [PRODUCT_INCLUDE, AUTHOR_INCLUDE],
  });
  if (!article) {
    throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Article not found');
  }
  return article;
}
