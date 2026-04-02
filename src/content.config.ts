import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema, pageSchema } from '@/schemas';
import { destinationSchema } from '@/schemas/destination.schema';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: postSchema,
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: pageSchema,
});

const destinations = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/destinations' }),
  schema: ({ image }) => destinationSchema({ image }),
});

export const collections = { posts, pages, destinations };