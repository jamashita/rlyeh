import { char, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';

/**
 * Table definitions for Drizzle. Migrations are generated from this file with
 * `bun run db:generate`, so a column change starts here.
 */
export const notes = mysqlTable('notes', {
  id: char('id', { length: 36 }).primaryKey(),
  title: varchar('title', { length: 120 }).notNull(),
  body: text('body').notNull()
});

export type NoteRow = typeof notes.$inferSelect;
