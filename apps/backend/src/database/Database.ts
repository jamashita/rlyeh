import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import * as schema from './schema.js';

export type Database = MySql2Database<typeof schema>;

export const createDatabase = (url: string): Database => {
  return drizzle(createPool({ uri: url }), { schema, mode: 'default' });
};
