import type { Request, Response } from 'express';
import * as articleService from '../services/articleService';
import type { CreateArticleInput, UpdateArticleInput } from '../services/articleService';
import { auditContextFromRequest } from '../services/auditService';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationMeta, parsePagination } from '../utils/pagination';
import { created, ok } from '../utils/response';

// --- Admin ---

export const listArticles = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { status, search, productId } = req.query as Record<string, string | undefined>;
  const { rows, count } = await articleService.listArticles(req.productScope, {
    page,
    limit,
    status,
    search,
    productId,
  });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const getArticle = asyncHandler(async (req: Request, res: Response) => {
  const article = await articleService.getArticleById(req.productScope, req.params.id);
  ok(res, article, 'Success');
});

export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  const article = await articleService.createArticle(
    req.productScope,
    req.user?.id ?? null,
    req.body as CreateArticleInput,
    auditContextFromRequest(req),
  );
  created(res, article, 'Article created');
});

export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  const article = await articleService.updateArticle(
    req.productScope,
    req.params.id,
    req.body as UpdateArticleInput,
    auditContextFromRequest(req),
  );
  ok(res, article, 'Article updated');
});

export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  await articleService.deleteArticle(req.productScope, req.params.id, auditContextFromRequest(req));
  ok(res, null, 'Article deleted');
});

// --- Public ---

export const publicListArticles = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, count } = await articleService.listPublishedArticles(req.product!.id, {
    page,
    limit,
  });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const publicGetArticle = asyncHandler(async (req: Request, res: Response) => {
  const article = await articleService.getPublishedArticleBySlug(req.product!.id, req.params.slug);
  ok(res, article, 'Success');
});
