import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:e2e.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
const db = createClient({ url, authToken });

const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const assetId = 'asset-e2e-gallery-fixture';

try {
  await db.execute({
    sql: 'INSERT INTO media_assets (id, data_url, created_at, updated_at) VALUES (?, ?, unixepoch(), unixepoch()) ON CONFLICT(id) DO UPDATE SET data_url = excluded.data_url, updated_at = unixepoch()',
    args: [assetId, dataUrl],
  });

  await db.execute({
    sql: "INSERT INTO activity_categories (name, slug, description, sort_order, active, created_at, updated_at) VALUES ('Trail Rides', 'trail-rides', 'E2E fixture category', 10, 1, unixepoch(), unixepoch()) ON CONFLICT(slug) DO UPDATE SET active = 1, updated_at = unixepoch()",
    args: [],
  });
  const category = await db.execute({
    sql: "SELECT id FROM activity_categories WHERE slug = 'trail-rides'",
    args: [],
  });
  const categoryId = Number(category.rows[0].id);

  await db.execute({
    sql: "INSERT INTO activity_albums (title, slug, category_id, activity_date, location, summary, cover_media_asset_id, featured, status, privacy_review_status, sort_order, created_at, updated_at, deleted_at) VALUES ('E2E Trail Ride', 'e2e-trail-ride', ?, unixepoch(), 'Atlanta, GA', 'Deterministic gallery fixture for end-to-end verification.', ?, 1, 'published', 'approved', 0, unixepoch(), unixepoch(), NULL) ON CONFLICT(slug) DO UPDATE SET category_id = excluded.category_id, cover_media_asset_id = excluded.cover_media_asset_id, featured = 1, status = 'published', privacy_review_status = 'approved', deleted_at = NULL, updated_at = unixepoch()",
    args: [categoryId, assetId],
  });
  const album = await db.execute({
    sql: "SELECT id FROM activity_albums WHERE slug = 'e2e-trail-ride'",
    args: [],
  });
  const albumId = Number(album.rows[0].id);

  await db.execute({
    sql: "INSERT INTO album_media_assets (album_id, media_asset_id, sort_order, caption, alt_text, created_at, updated_at) VALUES (?, ?, 0, 'ASCA E2E gallery fixture', 'ASCA riders during an E2E trail ride fixture', unixepoch(), unixepoch()) ON CONFLICT(album_id, media_asset_id) DO UPDATE SET sort_order = 0, caption = excluded.caption, alt_text = excluded.alt_text, updated_at = unixepoch()",
    args: [albumId, assetId],
  });

  await db.execute({
    sql: "INSERT INTO horse_profiles (name, slug, description, primary_media_asset_id, status, sort_order, created_at, updated_at, deleted_at) VALUES ('E2E Horse', 'e2e-horse', 'Deterministic horse fixture for end-to-end verification.', ?, 'published', 0, unixepoch(), unixepoch(), NULL) ON CONFLICT(slug) DO UPDATE SET primary_media_asset_id = excluded.primary_media_asset_id, status = 'published', deleted_at = NULL, updated_at = unixepoch()",
    args: [assetId],
  });
  const horse = await db.execute({
    sql: "SELECT id FROM horse_profiles WHERE slug = 'e2e-horse'",
    args: [],
  });
  const horseId = Number(horse.rows[0].id);

  await db.execute({
    sql: "INSERT INTO horse_profile_media (horse_profile_id, media_asset_id, sort_order, caption, alt_text, created_at, updated_at) VALUES (?, ?, 0, 'ASCA E2E horse fixture', 'E2E Horse standing for a deterministic test photo', unixepoch(), unixepoch()) ON CONFLICT(horse_profile_id, media_asset_id) DO UPDATE SET sort_order = 0, caption = excluded.caption, alt_text = excluded.alt_text, updated_at = unixepoch()",
    args: [horseId, assetId],
  });

  console.log('Seeded deterministic gallery and horse E2E fixtures.');
} finally {
  await db.close();
}
