import type { Request, Response } from 'express';
import * as industryService from '../services/industryService';
import type { CreateIndustryInput, UpdateIndustryInput } from '../services/industryService';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationMeta, parsePagination } from '../utils/pagination';
import { created, ok } from '../utils/response';

export const listIndustries = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { status, productId } = req.query as Record<string, string | undefined>;
  const { rows, count } = await industryService.listIndustries(req.productScope, {
    page,
    limit,
    status,
    productId,
  });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const getIndustry = asyncHandler(async (req: Request, res: Response) => {
  const industry = await industryService.getIndustryById(req.productScope, req.params.id);
  ok(res, industry, 'Success');
});

export const createIndustry = asyncHandler(async (req: Request, res: Response) => {
  const industry = await industryService.createIndustry(req.productScope, req.body as CreateIndustryInput);
  created(res, industry, 'Industry created');
});

export const updateIndustry = asyncHandler(async (req: Request, res: Response) => {
  const industry = await industryService.updateIndustry(
    req.productScope,
    req.params.id,
    req.body as UpdateIndustryInput,
  );
  ok(res, industry, 'Industry updated');
});

export const deleteIndustry = asyncHandler(async (req: Request, res: Response) => {
  await industryService.deleteIndustry(req.productScope, req.params.id);
  ok(res, null, 'Industry deleted');
});

export const publicListIndustries = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, count } = await industryService.listPublicIndustries(req.product!.id, { page, limit });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const publicGetIndustry = asyncHandler(async (req: Request, res: Response) => {
  const industry = await industryService.getPublicIndustryBySlug(req.product!.id, req.params.slug);
  ok(res, industry, 'Success');
});
