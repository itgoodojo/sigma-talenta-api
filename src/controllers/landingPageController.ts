import type { Request, Response } from 'express';
import * as landingPageService from '../services/landingPageService';
import type { CreateLandingPageInput, UpdateLandingPageInput } from '../services/landingPageService';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationMeta, parsePagination } from '../utils/pagination';
import { created, ok } from '../utils/response';

export const listLandingPages = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { status, productId } = req.query as Record<string, string | undefined>;
  const { rows, count } = await landingPageService.listLandingPages(req.productScope, {
    page,
    limit,
    status,
    productId,
  });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const getLandingPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await landingPageService.getLandingPageById(req.productScope, req.params.id);
  ok(res, page, 'Success');
});

export const createLandingPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await landingPageService.createLandingPage(
    req.productScope,
    req.body as CreateLandingPageInput,
  );
  created(res, page, 'Landing page created');
});

export const updateLandingPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await landingPageService.updateLandingPage(
    req.productScope,
    req.params.id,
    req.body as UpdateLandingPageInput,
  );
  ok(res, page, 'Landing page updated');
});

export const deleteLandingPage = asyncHandler(async (req: Request, res: Response) => {
  await landingPageService.deleteLandingPage(req.productScope, req.params.id);
  ok(res, null, 'Landing page deleted');
});

export const publicGetLandingPage = asyncHandler(async (req: Request, res: Response) => {
  const page = await landingPageService.getPublishedLandingPageBySlug(req.product!.id, req.params.slug);
  ok(res, page, 'Success');
});
