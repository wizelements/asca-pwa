import { getDbClient, withTransaction, type DbClient } from './db.ts';
import { getAlbumById, createAlbum, type AlbumInput, type AlbumMediaInput } from './albums.ts';
import { getHorseById, createHorse, type HorseProfileCreateInput, type HorseProfileMediaCreateInput } from './horses.ts';
import type { LegacyGalleryReviewStatus, PrivacyReviewStatus } from '../types.ts';
import { looksLikeHorseTitle } from '../constants.ts';

export type LegacyDestinationType = 'album' | 'horse' | 'review' | 'skip';

export interface LegacyReviewRecord {
  id: number;
  legacyGalleryImageId: number;
  legacyTitle: string;
  legacyCategory: string;
  legacyMediaReference: string;
  proposedDestinationType: LegacyDestinationType;
  proposedCategorySlug: string | null;
  proposedAlbumId: number | null;
  proposedHorseProfileId: number | null;
  migrationConfidence: 'high' | 'medium' | 'low';
  reviewReason: string;
  reviewStatus: LegacyGalleryReviewStatus;
  privacyReviewStatus: PrivacyReviewStatus;
  notes: string | null;
  createdAt: Date | null;
  reviewedAt: Date | null;
  reviewerId: number | null;
}

export interface LegacyReviewFilters {
  status?: LegacyGalleryReviewStatus;
  legacyCategory?: string;
  destinationType?: LegacyDestinationType;
  privacyReviewStatus?: PrivacyReviewStatus;
}

export interface ResolveToAlbumInput {
  reviewId: number;
  albumId?: number; // if approving an existing proposal
  newAlbum?: AlbumInput;
  initialMedia?: AlbumMediaInput[];
  privacyReviewStatus?: PrivacyReviewStatus;
  notes?: string;
  reviewerId: number;
}

export interface ResolveToHorseInput {
  reviewId: number;
  horseProfileId?: number; // if approving an existing proposal
  newHorse?: HorseProfileCreateInput;
  initialMedia?: HorseProfileMediaCreateInput[];
  privacyReviewStatus?: PrivacyReviewStatus;
  notes?: string;
  reviewerId: number;
}

export interface ResolveSkipInput {
  reviewId: number;
  notes?: string;
  reviewerId: number;
}

function rowToReview(row: Record<string, unknown>): LegacyReviewRecord {
  return {
    id: Number(row.id),
    legacyGalleryImageId: Number(row.legacy_gallery_image_id),
    legacyTitle: String(row.legacy_title),
    legacyCategory: String(row.legacy_category),
    legacyMediaReference: String(row.legacy_media_reference),
    proposedDestinationType: String(row.proposed_destination_type) as LegacyDestinationType,
    proposedCategorySlug: row.proposed_category_slug == null ? null : String(row.proposed_category_slug),
    proposedAlbumId: row.proposed_album_id == null ? null : Number(row.proposed_album_id),
    proposedHorseProfileId: row.proposed_horse_profile_id == null ? null : Number(row.proposed_horse_profile_id),
    migrationConfidence: String(row.migration_confidence) as 'high' | 'medium' | 'low',
    reviewReason: String(row.review_reason),
    reviewStatus: String(row.review_status) as LegacyGalleryReviewStatus,
    privacyReviewStatus: String(row.privacy_review_status) as PrivacyReviewStatus,
    notes: row.notes == null ? null : String(row.notes),
    createdAt: row.created_at ? new Date(Number(row.created_at) * 1000) : null,
    reviewedAt: row.reviewed_at ? new Date(Number(row.reviewed_at) * 1000) : null,
    reviewerId: row.reviewer_id == null ? null : Number(row.reviewer_id),
  };
}

function assetIdFromLegacyReference(reference: string): string | null {
  if (reference.startsWith('/api/media/asset/')) {
    return reference.replace('/api/media/asset/', '').split('?')[0];
  }
  if (reference.startsWith('/api/media/gallery/')) {
    return null; // Legacy gallery URLs cannot be directly reused as media_asset.id
  }
  return reference;
}

export async function getLegacyReviewRecords(filters?: LegacyReviewFilters): Promise<LegacyReviewRecord[]> {
  const db = getDbClient();
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (filters?.status) { where.push('review_status = ?'); args.push(filters.status); }
  if (filters?.legacyCategory) { where.push('legacy_category = ?'); args.push(filters.legacyCategory); }
  if (filters?.destinationType) { where.push('proposed_destination_type = ?'); args.push(filters.destinationType); }
  if (filters?.privacyReviewStatus) { where.push('privacy_review_status = ?'); args.push(filters.privacyReviewStatus); }
  const sql = `
    SELECT * FROM legacy_gallery_review
    ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY created_at DESC, id DESC
  `;
  const result = await db.execute({ sql, args });
  return result.rows.map(rowToReview);
}

export async function getLegacyReviewById(id: number): Promise<LegacyReviewRecord | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: 'SELECT * FROM legacy_gallery_review WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToReview(result.rows[0]);
}

export async function updateLegacyReviewPrivacy(
  id: number,
  privacyReviewStatus: PrivacyReviewStatus,
  notes?: string,
  reviewerId?: number
): Promise<LegacyReviewRecord | null> {
  const db = getDbClient();
  const existing = await getLegacyReviewById(id);
  if (!existing) return null;

  const setters = ['privacy_review_status = ?', 'reviewed_at = unixepoch()'];
  const args: (string | number | null)[] = [privacyReviewStatus];

  if (notes !== undefined) {
    setters.push('notes = ?');
    args.push(notes);
  }
  if (reviewerId !== undefined) {
    setters.push('reviewer_id = ?', 'reviewed_at = unixepoch()');
    args.push(reviewerId);
  }
  args.push(id);

  await db.execute({
    sql: `UPDATE legacy_gallery_review SET ${setters.join(', ')} WHERE id = ?`,
    args,
  });

  return getLegacyReviewById(id);
}

export async function resolveReviewToExistingAlbum(
  reviewId: number,
  albumId: number,
  privacyReviewStatus: PrivacyReviewStatus,
  reviewerId: number,
  notes?: string
): Promise<LegacyReviewRecord | null> {
  const album = await getAlbumById(albumId);
  if (!album) throw new Error(`Album not found: ${albumId}`);

  return withTransaction(async (db) => {
    const reference = (await getLegacyReviewById(reviewId))?.legacyMediaReference;
    if (!reference) throw new Error(`Legacy review not found: ${reviewId}`);
    const assetId = assetIdFromLegacyReference(reference);
    if (assetId) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO album_media_assets (album_id, media_asset_id, sort_order, alt_text) VALUES (?, ?, ?, ?)',
        args: [albumId, assetId, 0, `Migrated from legacy: ${album.title}`],
      });
    }

    const setters = [
      'review_status = ?',
      'proposed_destination_type = ?',
      'proposed_album_id = ?',
      'privacy_review_status = ?',
      'reviewer_id = ?',
      'reviewed_at = unixepoch()',
      'updated_at = unixepoch()',
    ];
    const args: (string | number | null)[] = [
      'resolved',
      'album',
      albumId,
      privacyReviewStatus,
      reviewerId,
    ];
    if (notes !== undefined) {
      setters.push('notes = ?');
      args.push(notes);
    }
    args.push(reviewId);

    await db.execute({
      sql: `UPDATE legacy_gallery_review SET ${setters.join(', ')} WHERE id = ?`,
      args,
    });

    return getLegacyReviewById(reviewId);
  });
}

export async function resolveReviewToNewAlbum(
  reviewId: number,
  albumInput: AlbumInput,
  initialMedia: AlbumMediaInput[],
  reviewerId: number,
  notes?: string
): Promise<LegacyReviewRecord | null> {
  const review = await getLegacyReviewById(reviewId);
  if (!review) throw new Error(`Legacy review not found: ${reviewId}`);

  const album = await createAlbum(albumInput, initialMedia);

  return withTransaction(async (db) => {
    await db.execute({
      sql: `UPDATE legacy_gallery_review SET
        review_status = ?,
        proposed_destination_type = ?,
        proposed_album_id = ?,
        privacy_review_status = ?,
        reviewer_id = ?,
        reviewed_at = unixepoch(),
        updated_at = unixepoch(),
        notes = ?
      WHERE id = ?`,
      args: [
        'resolved',
        'album',
        album.id,
        album.privacyReviewStatus,
        reviewerId,
        notes ?? `Resolved to new album ${album.slug}`,
        reviewId,
      ],
    });
    return getLegacyReviewById(reviewId);
  });
}

export async function resolveReviewToExistingHorse(
  reviewId: number,
  horseProfileId: number,
  privacyReviewStatus: PrivacyReviewStatus,
  reviewerId: number,
  notes?: string
): Promise<LegacyReviewRecord | null> {
  const horse = await getHorseById(horseProfileId);
  if (!horse) throw new Error(`Horse profile not found: ${horseProfileId}`);

  return withTransaction(async (db) => {
    const reference = (await getLegacyReviewById(reviewId))?.legacyMediaReference;
    if (!reference) throw new Error(`Legacy review not found: ${reviewId}`);
    const assetId = assetIdFromLegacyReference(reference);
    if (assetId) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO horse_profile_media (horse_profile_id, media_asset_id, sort_order, alt_text) VALUES (?, ?, ?, ?)',
        args: [horseProfileId, assetId, 0, `Migrated from legacy: ${horse.name}`],
      });
    }

    await db.execute({
      sql: `UPDATE legacy_gallery_review SET
        review_status = ?,
        proposed_destination_type = ?,
        proposed_horse_profile_id = ?,
        privacy_review_status = ?,
        reviewer_id = ?,
        reviewed_at = unixepoch(),
        updated_at = unixepoch(),
        notes = ?
      WHERE id = ?`,
      args: [
        'resolved',
        'horse',
        horseProfileId,
        privacyReviewStatus,
        reviewerId,
        notes ?? `Resolved to existing horse ${horse.slug}`,
        reviewId,
      ],
    });

    return getLegacyReviewById(reviewId);
  });
}

export async function resolveReviewToNewHorse(
  reviewId: number,
  horseInput: HorseProfileCreateInput,
  initialMedia: HorseProfileMediaCreateInput[],
  reviewerId: number,
  notes?: string
): Promise<LegacyReviewRecord | null> {
  const review = await getLegacyReviewById(reviewId);
  if (!review) throw new Error(`Legacy review not found: ${reviewId}`);

  const horseName = looksLikeHorseTitle(review.legacyTitle).name || review.legacyTitle;
  const horse = await createHorse({ ...horseInput, name: horseInput.name || horseName }, initialMedia);

  return withTransaction(async (db) => {
    await db.execute({
      sql: `UPDATE legacy_gallery_review SET
        review_status = ?,
        proposed_destination_type = ?,
        proposed_horse_profile_id = ?,
        privacy_review_status = ?,
        reviewer_id = ?,
        reviewed_at = unixepoch(),
        updated_at = unixepoch(),
        notes = ?
      WHERE id = ?`,
      args: [
        'resolved',
        'horse',
        horse.id,
        horseInput.status === 'published' ? 'not_required' : 'pending',
        reviewerId,
        notes ?? `Resolved to new horse ${horse.slug}`,
        reviewId,
      ],
    });
    return getLegacyReviewById(reviewId);
  });
}

export async function skipReview(
  reviewId: number,
  reviewerId: number,
  notes?: string
): Promise<LegacyReviewRecord | null> {
  const db = getDbClient();
  const existing = await getLegacyReviewById(reviewId);
  if (!existing) return null;
  await db.execute({
    sql: `UPDATE legacy_gallery_review SET
      review_status = ?,
      reviewer_id = ?,
      reviewed_at = unixepoch(),
      updated_at = unixepoch(),
      notes = ?
    WHERE id = ?`,
    args: ['skipped', reviewerId, notes ?? 'Skipped by reviewer', reviewId],
  });
  return getLegacyReviewById(reviewId);
}

export async function resolveReviewToSkip(
  reviewId: number,
  reviewerId: number,
  notes?: string
): Promise<LegacyReviewRecord | null> {
  return skipReview(reviewId, reviewerId, notes);
}

export async function rejectReview(
  reviewId: number,
  reviewerId: number,
  notes?: string
): Promise<LegacyReviewRecord | null> {
  const db = getDbClient();
  const existing = await getLegacyReviewById(reviewId);
  if (!existing) return null;
  await db.execute({
    sql: `UPDATE legacy_gallery_review SET
      review_status = ?,
      privacy_review_status = ?,
      reviewer_id = ?,
      reviewed_at = unixepoch(),
      notes = ?
    WHERE id = ?`,
    args: ['rejected', 'restricted', reviewerId, notes ?? 'Rejected by reviewer', reviewId],
  });
  return getLegacyReviewById(reviewId);
}
