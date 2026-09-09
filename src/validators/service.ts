import { z } from 'zod';

const slug = z
  .string()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');
const status = z.enum(['ACTIVE', 'INACTIVE']);

export const serviceCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug,
  shortDescription: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  status: status.optional(),
  productId: z.string().uuid().optional(),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const serviceListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: status.optional(),
  productId: z.string().uuid().optional(),
});

export const servicePublicListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
