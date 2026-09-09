import type { Request, Response } from 'express';
import * as serviceService from '../services/serviceService';
import type { CreateServiceInput, UpdateServiceInput } from '../services/serviceService';
import { asyncHandler } from '../utils/asyncHandler';
import { paginationMeta, parsePagination } from '../utils/pagination';
import { created, ok } from '../utils/response';

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { status, productId } = req.query as Record<string, string | undefined>;
  const { rows, count } = await serviceService.listServices(req.productScope, {
    page,
    limit,
    status,
    productId,
  });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const getService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceById(req.productScope, req.params.id);
  ok(res, service, 'Success');
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.createService(req.productScope, req.body as CreateServiceInput);
  created(res, service, 'Service created');
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.updateService(
    req.productScope,
    req.params.id,
    req.body as UpdateServiceInput,
  );
  ok(res, service, 'Service updated');
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  await serviceService.deleteService(req.productScope, req.params.id);
  ok(res, null, 'Service deleted');
});

export const publicListServices = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = parsePagination(req.query);
  const { rows, count } = await serviceService.listPublicServices(req.product!.id, { page, limit });
  ok(res, rows, 'Success', paginationMeta(page, limit, count));
});

export const publicGetService = asyncHandler(async (req: Request, res: Response) => {
  const service = await serviceService.getPublicServiceBySlug(req.product!.id, req.params.slug);
  ok(res, service, 'Success');
});
