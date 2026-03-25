import { z } from 'astro/zod';
import { baseSchema } from './base.schema';

/**
 * Page schema — extends base with optional updated date.
 * Used for static pages: about, now, uses, etc.
 * updated renders in PageHeader meta slot when present.
 */
export const pageSchema = baseSchema.extend({
  updated: z.coerce.date().optional(),
  lang: z.string().optional(), // BCP 47 language tag e.g. 'en', 'mr', 'hi'
});

export type Page = z.infer<typeof pageSchema>;