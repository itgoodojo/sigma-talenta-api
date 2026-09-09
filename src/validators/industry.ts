import { z } from 'zod';

const slug = z
  .string()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');
const status = z.enum(['ACTIVE', 'INACTIVE']);

export const industryCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug,
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
  status: status.optional(),
  productId: z.string().uuid().optional(),
});

export const industryUpdateSchema = industryCreateSchema.partial();

export const industryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: status.optional(),
  productId: z.string().uuid().optional(),
});

export const industryPublicListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
