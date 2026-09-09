import { randomUUID } from 'crypto';
import Media from '../models/Media';
import Product from '../models/Product';
import { AppError } from '../middlewares/errorHandler';
import type { ProductScope } from '../types/express';
import { assertProductInScope, resolveProductIdForCreate } from '../utils/productScope';
import { storage } from './storage';

const PRODUCT_INCLUDE = { model: Product, as: 'product', attributes: ['id', 'code', 'name'] };

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-100);
}

export interface MediaListOptions {
  page: number;
  limit: number;
  productId?: string;
}

export async function listMedia(scope: ProductScope | undefined, opts: MediaListOptions) {
  const where: Record<string, unknown> = {};
  if (scope && scope.type === 'single') where.productId = scope.productId;
  else if (opts.productId) where.productId = opts.productId;

  const { rows, count } = await Media.findAndCountAll({
    where,
    include: [PRODUCT_INCLUDE],
    order: [['createdAt', 'DESC']],
    limit: opts.limit,
    offset: (opts.page - 1) * opts.limit,
    distinct: true,
  });
  return { rows, count };
}

export async function getMediaById(scope: ProductScope | undefined, id: string): Promise<Media> {
  const media = await Media.findByPk(id, { include: [PRODUCT_INCLUDE] });
  if (!media) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Media not found');
  assertProductInScope(scope, media.productId);
  return media;
}

export async function uploadMedia(
  scope: ProductScope | undefined,
  uploaderId: string | null,
  file: Express.Multer.File,
  clientProductId?: string,
): Promise<Media> {
  const productId = await resolveProductIdForCreate(scope, clientProductId);
  const key = `${productId}/${randomUUID()}-${sanitizeName(file.originalname)}`;
  const url = await storage.upload({ key, body: file.buffer, contentType: file.mimetype });

  return Media.create({
    productId,
    uploaderId,
    fileName: file.originalname,
    fileKey: key,
    mimeType: file.mimetype,
    size: file.size,
    url,
  });
}

export async function deleteMedia(scope: ProductScope | undefined, id: string): Promise<void> {
  const media = await getMediaById(scope, id);
  await storage.delete(media.fileKey);
  await media.destroy();
}
