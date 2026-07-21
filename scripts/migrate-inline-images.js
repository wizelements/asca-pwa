#!/usr/bin/env node

const { createHash } = require('node:crypto');
const path = require('node:path');
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const apply = process.argv.includes('--apply');
const dataImagePattern = /^data:image\/(?:avif|gif|jpeg|png|webp);base64,/i;

function imageAssetId(dataUrl) {
  const digest = createHash('sha256').update(dataUrl).digest('hex').slice(0, 20);
  return `asset-${digest}`;
}

function assetUrl(id) {
  const version = id.slice(id.lastIndexOf('-') + 1);
  return `/api/media/asset/${encodeURIComponent(id)}?v=${version}`;
}

async function upsertAsset(db, id, dataUrl) {
  await db.execute({
    sql: `INSERT INTO media_assets (id, data_url, created_at, updated_at)
          VALUES (?, ?, unixepoch(), unixepoch())
          ON CONFLICT(id) DO UPDATE SET data_url = excluded.data_url, updated_at = unixepoch()`,
    args: [id, dataUrl],
  });
}

async function migrateSettings(db) {
  const result = await db.execute('SELECT heroes FROM settings WHERE id = 1');
  const raw = result.rows[0]?.heroes;
  const heroes = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
  let migrated = 0;
  let bytes = 0;

  for (const [slot, value] of Object.entries(heroes)) {
    if (!value || typeof value !== 'object') continue;
    const source = value.src || value.image || '';
    const normalized = { ...value, src: source };
    delete normalized.image;

    if (typeof source === 'string' && dataImagePattern.test(source)) {
      const id = imageAssetId(source);
      if (apply) await upsertAsset(db, id, source);
      normalized.src = assetUrl(id);
      migrated += 1;
      bytes += source.length;
    }
    heroes[slot] = normalized;
  }

  if (apply) {
    await db.execute({
      sql: 'UPDATE settings SET heroes = ?, updated_at = unixepoch() WHERE id = 1',
      args: [JSON.stringify(heroes)],
    });
  }
  return { migrated, bytes };
}

async function migrateTheme(db) {
  const result = await db.execute('SELECT logo FROM theme WHERE id = 1');
  const logo = result.rows[0]?.logo;
  if (typeof logo !== 'string' || !dataImagePattern.test(logo)) return { migrated: 0, bytes: 0 };

  const id = imageAssetId(logo);
  if (apply) {
    await upsertAsset(db, id, logo);
    await db.execute({
      sql: 'UPDATE theme SET logo = ?, updated_at = unixepoch() WHERE id = 1',
      args: [assetUrl(id)],
    });
  }
  return { migrated: 1, bytes: logo.length };
}

async function migrateImageColumn(db, { table, column }) {
  const result = await db.execute(
    `SELECT id, ${column} AS image FROM ${table} WHERE ${column} LIKE 'data:image/%;base64,%'`
  );
  let bytes = 0;

  for (const row of result.rows) {
    const dataUrl = row.image;
    if (typeof dataUrl !== 'string' || !dataImagePattern.test(dataUrl)) continue;
    const id = imageAssetId(dataUrl);
    if (apply) {
      await upsertAsset(db, id, dataUrl);
      await db.execute({
        sql: `UPDATE ${table} SET ${column} = ? WHERE id = ?`,
        args: [assetUrl(id), row.id],
      });
    }
    bytes += dataUrl.length;
  }

  return { migrated: result.rows.length, bytes };
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error('TURSO_DATABASE_URL is not configured');

  const db = createClient({ url, authToken });
  try {
    if (apply) {
      await db.execute(`CREATE TABLE IF NOT EXISTS media_assets (
        id text PRIMARY KEY NOT NULL,
        data_url text NOT NULL,
        created_at integer DEFAULT (unixepoch()),
        updated_at integer DEFAULT (unixepoch())
      )`);
    }

    const results = {
      settings: await migrateSettings(db),
      theme: await migrateTheme(db),
      gallery: await migrateImageColumn(db, { table: 'gallery_images', column: 'image' }),
      events: await migrateImageColumn(db, { table: 'events', column: 'image_url' }),
      members: await migrateImageColumn(db, { table: 'members', column: 'photo' }),
      blog: await migrateImageColumn(db, { table: 'blog_posts', column: 'image' }),
    };

    let totalImages = 0;
    let totalBytes = 0;
    for (const [name, result] of Object.entries(results)) {
      totalImages += result.migrated;
      totalBytes += result.bytes;
      console.log(`${name}: ${result.migrated} inline image(s), ${result.bytes} text bytes`);
    }
    console.log(`total: ${totalImages} inline image(s), ${totalBytes} text bytes`);
    console.log(apply ? 'Migration applied.' : 'Dry run only. Re-run with --apply after backup and deployment readiness checks.');
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(`Media migration failed: ${error.message}`);
  process.exitCode = 1;
});
