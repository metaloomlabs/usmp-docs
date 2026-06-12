import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({
    base: './src/content/docs',
    pattern: '**/*.{md,mdx}',
    generateId: ({ entry }) => {
      // Remove file extension to generate URL slug-like IDs
      return entry.replace(/\.mdx?$/, '');
    },
  }),
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

export const collections = { docs };
