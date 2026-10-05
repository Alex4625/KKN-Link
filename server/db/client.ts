// server/db/client.ts — Helper membuat instance Drizzle dari binding D1
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

/** Membuat instance Drizzle ORM dari binding D1 Cloudflare */
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type AppDb = ReturnType<typeof createDb>;
