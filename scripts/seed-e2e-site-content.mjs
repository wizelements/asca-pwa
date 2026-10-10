import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:e2e.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
const db = createClient({ url, authToken });

const key = 'about.hero.title';
const value = 'About ASCA — Database Override Verified';

try {
  await db.execute({
    sql: `INSERT INTO site_content (key, value, created_at, updated_at)
          VALUES (?, ?, unixepoch(), unixepoch())
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`,
    args: [key, value],
  });
  console.log('Seeded disposable Page Text public-render fixture.');
} finally {
  await db.close();
}
