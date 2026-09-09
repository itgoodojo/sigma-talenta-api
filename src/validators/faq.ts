import { z } from 'zod';

const status = z.enum(['ACTIVE', 'INACTIVE']);

export const faqCreateSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.coerce.number().int().optional(),
  status: status.optional(),
  productId: z.string().uuid().optional(),
});

export const faqUpdateSchema = faqCreateSchema.partial();

export const faqListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: status.optional(),
  productId: z.string().uuid().optional(),
});

export const faqPublicListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
