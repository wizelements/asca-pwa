import { createClient } from '@libsql/client/http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const isProductionMain =
  process.env.VERCEL_ENV === 'production' &&
  process.env.VERCEL_GIT_COMMIT_REF === 'main';

if (!isProductionMain) {
  console.log('[schema] Production content migration skipped outside Vercel production/main.');
  process.exit(0);
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error('[schema] Production Turso credentials are unavailable; refusing to build against an unmigrated schema.');
}

const here = dirname(fileURLToPath(import.meta.url));
const sql = await readFile(join(here, '..', 'drizzle', '0005_add_site_content.sql'), 'utf8');
const db = createClient({ url, authToken });

try {
  await db.executeMultiple(sql);
  const check = await db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'site_content' LIMIT 1"
  );
  if (check.rows.length !== 1) {
    throw new Error('[schema] site_content table was not verified after migration.');
  }
  console.log('[schema] Client-editable content schema verified.');
} finally {
  await db.close();
}
