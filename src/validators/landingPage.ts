import { z } from 'zod';

const slug = z
  .string()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format');
const status = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const landingPageCreateSchema = z.object({
  title: z.string().min(1).max(255),
  slug,
  content: z.unknown().nullable().optional(),
  status: status.optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional(),
  robotsIndex: z.boolean().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  productId: z.string().uuid().optional(),
});

export const landingPageUpdateSchema = landingPageCreateSchema.partial();

export const landingPageListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: status.optional(),
  productId: z.string().uuid().optional(),
});
