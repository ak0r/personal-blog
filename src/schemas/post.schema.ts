import { z } from 'astro/zod';
import { baseSchema } from './base.schema';

/**
 * Post schema — extends base with content-specific fields.
 */
export const postSchema = baseSchema.extend({
  category: z.enum(['tech', 'travel']).optional(),
  cover: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  series: z.string().optional(),
  order: z.number().optional(),
  lang: z.string().optional(), // BCP 47 language tag e.g. 'en', 'mr', 'hi'
  updated:  z.coerce.date().optional(), // replaces published in display
});

export type Post = z.infer<typeof postSchema>;