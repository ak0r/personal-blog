import { z } from 'astro/zod';

/**
 * Destination schema — one entry per country.
 *
 * Files live in src/content/destinations/
 * Entry id = filename without extension e.g. india.md → 'india'
 *
 * cover   — resolved via Astro's image() helper for optimisation
 * tagline — short descriptor shown on destination cards
 * body    — optional MDX description shown on /travel/[country]/
 */
export const destinationSchema = ({ image }: { image: () => z.ZodType<any> }) =>
  z.object({
    title:    z.string(),
    description: z.string().optional(),
    cover:   image().optional(),
  });

export type Destination = {
  name:    string;
  cover?:  ImageMetadata;
  tagline?: string;
};

// ImageMetadata type reference for consumers
import type { ImageMetadata } from 'astro';