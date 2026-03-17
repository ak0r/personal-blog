import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema, pageSchema } from '@/schemas';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: postSchema,
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: pageSchema,
});

export const collections = { posts, pages };