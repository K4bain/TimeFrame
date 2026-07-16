import { pgTable, uuid, text, integer, timestamp, doublePrecision, index } from 'drizzle-orm/pg-core';

export const sites = pgTable('sites', {
  id: uuid('id').defaultRandom().primaryKey(),
  domain: text('domain').notNull().unique(),
  firstArchived: timestamp('first_archived', { withTimezone: true }),
  snapshotCount: integer('snapshot_count'),
  lastIndexed: timestamp('last_indexed', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  domainIdx: index('idx_sites_domain').on(table.domain),
}));

export const eras = pgTable('eras', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  startYear: integer('start_year').notNull(),
  endYear: integer('end_year'),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const changeRecords = pgTable('change_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteId: uuid('site_id').notNull().references(() => sites.id),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  prevTimestamp: timestamp('prev_timestamp', { withTimezone: true }),
  changeScore: doublePrecision('change_score').notNull(),
  changeType: text('change_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  siteIdx: index('idx_change_records_site').on(table.siteId),
  siteTimestampIdx: index('idx_change_records_timestamp').on(table.siteId, table.timestamp),
}));

export const searchLog = pgTable('search_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  domain: text('domain').notNull(),
  normalized: text('normalized').notNull(),
  result: text('result').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index('idx_search_log_created').on(table.createdAt),
}));
