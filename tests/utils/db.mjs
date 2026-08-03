import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');

const migrations = [
  'drizzle/0001_add_crm_tables.sql',
  'drizzle/0002_add_media_assets.sql',
  'drizzle/0003_add_gallery_upgrade.sql',
];

export async function createTestDb(path = ':memory:') {
  const db = createClient({ url: `file:${path}` });
  for (const m of migrations) {
    const sql = readFileSync(join(root, m), 'utf8');
    await db.execute(sql);
  }
  return db;
}

export async function seedCategories(db, categories) {
  const stmt = await db.prepare(
    'INSERT INTO activity_categories (name, slug, description, sort_order, active) VALUES (?, ?, ?, ?, ?)'
  );
  for (const c of categories) {
    await stmt.run(c.name, c.slug, c.description ?? '', c.sortOrder ?? 0, c.active ? 1 : 0);
  }
}
