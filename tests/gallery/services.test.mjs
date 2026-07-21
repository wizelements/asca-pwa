import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { readFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { getDb } from '../../lib/db.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const dbPath = '/tmp/asca-services-test.db';

const DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function setupDb() {
  const cleanup = () => {
    try { unlinkSync(dbPath); } catch {}
  };
  cleanup();
  const db = createClient({ url: `file:${dbPath}` });

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

  // Inject the test DB into the shared getDb singleton. The env URL alone is not
  // enough: getDb caches its first client, which goes stale (SQLITE_READONLY_DBMOVED)
  // once a later suite unlinks and recreates the file. Use the __testClient hook.
  process.env.TURSO_DATABASE_URL = `file:${dbPath}`;
  process.env.TURSO_AUTH_TOKEN = '';
  getDb.__testClient = db;

  return { db, cleanup };
}

describe('authorization helpers', () => {
  it(' viewer cannot edit or admin', async () => {
    const { canEdit, canAdmin, assertAdmin } = await import('../../lib/gallery/services/authorization.ts');
    const viewer = { role: 'viewer', sub: '1', email: 'a@b.c', name: 'V', passwordVersion: '1' };
    assert.equal(canEdit(viewer), false);
    assert.equal(canAdmin(viewer), false);
    assert.throws(() => assertAdmin(viewer), /Forbidden/);
  });

  it(' editor can edit but not admin', async () => {
    const { canEdit, canAdmin } = await import('../../lib/gallery/services/authorization.ts');
    const editor = { role: 'editor', sub: '1', email: 'a@b.c', name: 'E', passwordVersion: '1' };
    assert.equal(canEdit(editor), true);
    assert.equal(canAdmin(editor), false);
  });

  it(' admin can edit and admin', async () => {
    const { canEdit, canAdmin } = await import('../../lib/gallery/services/authorization.ts');
    const admin = { role: 'admin', sub: '1', email: 'a@b.c', name: 'A', passwordVersion: '1' };
    assert.equal(canEdit(admin), true);
    assert.equal(canAdmin(admin), true);
  });
});

describe('category services', () => {
  let ctx;
  before(async () => { ctx = await setupDb(); });

  it(' seeds canonical categories', async () => {
    const { seedCanonicalCategories } = await import('../../lib/gallery/services/categories.ts');
    const cats = await seedCanonicalCategories();
    assert.equal(cats.length, 7);
    assert.ok(cats.some((c) => c.slug === 'trail-rides'));
  });

  it(' resolves known legacy aliases', async () => {
    const { seedCanonicalCategories, resolveLegacyCategoryAlias } = await import('../../lib/gallery/services/categories.ts');
    await seedCanonicalCategories();
    const resolved = await resolveLegacyCategoryAlias('Trail Rides');
    assert.equal(resolved.slug, 'trail-rides');
    assert.equal(resolved.requiresReview, false);
  });

  it(' unknown value requires review', async () => {
    const { seedCanonicalCategories, resolveLegacyCategoryAlias } = await import('../../lib/gallery/services/categories.ts');
    await seedCanonicalCategories();
    const resolved = await resolveLegacyCategoryAlias('Events');
    assert.equal(resolved.slug, null);
    assert.equal(resolved.requiresReview, true);
  });
});

describe('album services', () => {
  let ctx;
  before(async () => { ctx = await setupDb(); });

  it(' draft album invisible publicly; published album visible', async () => {
    const { seedCanonicalCategories, getCategoryBySlug } = await import('../../lib/gallery/services/categories.ts');
    const { createMediaAssetFromDataUrl } = await import('../../lib/gallery/services/media.ts');
    const { createAlbum, getPublicAlbums, publishAlbum } = await import('../../lib/gallery/services/albums.ts');

    await seedCanonicalCategories();
    const cat = await getCategoryBySlug('trail-rides');
    const asset = await createMediaAssetFromDataUrl(DATA_URL);
    const album = await createAlbum({
      title: 'Helen Trail Ride',
      slug: 'helen-trail-ride',
      categoryId: cat.id,
      coverMediaAssetId: asset.id,
      status: 'draft',
    }, [{ mediaAssetId: asset.id, altText: 'Helen trail ride photo' }]);

    let publicList = await getPublicAlbums();
    assert.equal(publicList.some((a) => a.id === album.id), false);

    await publishAlbum(album.id);
    publicList = await getPublicAlbums();
    assert.equal(publicList.some((a) => a.id === album.id), true);
  });

  it(' archived album invisible publicly', async () => {
    const { seedCanonicalCategories, getCategoryBySlug } = await import('../../lib/gallery/services/categories.ts');
    const { createMediaAssetFromDataUrl } = await import('../../lib/gallery/services/media.ts');
    const { createAlbum, getPublicAlbums, archiveAlbum } = await import('../../lib/gallery/services/albums.ts');

    await seedCanonicalCategories();
    const cat = await getCategoryBySlug('trail-rides');
    const asset = await createMediaAssetFromDataUrl(DATA_URL);
    const album = await createAlbum({ title: 'Archived Ride', slug: 'archived-ride', categoryId: cat.id, coverMediaAssetId: asset.id, status: 'published' }, [{ mediaAssetId: asset.id, altText: 'Archived' }]);
    await archiveAlbum(album.id);
    const publicList = await getPublicAlbums();
    assert.equal(publicList.some((a) => a.id === album.id), false);
  });

  it(' pending privacy album cannot be featured and excluded from public', async () => {
    const { seedCanonicalCategories, getCategoryBySlug } = await import('../../lib/gallery/services/categories.ts');
    const { createMediaAssetFromDataUrl } = await import('../../lib/gallery/services/media.ts');
    const { createAlbum, getFeaturedAlbums, getPublicAlbums, featureAlbum } = await import('../../lib/gallery/services/albums.ts');

    await seedCanonicalCategories();
    const cat = await getCategoryBySlug('fellowship');
    const asset = await createMediaAssetFromDataUrl(DATA_URL);
    const album = await createAlbum({ title: 'Member Gathering', slug: 'member-gathering', categoryId: cat.id, coverMediaAssetId: asset.id, status: 'published', privacyReviewStatus: 'pending' }, [{ mediaAssetId: asset.id, altText: 'Member gathering' }]);
    await featureAlbum(album.id, true);
    const featured = await getFeaturedAlbums();
    assert.equal(featured.some((a) => a.id === album.id), false);
    const publicList = await getPublicAlbums();
    assert.equal(publicList.some((a) => a.id === album.id), false);
  });

  it(' restricted privacy removes from public and featured', async () => {
    const { seedCanonicalCategories, getCategoryBySlug } = await import('../../lib/gallery/services/categories.ts');
    const { createMediaAssetFromDataUrl } = await import('../../lib/gallery/services/media.ts');
    const { createAlbum, getPublicAlbums, setAlbumPrivacyStatus } = await import('../../lib/gallery/services/albums.ts');

    await seedCanonicalCategories();
    const cat = await getCategoryBySlug('club-events');
    const asset = await createMediaAssetFromDataUrl(DATA_URL);
    const album = await createAlbum({ title: 'Restricted Event', slug: 'restricted-event', categoryId: cat.id, coverMediaAssetId: asset.id, status: 'published' }, [{ mediaAssetId: asset.id, altText: 'Restricted' }]);
    await setAlbumPrivacyStatus(album.id, 'restricted');
    const publicList = await getPublicAlbums();
    assert.equal(publicList.some((a) => a.id === album.id), false);
  });
});

describe('horse services', () => {
  let ctx;
  before(async () => { ctx = await setupDb(); });

  it(' published horse visible; archived horse invisible', async () => {
    const { seedCanonicalCategories } = await import('../../lib/gallery/services/categories.ts');
    const { createMediaAssetFromDataUrl } = await import('../../lib/gallery/services/media.ts');
    const { createHorse, getPublicHorses, publishHorse, archiveHorse } = await import('../../lib/gallery/services/horses.ts');

    await seedCanonicalCategories();
    const asset = await createMediaAssetFromDataUrl(DATA_URL);
    const horse = await createHorse({ name: 'Shade', slug: 'shade', primaryMediaAssetId: asset.id, status: 'draft' });
    let list = await getPublicHorses();
    assert.equal(list.some((h) => h.id === horse.id), false);
    await publishHorse(horse.id);
    list = await getPublicHorses();
    assert.equal(list.some((h) => h.id === horse.id), true);
    await archiveHorse(horse.id);
    list = await getPublicHorses();
    assert.equal(list.some((h) => h.id === horse.id), false);
  });

  it(' horse detail by slug includes media', async () => {
    const { seedCanonicalCategories } = await import('../../lib/gallery/services/categories.ts');
    const { createMediaAssetFromDataUrl } = await import('../../lib/gallery/services/media.ts');
    const { createHorse, getHorseDetailBySlug } = await import('../../lib/gallery/services/horses.ts');

    await seedCanonicalCategories();
    const asset = await createMediaAssetFromDataUrl(DATA_URL);
    await createHorse({ name: 'Buddy', slug: 'buddy', primaryMediaAssetId: asset.id, status: 'published' }, [{ mediaAssetId: asset.id, altText: 'Buddy photo' }]);
    const detail = await getHorseDetailBySlug('buddy');
    assert.equal(detail?.name, 'Buddy');
    assert.equal(detail?.media.length, 1);
  });
});

describe('legacy review services', () => {
  let ctx;
  before(async () => { ctx = await setupDb(); });

  it(' member review record created and excluded from public', async () => {
    const { seedCanonicalCategories } = await import('../../lib/gallery/services/categories.ts');
    const { getLegacyReviewRecords } = await import('../../lib/gallery/services/legacy-review.ts');

    await seedCanonicalCategories();
    const db = createClient({ url: `file:${dbPath}` });
    const id = 101;
    await db.execute({ sql: 'DELETE FROM gallery_images WHERE id = ?', args: [id] });
    await db.execute({
      sql: 'INSERT INTO gallery_images (id, title, category, image, alt) VALUES (?, ?, ?, ?, ?)',
      args: [id, 'Members', 'Members', 'data:image/png;base64,xyz', 'Member'],
    });
    await db.execute({
      sql: `INSERT OR REPLACE INTO legacy_gallery_review
        (legacy_gallery_image_id, legacy_title, legacy_category, legacy_media_reference, proposed_destination_type, migration_confidence, review_reason, privacy_review_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, 'Members', 'Members', 'data:image/png;base64,xyz', 'review', 'low', 'Members category requires review', 'pending'],
    });

    const pending = await getLegacyReviewRecords({ status: 'pending', privacyReviewStatus: 'pending' });
    assert.equal(pending.length >= 1, true);
    assert.ok(pending.some((r) => r.legacyCategory === 'Members'));
  });

  it(' reject sets restricted', async () => {
    const { seedCanonicalCategories } = await import('../../lib/gallery/services/categories.ts');
    const { getLegacyReviewRecords, rejectReview } = await import('../../lib/gallery/services/legacy-review.ts');

    await seedCanonicalCategories();
    const db = createClient({ url: `file:${dbPath}` });
    const id = 102;
    await db.execute({ sql: 'DELETE FROM gallery_images WHERE id = ?', args: [id] });
    await db.execute({
      sql: 'INSERT INTO gallery_images (id, title, category, image, alt) VALUES (?, ?, ?, ?, ?)',
      args: [id, 'Members', 'Members', 'data:image/png;base64,xyz', 'Member'],
    });
    await db.execute({
      sql: `INSERT OR REPLACE INTO legacy_gallery_review
        (legacy_gallery_image_id, legacy_title, legacy_category, legacy_media_reference, proposed_destination_type, migration_confidence, review_reason, privacy_review_status, reviewer_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, 'Members', 'Members', 'data:image/png;base64,xyz', 'review', 'low', 'Review', 'pending', null],
    });
    await db.execute({
      sql: 'INSERT OR IGNORE INTO users (id, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      args: [1, 'reviewer@example.com', 'hash', 'admin', 1],
    });
    const review = (await getLegacyReviewRecords({})).find((r) => r.legacyGalleryImageId === id);
    assert.ok(review);
    const updated = await rejectReview(review.id, 1, 'No consent');
    assert.equal(updated?.reviewStatus, 'rejected');
    assert.equal(updated?.privacyReviewStatus, 'restricted');
  });
});

describe('media integrity', () => {
  let ctx;
  before(async () => { ctx = await setupDb(); });

  it(' reports references and orphan candidates', async () => {
    const { seedCanonicalCategories, getCategoryBySlug } = await import('../../lib/gallery/services/categories.ts');
    const { createMediaAssetFromDataUrl } = await import('../../lib/gallery/services/media.ts');
    const { createAlbum } = await import('../../lib/gallery/services/albums.ts');
    const { getMediaIntegrityReport } = await import('../../lib/gallery/services/media-integrity.ts');

    await seedCanonicalCategories();
    const asset = await createMediaAssetFromDataUrl(DATA_URL);
    const cat = await getCategoryBySlug('trail-rides');
    await createAlbum({ title: 'Integrity Test', slug: 'integrity-test', categoryId: cat.id, coverMediaAssetId: asset.id, status: 'published' }, [{ mediaAssetId: asset.id, altText: 'Integrity' }]);

    const report = await getMediaIntegrityReport();
    assert.ok(report.totalAssets >= 1);
    assert.equal(report.missingReferences.length, 0);
    assert.ok(report.totalReferenced >= 1);
  });
});
