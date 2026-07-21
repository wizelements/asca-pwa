import { getDbClient, withTransaction, isUniqueConstraintError, type DbClient } from './db.ts';
import { getCategoryById } from './categories.ts';
import { getMediaAssetById, getMediaAssetPublicUrl } from './media.ts';
import { slugify, uniqueSlug, isValidSlug } from '../slug.ts';
import type { ActivityAlbumStatus, PrivacyReviewStatus } from '../types.ts';
import { albumInputSchema, albumMediaInputSchema, validatePublishableAlbum } from '../validation.ts';

export interface AlbumRecord {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  eventId: number | null;
  activityDate: Date | null;
  location: string | null;
  summary: string | null;
  coverMediaAssetId: string | null;
  featured: boolean;
  status: ActivityAlbumStatus;
  privacyReviewStatus: PrivacyReviewStatus;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  category: { id: number; name: string; slug: string } | null;
  coverUrl: string | null;
  mediaCount: number;
}

export interface AlbumMediaRecord {
  albumId: number;
  mediaAssetId: string;
  sortOrder: number;
  caption: string | null;
  altText: string;
  url: string;
}

export interface AlbumDetail extends AlbumRecord {
  media: AlbumMediaRecord[];
  relatedEvent: { id: number; title: string; slug?: string; date: Date } | null;
}

export interface AlbumInput {
  title: string;
  slug: string;
  categoryId: number;
  eventId?: number | null;
  activityDate?: Date | null;
  location?: string | null;
  summary?: string | null;
  coverMediaAssetId?: string | null;
  featured?: boolean;
  status?: ActivityAlbumStatus;
  privacyReviewStatus?: PrivacyReviewStatus;
  sortOrder?: number;
}

export interface AlbumMediaInput {
  mediaAssetId: string;
  sortOrder?: number;
  caption?: string | null;
  altText: string;
}

function rowToAlbum(row: Record<string, unknown>, category?: ActivityCategoryRecord | null, mediaCount = 0): AlbumRecord {
  const coverId = row.cover_media_asset_id ? String(row.cover_media_asset_id) : null;
  return {
    id: Number(row.id),
    title: String(row.title),
    slug: String(row.slug),
    categoryId: Number(row.category_id),
    eventId: row.event_id == null ? null : Number(row.event_id),
    activityDate: row.activity_date ? new Date(Number(row.activity_date) * 1000) : null,
    location: row.location == null ? null : String(row.location),
    summary: row.summary == null ? null : String(row.summary),
    coverMediaAssetId: coverId,
    featured: Boolean(row.featured),
    status: String(row.status) as ActivityAlbumStatus,
    privacyReviewStatus: String(row.privacy_review_status) as PrivacyReviewStatus,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at ? new Date(Number(row.created_at) * 1000) : null,
    updatedAt: row.updated_at ? new Date(Number(row.updated_at) * 1000) : null,
    category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
    coverUrl: coverId ? getMediaAssetPublicUrl(coverId, row.updated_at ? new Date(Number(row.updated_at) * 1000) : null) : null,
    mediaCount,
  };
}

interface ActivityCategoryRecord {
  id: number;
  name: string;
  slug: string;
}

async function loadCategory(db: DbClient, categoryId: number): Promise<ActivityCategoryRecord | null> {
  const result = await db.execute({
    sql: 'SELECT id, name, slug FROM activity_categories WHERE id = ?',
    args: [categoryId],
  });
  if (result.rows.length === 0) return null;
  return { id: Number(result.rows[0].id), name: String(result.rows[0].name), slug: String(result.rows[0].slug) };
}

async function albumMediaCount(db: DbClient, albumId: number): Promise<number> {
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM album_media_assets WHERE album_id = ?',
    args: [albumId],
  });
  return Number(result.rows[0]?.c ?? 0);
}

async function albumMedia(db: DbClient, albumId: number): Promise<AlbumMediaRecord[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM album_media_assets WHERE album_id = ? ORDER BY sort_order, created_at, media_asset_id',
    args: [albumId],
  });
  return result.rows.map((row) => ({
    albumId: Number(row.album_id),
    mediaAssetId: String(row.media_asset_id),
    sortOrder: Number(row.sort_order ?? 0),
    caption: row.caption == null ? null : String(row.caption),
    altText: String(row.alt_text),
    url: getMediaAssetPublicUrl(String(row.media_asset_id), row.updated_at ? new Date(Number(row.updated_at) * 1000) : null),
  }));
}

async function relatedEvent(db: DbClient, eventId: number | null): Promise<AlbumDetail['relatedEvent']> {
  if (!eventId) return null;
  const result = await db.execute({
    sql: 'SELECT id, title, date, published FROM events WHERE id = ?',
    args: [eventId],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  if (!row.published) return null;
  return {
    id: Number(row.id),
    title: String(row.title),
    date: row.date ? new Date(Number(row.date) * 1000) : new Date(),
  };
}

function validateInput(input: unknown): AlbumInput {
  return albumInputSchema.parse(input);
}

async function ensureUniqueSlug(db: DbClient, slug: string, excludeId?: number): Promise<string> {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }
  const result = await db.execute({
    sql: excludeId
      ? 'SELECT slug FROM activity_albums WHERE slug LIKE ? AND id != ?'
      : 'SELECT slug FROM activity_albums WHERE slug LIKE ?',
    args: excludeId ? [`${slug}%`, excludeId] : [`${slug}%`],
  });
  const used = new Set(result.rows.map((r) => String(r.slug)));
  return uniqueSlug(slug, used);
}

async function validateCoverAndMedia(db: DbClient, coverId: string | null | undefined, mediaInputs: AlbumMediaInput[]): Promise<void> {
  if (coverId) {
    const exists = await getMediaAssetById(coverId);
    if (!exists) throw new Error(`Cover media asset not found: ${coverId}`);
  }
  for (const m of mediaInputs) {
    const exists = await getMediaAssetById(m.mediaAssetId);
    if (!exists) throw new Error(`Media asset not found: ${m.mediaAssetId}`);
  }
}

export async function getPublicAlbums(categorySlug?: string): Promise<AlbumRecord[]> {
  const db = getDbClient();
  const sql = `
    SELECT a.*, c.name as category_name, c.slug as category_slug,
           (SELECT COUNT(*) FROM album_media_assets WHERE album_id = a.id) as media_count
    FROM activity_albums a
    LEFT JOIN activity_categories c ON a.category_id = c.id
    WHERE a.status = 'published'
      AND a.privacy_review_status IN ('not_required', 'approved')
      AND (c.active = 1 OR c.active IS NULL)
      ${categorySlug ? "AND c.slug = ?" : ''}
    ORDER BY a.featured DESC, a.sort_order, a.activity_date DESC, a.created_at DESC
  `;
  const args = categorySlug ? [categorySlug] : [];
  const result = await db.execute({ sql, args });
  return result.rows.map((row) => rowToAlbum(row, row.category_id ? { id: Number(row.category_id), name: String(row.category_name ?? ''), slug: String(row.category_slug ?? '') } : null, Number(row.media_count ?? 0)));
}

export async function getAlbumsByCategory(categoryId: number): Promise<AlbumRecord[]> {
  return getAdminAlbums({ categoryId });
}

export async function unfeatureAlbum(id: number): Promise<AlbumRecord | null> {
  return featureAlbum(id, false);
}

export async function getFeaturedAlbums(limit = 6): Promise<AlbumRecord[]> {
  const db = getDbClient();
  const sql = `
    SELECT a.*, c.name as category_name, c.slug as category_slug,
           (SELECT COUNT(*) FROM album_media_assets WHERE album_id = a.id) as media_count
    FROM activity_albums a
    LEFT JOIN activity_categories c ON a.category_id = c.id
    WHERE a.status = 'published'
      AND a.featured = 1
      AND a.privacy_review_status = 'not_required'
      AND c.active = 1
      AND a.cover_media_asset_id IS NOT NULL
      AND (SELECT COUNT(*) FROM album_media_assets WHERE album_id = a.id) > 0
    ORDER BY a.sort_order, a.activity_date DESC, a.created_at DESC
    LIMIT ?
  `;
  const result = await db.execute({ sql, args: [limit] });
  return result.rows.map((row) => rowToAlbum(row, { id: Number(row.category_id), name: String(row.category_name ?? ''), slug: String(row.category_slug ?? '') }, Number(row.media_count ?? 0)));
}

export async function getAlbumDetailBySlug(slug: string): Promise<AlbumDetail | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: `
      SELECT a.*, c.name as category_name, c.slug as category_slug,
             (SELECT COUNT(*) FROM album_media_assets WHERE album_id = a.id) as media_count
      FROM activity_albums a
      LEFT JOIN activity_categories c ON a.category_id = c.id
      WHERE a.slug = ?
    `,
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  const album = rowToAlbum(row, { id: Number(row.category_id), name: String(row.category_name ?? ''), slug: String(row.category_slug ?? '') }, Number(row.media_count ?? 0));
  const media = await albumMedia(db, album.id);
  const event = await relatedEvent(db, album.eventId);
  return { ...album, media, relatedEvent: event };
}

export async function getAdminAlbums(filters?: { status?: ActivityAlbumStatus; categoryId?: number }): Promise<AlbumRecord[]> {
  const db = getDbClient();
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (filters?.status) {
    where.push('a.status = ?');
    args.push(filters.status);
  }
  if (filters?.categoryId) {
    where.push('a.category_id = ?');
    args.push(filters.categoryId);
  }
  const sql = `
    SELECT a.*, c.name as category_name, c.slug as category_slug,
           (SELECT COUNT(*) FROM album_media_assets WHERE album_id = a.id) as media_count
    FROM activity_albums a
    LEFT JOIN activity_categories c ON a.category_id = c.id
    ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY a.status, a.featured DESC, a.sort_order, a.created_at DESC
  `;
  const result = await db.execute({ sql, args });
  return result.rows.map((row) => rowToAlbum(row, { id: Number(row.category_id), name: String(row.category_name ?? ''), slug: String(row.category_slug ?? '') }, Number(row.media_count ?? 0)));
}

export async function getAlbumById(id: number): Promise<AlbumRecord | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: `
      SELECT a.*, c.name as category_name, c.slug as category_slug,
             (SELECT COUNT(*) FROM album_media_assets WHERE album_id = a.id) as media_count
      FROM activity_albums a
      LEFT JOIN activity_categories c ON a.category_id = c.id
      WHERE a.id = ?
    `,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return rowToAlbum(row, { id: Number(row.category_id), name: String(row.category_name ?? ''), slug: String(row.category_slug ?? '') }, Number(row.media_count ?? 0));
}

export async function createAlbum(
  input: AlbumInput,
  initialMedia: AlbumMediaInput[] = []
): Promise<AlbumDetail> {
  const validated = validateInput(input);
  const category = await getCategoryById(validated.categoryId);
  if (!category) throw new Error(`Category not found: ${validated.categoryId}`);

  return withTransaction(async (db) => {
    const slug = await ensureUniqueSlug(db, validated.slug);
    await validateCoverAndMedia(db, validated.coverMediaAssetId, initialMedia);

    const result = await db.execute({
      sql: `INSERT INTO activity_albums
        (title, slug, category_id, event_id, activity_date, location, summary, cover_media_asset_id, featured, status, privacy_review_status, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
      args: [
        validated.title,
        slug,
        validated.categoryId,
        validated.eventId ?? null,
        validated.activityDate ? Math.floor(validated.activityDate.getTime() / 1000) : null,
        validated.location ?? null,
        validated.summary ?? null,
        validated.coverMediaAssetId ?? null,
        validated.featured ? 1 : 0,
        validated.status as ActivityAlbumStatus,
        validated.privacyReviewStatus as PrivacyReviewStatus,
        validated.sortOrder ?? 0,
      ],
    });
    const albumId = Number(result.lastInsertRowid);

    for (let i = 0; i < initialMedia.length; i++) {
      const m = albumMediaInputSchema.parse(initialMedia[i]);
      await db.execute({
        sql: 'INSERT INTO album_media_assets (album_id, media_asset_id, sort_order, caption, alt_text) VALUES (?, ?, ?, ?, ?)',
        args: [albumId, m.mediaAssetId, m.sortOrder ?? i * 10, m.caption ?? null, m.altText],
      });
    }

    const album = await getAlbumById(albumId);
    if (!album) throw new Error('Album creation failed');
    const media = await albumMedia(db, albumId);
    const event = await relatedEvent(db, album.eventId);
    return { ...album, media, relatedEvent: event };
  });
}

export async function updateAlbum(
  id: number,
  input: Partial<AlbumInput>,
  mediaUpdates?: { reorder?: Array<{ mediaAssetId: string; sortOrder: number }>; remove?: string[] }
): Promise<AlbumRecord | null> {
  const db = getDbClient();
  const existing = await getAlbumById(id);
  if (!existing) return null;

  if (input.status === 'published') {
    const validation = validatePublishableAlbum({
      title: input.title ?? existing.title,
      status: 'published',
      privacyReviewStatus: input.privacyReviewStatus ?? existing.privacyReviewStatus,
      mediaCount: existing.mediaCount,
      coverMediaAssetId: input.coverMediaAssetId ?? existing.coverMediaAssetId,
      altTexts: [], // Will be checked separately if needed; media alt lives in album_media_assets.
    });
    if (!validation.ok) throw new Error(validation.errors.join('; '));
  }

  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.title !== undefined) { updates.push('title = ?'); args.push(input.title); }
  if (input.slug !== undefined) { args.push(await ensureUniqueSlug(db, input.slug, id)); updates.push('slug = ?'); }
  if (input.categoryId !== undefined) {
    const category = await getCategoryById(input.categoryId);
    if (!category) throw new Error(`Category not found: ${input.categoryId}`);
    updates.push('category_id = ?'); args.push(input.categoryId);
  }
  if (input.eventId !== undefined) { updates.push('event_id = ?'); args.push(input.eventId ?? null); }
  if (input.activityDate !== undefined) { updates.push('activity_date = ?'); args.push(input.activityDate ? Math.floor(input.activityDate.getTime() / 1000) : null); }
  if (input.location !== undefined) { updates.push('location = ?'); args.push(input.location ?? null); }
  if (input.summary !== undefined) { updates.push('summary = ?'); args.push(input.summary ?? null); }
  if (input.coverMediaAssetId !== undefined) {
    if (input.coverMediaAssetId) {
      const exists = await getMediaAssetById(input.coverMediaAssetId);
      if (!exists) throw new Error(`Cover media asset not found: ${input.coverMediaAssetId}`);
    }
    updates.push('cover_media_asset_id = ?'); args.push(input.coverMediaAssetId ?? null);
  }
  if (input.featured !== undefined) { updates.push('featured = ?'); args.push(input.featured ? 1 : 0); }
  if (input.status !== undefined) { updates.push('status = ?'); args.push(input.status); }
  if (input.privacyReviewStatus !== undefined) { updates.push('privacy_review_status = ?'); args.push(input.privacyReviewStatus); }
  if (input.sortOrder !== undefined) { updates.push('sort_order = ?'); args.push(input.sortOrder); }

  if (updates.length > 0) {
    updates.push('updated_at = unixepoch()');
    args.push(id);
    await db.execute({
      sql: `UPDATE activity_albums SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });
  }

  if (mediaUpdates?.reorder) {
    for (const item of mediaUpdates.reorder) {
      await db.execute({
        sql: 'UPDATE album_media_assets SET sort_order = ? WHERE album_id = ? AND media_asset_id = ?',
        args: [item.sortOrder, id, item.mediaAssetId],
      });
    }
  }

  if (mediaUpdates?.remove?.length) {
    for (const mediaAssetId of mediaUpdates.remove) {
      await db.execute({
        sql: 'DELETE FROM album_media_assets WHERE album_id = ? AND media_asset_id = ?',
        args: [id, mediaAssetId],
      });
    }
  }

  return getAlbumById(id);
}

export async function addAlbumMedia(albumId: number, items: AlbumMediaInput[]): Promise<AlbumRecord | null> {
  const db = getDbClient();
  const album = await getAlbumById(albumId);
  if (!album) return null;
  await validateCoverAndMedia(db, null, items);
  for (let i = 0; i < items.length; i++) {
    const parsed = albumMediaInputSchema.parse(items[i]);
    await db.execute({
      sql: 'INSERT OR IGNORE INTO album_media_assets (album_id, media_asset_id, sort_order, caption, alt_text) VALUES (?, ?, ?, ?, ?)',
      args: [albumId, parsed.mediaAssetId, parsed.sortOrder ?? (album.mediaCount + i) * 10, parsed.caption ?? null, parsed.altText],
    });
  }
  return getAlbumById(albumId);
}

export async function updateAlbumMediaMeta(
  albumId: number,
  mediaAssetId: string,
  updates: { caption?: string | null; altText?: string; sortOrder?: number }
): Promise<void> {
  const db = getDbClient();
  const setters: string[] = [];
  const args: (string | number | null)[] = [];
  if (updates.caption !== undefined) { setters.push('caption = ?'); args.push(updates.caption ?? null); }
  if (updates.altText !== undefined) { setters.push('alt_text = ?'); args.push(updates.altText); }
  if (updates.sortOrder !== undefined) { setters.push('sort_order = ?'); args.push(updates.sortOrder); }
  if (setters.length === 0) return;
  setters.push('updated_at = unixepoch()');
  args.push(albumId, mediaAssetId);
  await db.execute({
    sql: `UPDATE album_media_assets SET ${setters.join(', ')} WHERE album_id = ? AND media_asset_id = ?`,
    args,
  });
}

export async function removeAlbumMedia(albumId: number, mediaAssetId: string): Promise<void> {
  const db = getDbClient();
  await db.execute({
    sql: 'DELETE FROM album_media_assets WHERE album_id = ? AND media_asset_id = ?',
    args: [albumId, mediaAssetId],
  });
}

export async function publishAlbum(id: number): Promise<AlbumRecord | null> {
  return updateAlbum(id, { status: 'published' });
}

export async function archiveAlbum(id: number): Promise<AlbumRecord | null> {
  return updateAlbum(id, { status: 'archived', featured: false });
}

export async function featureAlbum(id: number, featured = true): Promise<AlbumRecord | null> {
  return updateAlbum(id, { featured });
}

export async function setAlbumPrivacyStatus(
  id: number,
  privacyReviewStatus: PrivacyReviewStatus
): Promise<AlbumRecord | null> {
  const update: Partial<AlbumInput> = { privacyReviewStatus };
  if (privacyReviewStatus === 'pending' || privacyReviewStatus === 'restricted') {
    update.featured = false;
  }
  return updateAlbum(id, update);
}

export async function deleteAlbum(id: number): Promise<AlbumRecord | null> {
  const db = getDbClient();
  const existing = await getAlbumById(id);
  if (!existing) return null;
  await db.execute({ sql: 'DELETE FROM album_media_assets WHERE album_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM activity_albums WHERE id = ?', args: [id] });
  return existing;
}
