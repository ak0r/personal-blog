import { z } from 'astro/zod';
import { baseSchema } from './base.schema';

/**
 * Post schema — extends base with content-specific fields.
 * published is required — every post must have a date.
 */
export const postSchema = baseSchema.extend({
  category: z.enum(['tech', 'travel']).optional(),
  published: z.coerce.date(),
  cover: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  series: z.string().optional(),
  order: z.number().optional(),
});

export type Post = z.infer<typeof postSchema>;