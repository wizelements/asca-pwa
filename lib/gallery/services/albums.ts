import { getDbClient, withTransaction, type DbClient } from './db.ts';
import { getCategoryById, type ActivityCategoryRecord } from './categories.ts';
import { getMediaAssetPublicUrl } from './media.ts';
import { uniqueSlug, isValidSlug } from '../slug.ts';
import type { ActivityAlbumStatus, PrivacyReviewStatus } from '../types.ts';
import { albumInputSchema, albumMediaInputSchema, validatePublishableAlbum } from '../validation.ts';

function categoryFromRow(row: Record<string, unknown>): ActivityCategoryRecord {
  return {
    id: Number(row.category_id),
    name: String(row.category_name ?? ''),
    slug: String(row.category_slug ?? ''),
    description: null,
    sortOrder: 0,
    active: Boolean(row.category_active ?? 0),
    createdAt: null,
    updatedAt: null,
  };
}

function categoryFromRowNullable(row: Record<string, unknown>): ActivityCategoryRecord | null {
  return row.category_id ? categoryFromRow(row) : null;
}

function categoryToMinimal(category: ActivityCategoryRecord): { id: number; name: string; slug: string; active: boolean } {
  return { id: category.id, name: category.name, slug: category.slug, active: category.active };
}

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
  deletedAt: Date | null;
  category: { id: number; name: string; slug: string; active: boolean } | null;
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

export interface AlbumMediaUpdates {
  add?: AlbumMediaInput[];
  remove?: string[];
  reorder?: Array<{ mediaAssetId: string; sortOrder: number }>;
  metadata?: Array<{ mediaAssetId: string; caption?: string | null; altText?: string }>;
}

function rowToAlbum(row: Record<string, unknown>, category?: ActivityCategoryRecord | null, mediaCount = 0): AlbumRecord {
  const coverId = row.cover_media_asset_id ? String(row.cover_media_asset_id) : null;
  const coverUpdatedAt = row.cover_updated_at ? new Date(Number(row.cover_updated_at) * 1000) : null;
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
    deletedAt: row.deleted_at ? new Date(Number(row.deleted_at) * 1000) : null,
    category: category ? categoryToMinimal(category) : null,
    coverUrl: coverId ? getMediaAssetPublicUrl(coverId, coverUpdatedAt) : null,
    mediaCount,
  };
}

function selectColumns(): string {
  return [
    'SELECT a.*, c.name as category_name, c.slug as category_slug, c.active as category_active,',
    '       (SELECT COUNT(*) FROM album_media_assets WHERE album_id = a.id) as media_count,',
    '       (SELECT updated_at FROM media_assets WHERE id = a.cover_media_asset_id) as cover_updated_at',
    'FROM activity_albums a',
    'LEFT JOIN activity_categories c ON a.category_id = c.id',
  ].join('\n');
}

async function albumMedia(db: DbClient, albumId: number): Promise<AlbumMediaRecord[]> {
  const result = await db.execute({
    sql: [
      'SELECT ama.*, ma.updated_at as asset_updated_at',
      'FROM album_media_assets ama',
      'JOIN media_assets ma ON ma.id = ama.media_asset_id',
      'WHERE ama.album_id = ?',
      'ORDER BY ama.sort_order, ama.created_at, ama.media_asset_id',
    ].join('\n'),
    args: [albumId],
  });
  return result.rows.map((row) => ({
    albumId: Number(row.album_id),
    mediaAssetId: String(row.media_asset_id),
    sortOrder: Number(row.sort_order ?? 0),
    caption: row.caption == null ? null : String(row.caption),
    altText: String(row.alt_text),
    url: getMediaAssetPublicUrl(
      String(row.media_asset_id),
      row.asset_updated_at ? new Date(Number(row.asset_updated_at) * 1000) : null
    ),
  }));
}

async function relatedEvent(db: DbClient, eventId: number | null): Promise<AlbumDetail['relatedEvent']> {
  if (!eventId) return null;
  const result = await db.execute({
    sql: 'SELECT id, title, date, published FROM events WHERE id = ?',
    args: [eventId],
  });
  if (result.rows.length === 0 || !result.rows[0].published) return null;
  const row = result.rows[0];
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
  if (!isValidSlug(slug)) throw new Error('Invalid slug: ' + slug);
  const result = await db.execute({
    sql: excludeId
      ? 'SELECT slug FROM activity_albums WHERE slug LIKE ? AND id != ?'
      : 'SELECT slug FROM activity_albums WHERE slug LIKE ?',
    args: excludeId ? [slug + '%', excludeId] : [slug + '%'],
  });
  return uniqueSlug(slug, new Set(result.rows.map((row) => String(row.slug))));
}

async function assertMediaAssetsExist(db: DbClient, ids: string[]): Promise<void> {
  for (const id of new Set(ids)) {
    const result = await db.execute({ sql: 'SELECT id FROM media_assets WHERE id = ?', args: [id] });
    if (result.rows.length === 0) throw new Error('Media asset not found: ' + id);
  }
}

async function getAlbumRecordFromDb(db: DbClient, id: number, includeDeleted = false): Promise<AlbumRecord | null> {
  const result = await db.execute({
    sql: selectColumns() + '\nWHERE a.id = ?' + (includeDeleted ? '' : ' AND a.deleted_at IS NULL'),
    args: [id],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return rowToAlbum(row, categoryFromRowNullable(row), Number(row.media_count ?? 0));
}

async function getAlbumDetailFromDb(db: DbClient, id: number, includeDeleted = false): Promise<AlbumDetail | null> {
  const album = await getAlbumRecordFromDb(db, id, includeDeleted);
  if (!album) return null;
  const media = await albumMedia(db, id);
  const event = await relatedEvent(db, album.eventId);
  return { ...album, media, relatedEvent: event };
}

async function assertFinalAlbumState(db: DbClient, id: number): Promise<AlbumRecord> {
  const album = await getAlbumRecordFromDb(db, id);
  if (!album) throw new Error('Album not found');
  const media = await albumMedia(db, id);
  const mediaIds = new Set(media.map((item) => item.mediaAssetId));

  if (album.coverMediaAssetId && !mediaIds.has(album.coverMediaAssetId)) {
    throw new Error('Cover image must be attached to this album.');
  }

  if (album.status === 'published') {
    const validation = validatePublishableAlbum({
      title: album.title,
      status: album.status,
      privacyReviewStatus: album.privacyReviewStatus,
      mediaCount: media.length,
      coverMediaAssetId: album.coverMediaAssetId,
      altTexts: media.map((item) => item.altText),
    });
    if (!album.category?.active) validation.errors.push('Category must be active before publishing.');
    if (validation.errors.length > 0) {
      throw new Error('Cannot publish album: ' + validation.errors.join('; '));
    }
  }

  if (album.featured) {
    const featuredCheck = isAlbumFeaturedEligible(album);
    if (!featuredCheck.eligible) {
      throw new Error('Cannot feature album: ' + featuredCheck.reasons.join('; '));
    }
  }

  return album;
}

export async function getPublicAlbums(categorySlug?: string, limit?: number, offset?: number): Promise<AlbumRecord[]> {
  const db = getDbClient();
  const where = [
    'a.deleted_at IS NULL',
    "a.status = 'published'",
    "a.privacy_review_status IN ('not_required', 'approved')",
    'c.active = 1',
    'a.cover_media_asset_id IS NOT NULL',
    'EXISTS (SELECT 1 FROM album_media_assets ama WHERE ama.album_id = a.id)',
    'EXISTS (SELECT 1 FROM album_media_assets cover_rel WHERE cover_rel.album_id = a.id AND cover_rel.media_asset_id = a.cover_media_asset_id)',
  ];
  const args: (string | number)[] = [];
  if (categorySlug) {
    where.push('c.slug = ?');
    args.push(categorySlug);
  }

  let sql = selectColumns() + '\nWHERE ' + where.join('\n  AND ') +
    '\nORDER BY a.featured DESC, a.sort_order, a.activity_date DESC, a.created_at DESC';
  if (limit !== undefined) {
    sql += '\nLIMIT ?';
    args.push(limit);
  }
  if (offset !== undefined) {
    sql += '\nOFFSET ?';
    args.push(offset);
  }

  const result = await db.execute({ sql, args });
  return result.rows.map((row) => rowToAlbum(row, categoryFromRowNullable(row), Number(row.media_count ?? 0)));
}

export async function countPublicAlbums(categorySlug?: string): Promise<number> {
  const db = getDbClient();
  const where = [
    'a.deleted_at IS NULL',
    "a.status = 'published'",
    "a.privacy_review_status IN ('not_required', 'approved')",
    'c.active = 1',
    'a.cover_media_asset_id IS NOT NULL',
    'EXISTS (SELECT 1 FROM album_media_assets ama WHERE ama.album_id = a.id)',
    'EXISTS (SELECT 1 FROM album_media_assets cover_rel WHERE cover_rel.album_id = a.id AND cover_rel.media_asset_id = a.cover_media_asset_id)',
  ];
  const args: string[] = [];
  if (categorySlug) {
    where.push('c.slug = ?');
    args.push(categorySlug);
  }
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM activity_albums a LEFT JOIN activity_categories c ON a.category_id = c.id WHERE ' + where.join(' AND '),
    args,
  });
  return Number(result.rows[0]?.c ?? 0);
}

export async function countAdminAlbums(filters?: { status?: ActivityAlbumStatus; categoryId?: number; deleted?: boolean }): Promise<number> {
  const db = getDbClient();
  const where: string[] = [filters?.deleted ? 'deleted_at IS NOT NULL' : 'deleted_at IS NULL'];
  const args: (string | number)[] = [];
  if (filters?.status) { where.push('status = ?'); args.push(filters.status); }
  if (filters?.categoryId) { where.push('category_id = ?'); args.push(filters.categoryId); }
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM activity_albums WHERE ' + where.join(' AND '),
    args,
  });
  return Number(result.rows[0]?.c ?? 0);
}

export async function getAlbumsByCategory(categoryId: number): Promise<AlbumRecord[]> {
  return getAdminAlbums({ categoryId });
}

export async function getFeaturedAlbums(limit = 6): Promise<AlbumRecord[]> {
  const db = getDbClient();
  const result = await db.execute({
    sql: selectColumns() + [
      '',
      'WHERE a.deleted_at IS NULL',
      "  AND a.status = 'published'",
      '  AND a.featured = 1',
      "  AND a.privacy_review_status IN ('not_required', 'approved')",
      '  AND c.active = 1',
      '  AND a.cover_media_asset_id IS NOT NULL',
      '  AND EXISTS (SELECT 1 FROM album_media_assets ama WHERE ama.album_id = a.id)',
      '  AND EXISTS (SELECT 1 FROM album_media_assets cover_rel WHERE cover_rel.album_id = a.id AND cover_rel.media_asset_id = a.cover_media_asset_id)',
      'ORDER BY a.sort_order, a.activity_date DESC, a.created_at DESC',
      'LIMIT ?',
    ].join('\n'),
    args: [limit],
  });
  return result.rows.map((row) => rowToAlbum(row, categoryFromRow(row), Number(row.media_count ?? 0)));
}

export async function getAlbumDetailBySlug(slug: string): Promise<AlbumDetail | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: selectColumns() + '\nWHERE a.deleted_at IS NULL AND a.slug = ?',
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  const album = rowToAlbum(row, categoryFromRowNullable(row), Number(row.media_count ?? 0));
  const media = await albumMedia(db, album.id);
  const event = await relatedEvent(db, album.eventId);
  return { ...album, media, relatedEvent: event };
}

export async function getAdminAlbums(
  filters?: { status?: ActivityAlbumStatus; categoryId?: number; deleted?: boolean },
  limit?: number,
  offset?: number
): Promise<AlbumRecord[]> {
  const db = getDbClient();
  const where: string[] = [filters?.deleted ? 'a.deleted_at IS NOT NULL' : 'a.deleted_at IS NULL'];
  const args: (string | number)[] = [];
  if (filters?.status) { where.push('a.status = ?'); args.push(filters.status); }
  if (filters?.categoryId) { where.push('a.category_id = ?'); args.push(filters.categoryId); }

  let sql = selectColumns() + '\nWHERE ' + where.join(' AND ') +
    '\nORDER BY a.status, a.featured DESC, a.sort_order, a.created_at DESC';
  if (limit !== undefined) { sql += '\nLIMIT ?'; args.push(limit); }
  if (offset !== undefined) { sql += '\nOFFSET ?'; args.push(offset); }

  const result = await db.execute({ sql, args });
  return result.rows.map((row) => rowToAlbum(row, categoryFromRowNullable(row), Number(row.media_count ?? 0)));
}

export async function getAlbumById(id: number, includeDeleted = false): Promise<AlbumRecord | null> {
  return getAlbumRecordFromDb(getDbClient(), id, includeDeleted);
}

export async function getAlbumDetailById(id: number, includeDeleted = false): Promise<AlbumDetail | null> {
  return getAlbumDetailFromDb(getDbClient(), id, includeDeleted);
}

export async function createAlbum(input: AlbumInput, initialMedia: AlbumMediaInput[] = []): Promise<AlbumDetail> {
  const validated = validateInput(input);
  const category = await getCategoryById(validated.categoryId);
  if (!category) throw new Error('Category not found: ' + validated.categoryId);

  return withTransaction(async (db) => {
    const media = initialMedia.map((item) => albumMediaInputSchema.parse(item));
    await assertMediaAssetsExist(db, media.map((item) => item.mediaAssetId));
    const slug = await ensureUniqueSlug(db, validated.slug);

    const result = await db.execute({
      sql: [
        'INSERT INTO activity_albums',
        '(title, slug, category_id, event_id, activity_date, location, summary, cover_media_asset_id, featured, status, privacy_review_status, sort_order, created_at, updated_at)',
        'VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, unixepoch(), unixepoch())',
      ].join('\n'),
      args: [
        validated.title,
        slug,
        validated.categoryId,
        validated.eventId ?? null,
        validated.activityDate ? Math.floor(validated.activityDate.getTime() / 1000) : null,
        validated.location ?? null,
        validated.summary ?? null,
        validated.featured ? 1 : 0,
        validated.status as ActivityAlbumStatus,
        validated.privacyReviewStatus as PrivacyReviewStatus,
        validated.sortOrder ?? 0,
      ],
    });
    const albumId = Number(result.lastInsertRowid);

    for (let index = 0; index < media.length; index++) {
      const item = media[index];
      await db.execute({
        sql: 'INSERT INTO album_media_assets (album_id, media_asset_id, sort_order, caption, alt_text) VALUES (?, ?, ?, ?, ?)',
        args: [albumId, item.mediaAssetId, item.sortOrder ?? index * 10, item.caption ?? null, item.altText],
      });
    }

    const coverId = validated.coverMediaAssetId ?? media[0]?.mediaAssetId ?? null;
    if (coverId) {
      if (!media.some((item) => item.mediaAssetId === coverId)) {
        throw new Error('Cover image must be attached to this album.');
      }
      await db.execute({
        sql: 'UPDATE activity_albums SET cover_media_asset_id = ?, updated_at = unixepoch() WHERE id = ?',
        args: [coverId, albumId],
      });
    }

    await assertFinalAlbumState(db, albumId);
    const detail = await getAlbumDetailFromDb(db, albumId);
    if (!detail) throw new Error('Album creation failed');
    return detail;
  });
}

export async function updateAlbum(
  id: number,
  input: Partial<AlbumInput>,
  mediaUpdates: AlbumMediaUpdates = {}
): Promise<AlbumRecord | null> {
  const existing = await getAlbumById(id);
  if (!existing) return null;

  if (input.categoryId !== undefined) {
    const category = await getCategoryById(input.categoryId);
    if (!category) throw new Error('Category not found: ' + input.categoryId);
  }

  return withTransaction(async (db) => {
    const add = (mediaUpdates.add ?? []).map((item) => albumMediaInputSchema.parse(item));
    await assertMediaAssetsExist(db, add.map((item) => item.mediaAssetId));

    const setters: string[] = [];
    const args: (string | number | null)[] = [];
    if (input.title !== undefined) { setters.push('title = ?'); args.push(input.title); }
    if (input.slug !== undefined) {
      setters.push('slug = ?');
      args.push(await ensureUniqueSlug(db, input.slug, id));
    }
    if (input.categoryId !== undefined) { setters.push('category_id = ?'); args.push(input.categoryId); }
    if (input.eventId !== undefined) { setters.push('event_id = ?'); args.push(input.eventId); }
    if (input.activityDate !== undefined) {
      setters.push('activity_date = ?');
      args.push(input.activityDate ? Math.floor(input.activityDate.getTime() / 1000) : null);
    }
    if (input.location !== undefined) { setters.push('location = ?'); args.push(input.location); }
    if (input.summary !== undefined) { setters.push('summary = ?'); args.push(input.summary); }
    if (input.featured !== undefined) { setters.push('featured = ?'); args.push(input.featured ? 1 : 0); }
    if (input.status !== undefined) {
      setters.push('status = ?');
      args.push(input.status);
      if (input.status === 'archived') {
        setters.push('featured = 0');
      }
    }
    if (input.privacyReviewStatus !== undefined) {
      setters.push('privacy_review_status = ?');
      args.push(input.privacyReviewStatus);
    }
    if (input.sortOrder !== undefined) { setters.push('sort_order = ?'); args.push(input.sortOrder); }

    if (setters.length > 0) {
      setters.push('updated_at = unixepoch()');
      args.push(id);
      await db.execute({
        sql: 'UPDATE activity_albums SET ' + setters.join(', ') + ' WHERE id = ? AND deleted_at IS NULL',
        args,
      });
    }

    for (let index = 0; index < add.length; index++) {
      const item = add[index];
      await db.execute({
        sql: 'INSERT INTO album_media_assets (album_id, media_asset_id, sort_order, caption, alt_text) VALUES (?, ?, ?, ?, ?)',
        args: [id, item.mediaAssetId, item.sortOrder ?? (existing.mediaCount + index) * 10, item.caption ?? null, item.altText],
      });
    }

    for (const mediaAssetId of new Set(mediaUpdates.remove ?? [])) {
      await db.execute({
        sql: 'DELETE FROM album_media_assets WHERE album_id = ? AND media_asset_id = ?',
        args: [id, mediaAssetId],
      });
    }

    const afterMembership = await albumMedia(db, id);
    const finalIds = new Set(afterMembership.map((item) => item.mediaAssetId));

    for (const item of mediaUpdates.metadata ?? []) {
      if (!finalIds.has(item.mediaAssetId)) throw new Error('Cannot update media that is not attached to this album.');
      const metaSetters: string[] = [];
      const metaArgs: (string | number | null)[] = [];
      if (item.altText !== undefined) { metaSetters.push('alt_text = ?'); metaArgs.push(item.altText); }
      if (item.caption !== undefined) { metaSetters.push('caption = ?'); metaArgs.push(item.caption); }
      if (metaSetters.length > 0) {
        metaSetters.push('updated_at = unixepoch()');
        metaArgs.push(id, item.mediaAssetId);
        await db.execute({
          sql: 'UPDATE album_media_assets SET ' + metaSetters.join(', ') + ' WHERE album_id = ? AND media_asset_id = ?',
          args: metaArgs,
        });
      }
    }

    for (const item of mediaUpdates.reorder ?? []) {
      if (!finalIds.has(item.mediaAssetId)) throw new Error('Cannot reorder media that is not attached to this album.');
      await db.execute({
        sql: 'UPDATE album_media_assets SET sort_order = ?, updated_at = unixepoch() WHERE album_id = ? AND media_asset_id = ?',
        args: [item.sortOrder, id, item.mediaAssetId],
      });
    }

    const current = await getAlbumRecordFromDb(db, id);
    if (!current) throw new Error('Album update failed');

    let nextCover: string | null | undefined = input.coverMediaAssetId;
    if (nextCover === undefined) {
      nextCover = current.coverMediaAssetId && finalIds.has(current.coverMediaAssetId)
        ? current.coverMediaAssetId
        : afterMembership[0]?.mediaAssetId ?? null;
    }
    if (nextCover && !finalIds.has(nextCover)) {
      throw new Error('Cover image must be attached to this album.');
    }
    if (nextCover !== current.coverMediaAssetId) {
      await db.execute({
        sql: 'UPDATE activity_albums SET cover_media_asset_id = ?, updated_at = unixepoch() WHERE id = ?',
        args: [nextCover ?? null, id],
      });
    }

    return assertFinalAlbumState(db, id);
  });
}

export function isAlbumPubliclyEligible(album: AlbumRecord): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (album.deletedAt) reasons.push('Album is in trash.');
  if (album.status !== 'published') reasons.push('Album is not published.');
  if (!['not_required', 'approved'].includes(album.privacyReviewStatus)) reasons.push('Album privacy is not cleared.');
  if (!album.categoryId || !album.category?.active) reasons.push('Category is missing or inactive.');
  if (album.mediaCount === 0) reasons.push('Album has no media.');
  if (!album.coverMediaAssetId) reasons.push('Album has no cover image.');
  return { eligible: reasons.length === 0, reasons };
}

export function isAlbumFeaturedEligible(album: AlbumRecord): { eligible: boolean; reasons: string[] } {
  const reasons = isAlbumPubliclyEligible(album).reasons;
  return { eligible: reasons.length === 0, reasons };
}

export async function restoreAlbum(id: number): Promise<AlbumRecord | null> {
  return updateAlbum(id, { status: 'draft', featured: false });
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

export async function unfeatureAlbum(id: number): Promise<AlbumRecord | null> {
  return featureAlbum(id, false);
}

export async function setAlbumPrivacyStatus(
  id: number,
  privacyReviewStatus: PrivacyReviewStatus
): Promise<AlbumRecord | null> {
  return updateAlbum(id, { privacyReviewStatus });
}

export async function deleteAlbum(id: number): Promise<AlbumRecord | null> {
  const existing = await getAlbumById(id);
  if (!existing) return null;
  await getDbClient().execute({
    sql: "UPDATE activity_albums SET deleted_at = unixepoch(), status = 'archived', featured = 0, updated_at = unixepoch() WHERE id = ? AND deleted_at IS NULL",
    args: [id],
  });
  return getAlbumById(id, true);
}

export async function restoreDeletedAlbum(id: number): Promise<AlbumRecord | null> {
  const db = getDbClient();
  const existing = await getAlbumById(id, true);
  if (!existing || !existing.deletedAt) return null;
  await db.execute({
    sql: "UPDATE activity_albums SET deleted_at = NULL, status = 'draft', featured = 0, updated_at = unixepoch() WHERE id = ?",
    args: [id],
  });
  return getAlbumById(id);
}

export async function purgeAlbum(id: number): Promise<AlbumRecord | null> {
  const existing = await getAlbumById(id, true);
  if (!existing) return null;
  await withTransaction(async (db) => {
    await db.execute({ sql: 'DELETE FROM album_media_assets WHERE album_id = ?', args: [id] });
    await db.execute({ sql: 'DELETE FROM activity_albums WHERE id = ?', args: [id] });
  });
  return existing;
}

export async function getGalleryBackupData(): Promise<{
  categories: Record<string, unknown>[];
  albums: Record<string, unknown>[];
  albumMedia: Record<string, unknown>[];
}> {
  const db = getDbClient();
  const [categories, albums, albumMediaRows] = await Promise.all([
    db.execute('SELECT * FROM activity_categories ORDER BY id'),
    db.execute('SELECT * FROM activity_albums ORDER BY id'),
    db.execute('SELECT * FROM album_media_assets ORDER BY album_id, sort_order, media_asset_id'),
  ]);
  const plain = (rows: readonly Record<string, unknown>[]) => rows.map((row) => ({ ...row }));
  return {
    categories: plain(categories.rows as unknown as Record<string, unknown>[]),
    albums: plain(albums.rows as unknown as Record<string, unknown>[]),
    albumMedia: plain(albumMediaRows.rows as unknown as Record<string, unknown>[]),
  };
}
