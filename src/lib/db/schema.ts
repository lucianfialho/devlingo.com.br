import { pgTable, bigserial, varchar, text, jsonb, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const terms = pgTable('terms', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  content: jsonb('content').notNull(),
  category: varchar('category', { length: 100 }),

  // Metadata and sources
  metaDescription: text('meta_description'),
  sources: jsonb('sources').default(sql`'[]'::jsonb`),
  metadata: jsonb('metadata').default(sql`'{}'::jsonb`),

  // Stack Overflow related data
  stackOverflowTag: varchar('stack_overflow_tag', { length: 255 }),
  stackOverflowCount: integer('stack_overflow_count').default(0),
  stackOverflowData: jsonb('stack_overflow_data'),
  relatedTerms: text('related_terms').array().default(sql`ARRAY[]::TEXT[]`),

  // Content structure
  codeExamples: jsonb('code_examples').default(sql`'[]'::jsonb`),
  faq: jsonb('faq').default(sql`'[]'::jsonb`),
  termReferences: jsonb('term_references').default(sql`'[]'::jsonb`),
  whyLearn: text('why_learn'),

  // Content status
  status: varchar('status', { length: 20 }).default('draft'),

  // Analytics
  views: integer('views').default(0),
  clicks: integer('clicks').default(0),
  impressions: integer('impressions').default(0),

  // Generation metadata
  modelUsed: varchar('model_used', { length: 100 }),
  generationTimeMs: integer('generation_time_ms'),
  ragEnabled: boolean('rag_enabled').default(false),
  version: varchar('version', { length: 20 }).default('1.0'),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  generatedAt: timestamp('generated_at', { withTimezone: true }),
}, (table) => ({
  slugIdx: index('idx_terms_slug').on(table.slug),
  categoryIdx: index('idx_terms_category').on(table.category),
  statusIdx: index('idx_terms_status').on(table.status),
  createdAtIdx: index('idx_terms_created_at').on(table.createdAt),
  viewsIdx: index('idx_terms_views').on(table.views),
  stackOverflowTagIdx: index('idx_terms_stack_overflow_tag').on(table.stackOverflowTag),
}));

export const categories = pgTable('categories', {
  id: integer('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 10 }),
  termCount: integer('term_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Types
export type Term = typeof terms.$inferSelect;
export type NewTerm = typeof terms.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
