import { z } from 'zod';

const slug = z
  .string()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');

const status = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const articleCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug,
  excerpt: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  status: status.optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  productId: z.string().uuid().optional(),
});

export const articleUpdateSchema = articleCreateSchema.partial();

export const articleListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: status.optional(),
  search: z.string().optional(),
  productId: z.string().uuid().optional(),
});

export const articlePublicListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
