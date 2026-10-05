// test/init-local-db.mjs — Ensure all local D1 sqlite databases have the initial schema applied
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const sqlPath = path.resolve('drizzle/0000_initial_schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const dir = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.sqlite') && !f.includes('metadata'));
console.log('Found D1 SQLite database files:', files);

// Execute on all database files found
for (const file of files) {
  const filePath = path.join(dir, file);
  console.log(`Applying schema to ${file}...`);
  const db = new DatabaseSync(filePath);
  
  // Split on statement-breakpoint or semicolons
  const statements = sql
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    try {
      db.exec(stmt);
    } catch (e) {
      // Ignore "already exists" errors
      if (!e.message.includes('already exists')) {
        console.warn(`Warning on statement: ${stmt.slice(0, 40)}...`, e.message);
      }
    }
  }

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log(`Tables in ${file}:`, tables.map(t => t.name));
  db.close();
}

console.log('✅ Database initialization complete.');
