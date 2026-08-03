import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { readFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runLegacyMigration, isProductionDatabaseUrl } from '../../lib/gallery/migration.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');

async function setupDb(path) {
  const db = createClient({ url: `file:${path}` });

  // Create minimal legacy tables that the classifier and migration expect, matching schema.ts.
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS settings (id integer PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS theme (id integer PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY AUTOINCREMENT, email text, password text, role text, is_active integer);
    CREATE TABLE IF NOT EXISTS events (id integer PRIMARY KEY AUTOINCREMENT, title text, description text, date integer, end_date integer, location text, published integer);
    CREATE TABLE IF NOT EXISTS members (
      id integer PRIMARY KEY AUTOINCREMENT,
      first_name text, last_name text, email text, bio text, photo text, roles text,
      is_active integer, is_verified integer, join_date integer, created_at integer, updated_at integer,
      contact_id integer
    );
    CREATE TABLE IF NOT EXISTS blog_posts (id integer PRIMARY KEY AUTOINCREMENT, title text, slug text, content text, author text, published integer);
    CREATE TABLE IF NOT EXISTS gallery_images (id integer PRIMARY KEY AUTOINCREMENT, title text, description text, category text, image text, alt text, sort_order integer, published integer, uploaded_at integer);
    CREATE TABLE IF NOT EXISTS form_submissions (
      id integer PRIMARY KEY AUTOINCREMENT,
      type text, data text, status text, submitted_at integer,
      contact_id integer
    );
    CREATE TABLE IF NOT EXISTS activities (id integer PRIMARY KEY AUTOINCREMENT, type text, title text, user text, timestamp integer);
    CREATE TABLE IF NOT EXISTS media_assets (id text PRIMARY KEY, data_url text NOT NULL, created_at integer, updated_at integer);
  `);

  const upgrade = readFileSync(join(root, 'drizzle/0003_add_gallery_upgrade.sql'), 'utf8');
  await db.executeMultiple(upgrade);
  const softDelete = readFileSync(join(root, 'drizzle/0004_add_soft_delete_to_gallery.sql'), 'utf8');
  await db.executeMultiple(softDelete);
  return db;
}

async function seedLegacy(db, rows) {
  for (const r of rows) {
    await db.execute({
      sql: 'INSERT INTO gallery_images (id, title, category, image, alt) VALUES (?, ?, ?, ?, ?)',
      args: [r.id, r.title, r.category, r.image, r.alt || ''],
    });
  }
}

describe('migration', () => {
  it('rejects production database with apply', async () => {
    assert.equal(
      isProductionDatabaseUrl('libsql://asca-pwa-swatkins.aws-us-east-1.turso.io'),
      true
    );
    await assert.rejects(
      runLegacyMigration({ url: 'libsql://asca-pwa-swatkins.aws-us-east-1.turso.io', apply: true }),
      /Refusing to apply/
    );
  });

  it('dry-run classifies all rows', async () => {
    const path = '/tmp/asca-migration-dryrun-test.db';
    const cleanup = () => {
      try { unlinkSync(path); } catch {}
    };
    cleanup();
    const db = await setupDb(path);
    await seedLegacy(db, [
      { id: 1, title: 'Meet Shade', category: 'Horses', image: '/api/media/asset/horse-shade' },
      { id: 2, title: 'Trail Ride at Helen', category: 'Trail Rides', image: '/api/media/asset/trail-1' },
      { id: 3, title: 'Members', category: 'Members', image: '/api/media/asset/member-1' },
      { id: 4, title: 'Random', category: 'Unknown', image: '/api/media/asset/unknown-1' },
    ]);
    const report = await runLegacyMigration({ url: `file:${path}`, apply: false });
    assert.equal(report.legacyRows, 4);
    assert.equal(report.horseProfilesCreated, 1);
    assert.equal(report.albumsCreated, 1);
    assert.equal(report.reviewQueueRows, 2);
    const total = report.horseProfilesCreated + report.albumsCreated + report.reviewQueueRows;
    assert.equal(total, 4);
    cleanup();
  });
});
