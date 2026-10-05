// server/db/schema.ts — Skema database Drizzle ORM sesuai PRD bagian 7.2-7.3
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/** Tabel kategori item */
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});

/** Tabel item bertipe link, note, atau secret */
export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  type: text('type', { enum: ['link', 'note', 'secret'] }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  url: text('url'),
  content: text('content'),
  secretPayload: text('secret_payload'), // base64(iv + ciphertext), jangan pernah dikirim di endpoint list
  isPinned: integer('is_pinned').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at').notNull().default(sql`(unixepoch())`),
}, (t) => ({
  byCategory: index('items_category_idx').on(t.categoryId),
  byPinned: index('items_pinned_idx').on(t.isPinned),
}));

/** Tabel pembatasan percobaan login */
export const loginAttempts = sqliteTable('login_attempts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ip: text('ip').notNull(),
  attemptedAt: integer('attempted_at').notNull(),
}, (t) => ({
  byIp: index('login_attempts_ip_idx').on(t.ip, t.attemptedAt),
}));
