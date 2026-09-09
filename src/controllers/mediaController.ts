import type { Request, Response } from 'express';
import * as mediaService from '../services/mediaService';
import { AppError } from '../middlewares/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationMeta, parsePagination } from '../utils/pagination';
import { created, ok } from '../utils/response';

export const listMedia = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { productId } = req.query as Record<string, string | undefined>;
  const { rows, count } = await mediaService.listMedia(req.productScope, { page, limit, productId });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const getMedia = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.getMediaById(req.productScope, req.params.id);
  ok(res, media, 'Success');
});

export const uploadMediaHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, 'FILE_REQUIRED', 'A file is required');
  }
  const { productId } = req.body as Record<string, string | undefined>;
  const media = await mediaService.uploadMedia(
    req.productScope,
    req.user?.id ?? null,
    req.file,
    productId,
  );
  created(res, media, 'Media uploaded');
});

export const deleteMediaHandler = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.deleteMedia(req.productScope, req.params.id);
  ok(res, null, 'Media deleted');
});
