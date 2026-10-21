import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Een bericht is een map src/content/posts/<slug>/ met index.md en de afbeeldingen ernaast.
// De slug wordt de URL: /<slug>/
const posts = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/posts', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      cover: image().optional(),
      home: z.boolean().default(true), // tonen op de homepage
      nieuws: z.boolean().default(false), // tonen op /nieuws/
    }),
});

// Een optreden is een map src/content/agenda/<slug>/ met index.md en de poster ernaast.
const agenda = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/agenda', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      image: image().optional(),
      tickets: z.url().optional(),
    }),
});

export const collections = { posts, agenda };
