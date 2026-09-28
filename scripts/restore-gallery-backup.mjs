import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@libsql/client';

function usage() {
  console.log('Usage: node scripts/restore-gallery-backup.mjs <backup.json> [--apply] [--allow-remote]');
  console.log('Default behavior is a read-only validation/dry run.');
}

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(label + ' must be an array.');
  return value;
}

function validateBackup(payload) {
  if (!payload || Number(payload.version) < 2) {
    throw new Error('Gallery recovery requires an ASCA backup with version 2 or newer.');
  }
  const data = payload.data || {};
  const gallery = data.gallery || {};
  const mediaAssets = requireArray(data.mediaAssets, 'data.mediaAssets');
  const categories = requireArray(gallery.categories, 'data.gallery.categories');
  const albums = requireArray(gallery.albums, 'data.gallery.albums');
  const albumMedia = requireArray(gallery.albumMedia, 'data.gallery.albumMedia');

  for (const category of categories) {
    if (category.id == null || !category.name || !category.slug) throw new Error('Invalid category row in backup.');
  }
  for (const album of albums) {
    if (album.id == null || !album.title || !album.slug || album.category_id == null) {
      throw new Error('Invalid album row in backup.');
    }
  }
  for (const relation of albumMedia) {
    if (relation.album_id == null || !relation.media_asset_id || !relation.alt_text) {
      throw new Error('Invalid album-media row in backup.');
    }
  }

  return { mediaAssets, categories, albums, albumMedia };
}

function isRemoteDatabase(url) {
  return /^(libsql|https?):/i.test(url) || /turso\.io/i.test(url);
}

const args = process.argv.slice(2);
const fileArg = args.find((arg) => !arg.startsWith('--'));
if (!fileArg) {
  usage();
  process.exit(1);
}

const apply = args.includes('--apply');
const allowRemote = args.includes('--allow-remote');
const backupPath = resolve(process.cwd(), fileArg);
const payload = JSON.parse(readFileSync(backupPath, 'utf8'));
const backup = validateBackup(payload);

console.log('Gallery backup validation PASS');
console.log('Media assets:', backup.mediaAssets.length);
console.log('Categories:', backup.categories.length);
console.log('Albums:', backup.albums.length);
console.log('Album-media relationships:', backup.albumMedia.length);

if (!apply) {
  console.log('Dry run only. No database changes were made.');
  process.exit(0);
}

const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error('TURSO_DATABASE_URL is required for --apply.');
if (isRemoteDatabase(url) && !allowRemote) {
  throw new Error('Refusing to restore to a remote database without --allow-remote. Restore to a disposable/staging database first.');
}

const db = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const warnings = [];

try {
  await db.execute('PRAGMA foreign_keys = ON');
  await db.execute('BEGIN');

  for (const asset of backup.mediaAssets) {
    if (!asset.id || !asset.data_url) continue;
    await db.execute({
      sql: 'INSERT INTO media_assets (id, data_url, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET data_url = excluded.data_url, updated_at = excluded.updated_at',
      args: [
        String(asset.id),
        String(asset.data_url),
        asset.created_at ?? null,
        asset.updated_at ?? null,
      ],
    });
  }

  await db.execute('DELETE FROM album_media_assets');
  await db.execute('DELETE FROM activity_albums');
  await db.execute('DELETE FROM activity_categories');

  for (const category of backup.categories) {
    await db.execute({
      sql: 'INSERT INTO activity_categories (id, name, slug, description, sort_order, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        Number(category.id),
        String(category.name),
        String(category.slug),
        category.description ?? '',
        Number(category.sort_order ?? 0),
        category.active === false || Number(category.active) === 0 ? 0 : 1,
        category.created_at ?? null,
        category.updated_at ?? null,
      ],
    });
  }

  for (const album of backup.albums) {
    let eventId = album.event_id == null ? null : Number(album.event_id);
    if (eventId != null) {
      const event = await db.execute({ sql: 'SELECT id FROM events WHERE id = ?', args: [eventId] });
      if (event.rows.length === 0) {
        warnings.push('Album ' + album.slug + ': related event ' + eventId + ' is missing; restored with no related event.');
        eventId = null;
      }
    }

    await db.execute({
      sql: [
        'INSERT INTO activity_albums',
        '(id, title, slug, category_id, event_id, activity_date, location, summary, cover_media_asset_id, featured, status, privacy_review_status, sort_order, created_at, updated_at, deleted_at)',
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ].join(' '),
      args: [
        Number(album.id),
        String(album.title),
        String(album.slug),
        Number(album.category_id),
        eventId,
        album.activity_date ?? null,
        album.location ?? '',
        album.summary ?? '',
        album.cover_media_asset_id ?? null,
        Number(album.featured ?? 0),
        String(album.status ?? 'draft'),
        String(album.privacy_review_status ?? 'pending'),
        Number(album.sort_order ?? 0),
        album.created_at ?? null,
        album.updated_at ?? null,
        album.deleted_at ?? null,
      ],
    });
  }

  for (const relation of backup.albumMedia) {
    await db.execute({
      sql: 'INSERT INTO album_media_assets (album_id, media_asset_id, sort_order, caption, alt_text, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [
        Number(relation.album_id),
        String(relation.media_asset_id),
        Number(relation.sort_order ?? 0),
        relation.caption ?? '',
        String(relation.alt_text),
        relation.created_at ?? null,
        relation.updated_at ?? null,
      ],
    });
  }

  const fkCheck = await db.execute('PRAGMA foreign_key_check');
  if (fkCheck.rows.length > 0) {
    throw new Error('Foreign-key verification failed after restore.');
  }

  const counts = await Promise.all([
    db.execute('SELECT COUNT(*) as c FROM activity_categories'),
    db.execute('SELECT COUNT(*) as c FROM activity_albums'),
    db.execute('SELECT COUNT(*) as c FROM album_media_assets'),
  ]);

  if (Number(counts[0].rows[0]?.c ?? -1) !== backup.categories.length) {
    throw new Error('Category reconciliation failed.');
  }
  if (Number(counts[1].rows[0]?.c ?? -1) !== backup.albums.length) {
    throw new Error('Album reconciliation failed.');
  }
  if (Number(counts[2].rows[0]?.c ?? -1) !== backup.albumMedia.length) {
    throw new Error('Album-media reconciliation failed.');
  }

  await db.execute('COMMIT');
  console.log('Gallery restore APPLY PASS');
  for (const warning of warnings) console.warn('WARNING:', warning);
} catch (error) {
  await db.execute('ROLLBACK').catch(() => {});
  throw error;
} finally {
  await db.close();
}
