import type { Request, Response } from 'express';
import * as faqService from '../services/faqService';
import type { CreateFaqInput, UpdateFaqInput } from '../services/faqService';
import { auditContextFromRequest } from '../services/auditService';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationMeta, parsePagination } from '../utils/pagination';
import { created, ok } from '../utils/response';

export const listFaqs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { status, productId } = req.query as Record<string, string | undefined>;
  const { rows, count } = await faqService.listFaqs(req.productScope, { page, limit, status, productId });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const getFaq = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.getFaqById(req.productScope, req.params.id);
  ok(res, faq, 'Success');
});

export const createFaq = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.createFaq(req.productScope, req.body as CreateFaqInput, auditContextFromRequest(req));
  created(res, faq, 'FAQ created');
});

export const updateFaq = asyncHandler(async (req: Request, res: Response) => {
  const faq = await faqService.updateFaq(req.productScope, req.params.id, req.body as UpdateFaqInput, auditContextFromRequest(req));
  ok(res, faq, 'FAQ updated');
});

export const deleteFaq = asyncHandler(async (req: Request, res: Response) => {
  await faqService.deleteFaq(req.productScope, req.params.id, auditContextFromRequest(req));
  ok(res, null, 'FAQ deleted');
});

export const publicListFaqs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, count } = await faqService.listPublicFaqs(req.product!.id, { page, limit });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});
