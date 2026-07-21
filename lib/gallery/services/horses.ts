import { getDbClient, withTransaction, type DbClient } from './db.ts';
import { getMediaAssetById, getMediaAssetPublicUrl } from './media.ts';
import { slugify, uniqueSlug, isValidSlug } from '../slug.ts';
import type { HorseProfileInput, HorseProfileMediaInput } from '../types.ts';
import { horseProfileInputSchema, horseProfileMediaInputSchema } from '../validation.ts';

export type HorseStatus = NonNullable<HorseProfileInput['status']>;

export interface HorseProfileRecord {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  primaryMediaAssetId: string | null;
  status: HorseStatus;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  primaryUrl: string | null;
  mediaCount: number;
}

export interface HorseProfileMediaRecord {
  horseProfileId: number;
  mediaAssetId: string;
  sortOrder: number;
  caption: string | null;
  altText: string;
  url: string;
}

export interface HorseProfileDetail extends HorseProfileRecord {
  media: HorseProfileMediaRecord[];
}

export interface HorseProfileCreateInput {
  name: string;
  slug: string;
  description?: string | null;
  primaryMediaAssetId?: string | null;
  status?: HorseStatus;
  sortOrder?: number;
}

export interface HorseProfileMediaCreateInput {
  mediaAssetId: string;
  sortOrder?: number;
  caption?: string | null;
  altText: string;
}

function rowToHorse(row: Record<string, unknown>, mediaCount = 0): HorseProfileRecord {
  const primaryId = row.primary_media_asset_id ? String(row.primary_media_asset_id) : null;
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: row.description == null ? null : String(row.description),
    primaryMediaAssetId: primaryId,
    status: String(row.status) as HorseStatus,
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: row.created_at ? new Date(Number(row.created_at) * 1000) : null,
    updatedAt: row.updated_at ? new Date(Number(row.updated_at) * 1000) : null,
    primaryUrl: primaryId ? getMediaAssetPublicUrl(primaryId, row.updated_at ? new Date(Number(row.updated_at) * 1000) : null) : null,
    mediaCount,
  };
}

async function horseMediaCount(db: DbClient, horseId: number): Promise<number> {
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM horse_profile_media WHERE horse_profile_id = ?',
    args: [horseId],
  });
  return Number(result.rows[0]?.c ?? 0);
}

async function horseMedia(db: DbClient, horseId: number): Promise<HorseProfileMediaRecord[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM horse_profile_media WHERE horse_profile_id = ? ORDER BY sort_order, created_at, media_asset_id',
    args: [horseId],
  });
  return result.rows.map((row) => ({
    horseProfileId: Number(row.horse_profile_id),
    mediaAssetId: String(row.media_asset_id),
    sortOrder: Number(row.sort_order ?? 0),
    caption: row.caption == null ? null : String(row.caption),
    altText: String(row.alt_text),
    url: getMediaAssetPublicUrl(String(row.media_asset_id), row.updated_at ? new Date(Number(row.updated_at) * 1000) : null),
  }));
}

function validateInput(input: unknown): HorseProfileInput {
  return horseProfileInputSchema.parse(input);
}

async function ensureUniqueSlug(db: DbClient, slug: string, excludeId?: number): Promise<string> {
  if (!isValidSlug(slug)) {
    throw new Error(`Invalid slug: ${slug}`);
  }
  const result = await db.execute({
    sql: excludeId
      ? 'SELECT slug FROM horse_profiles WHERE slug LIKE ? AND id != ?'
      : 'SELECT slug FROM horse_profiles WHERE slug LIKE ?',
    args: excludeId ? [`${slug}%`, excludeId] : [`${slug}%`],
  });
  const used = new Set(result.rows.map((r) => String(r.slug)));
  return uniqueSlug(slug, used);
}

async function validateMedia(db: DbClient, mediaInputs: HorseProfileMediaInput[]): Promise<void> {
  for (const m of mediaInputs) {
    const exists = await getMediaAssetById(m.mediaAssetId);
    if (!exists) throw new Error(`Media asset not found: ${m.mediaAssetId}`);
  }
}

export async function getPublicHorses(limit?: number): Promise<HorseProfileRecord[]> {
  const db = getDbClient();
  const sql = `
    SELECT h.*,
           (SELECT COUNT(*) FROM horse_profile_media WHERE horse_profile_id = h.id) as media_count
    FROM horse_profiles h
    WHERE h.status = 'published'
      AND h.primary_media_asset_id IS NOT NULL
    ORDER BY h.sort_order, h.name
    ${limit !== undefined ? 'LIMIT ?' : ''}
  `;
  const args = limit !== undefined ? [limit] : [];
  const result = await db.execute({ sql, args });
  return result.rows.map((row) => rowToHorse(row, Number(row.media_count ?? 0)));
}

export async function getHorseDetailBySlug(slug: string): Promise<HorseProfileDetail | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: `
      SELECT h.*,
             (SELECT COUNT(*) FROM horse_profile_media WHERE horse_profile_id = h.id) as media_count
      FROM horse_profiles h
      WHERE h.slug = ?
    `,
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  const horse = rowToHorse(row, Number(row.media_count ?? 0));
  const media = await horseMedia(db, horse.id);
  return { ...horse, media };
}

export async function getAdminHorses(filters?: { status?: HorseStatus }): Promise<HorseProfileRecord[]> {
  const db = getDbClient();
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (filters?.status) {
    where.push('status = ?');
    args.push(filters.status);
  }
  const sql = `
    SELECT h.*,
           (SELECT COUNT(*) FROM horse_profile_media WHERE horse_profile_id = h.id) as media_count
    FROM horse_profiles h
    ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY h.status, h.sort_order, h.name
  `;
  const result = await db.execute({ sql, args });
  return result.rows.map((row) => rowToHorse(row, Number(row.media_count ?? 0)));
}

export async function getHorseById(id: number): Promise<HorseProfileRecord | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: `
      SELECT h.*,
             (SELECT COUNT(*) FROM horse_profile_media WHERE horse_profile_id = h.id) as media_count
      FROM horse_profiles h
      WHERE h.id = ?
    `,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToHorse(result.rows[0], Number(result.rows[0].media_count ?? 0));
}

export async function createHorse(
  input: HorseProfileCreateInput,
  initialMedia: HorseProfileMediaCreateInput[] = []
): Promise<HorseProfileDetail> {
  const validated = validateInput(input);
  return withTransaction(async (db) => {
    const slug = await ensureUniqueSlug(db, validated.slug);
    if (validated.primaryMediaAssetId) {
      const exists = await getMediaAssetById(validated.primaryMediaAssetId);
      if (!exists) throw new Error(`Primary media asset not found: ${validated.primaryMediaAssetId}`);
    }
    await validateMedia(db, initialMedia);

    const result = await db.execute({
      sql: `INSERT INTO horse_profiles
        (name, slug, description, primary_media_asset_id, status, sort_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
      args: [
        validated.name,
        slug,
        validated.description ?? '',
        validated.primaryMediaAssetId ?? null,
        validated.status as HorseStatus,
        validated.sortOrder ?? 0,
      ],
    });
    const horseId = Number(result.lastInsertRowid);

    for (let i = 0; i < initialMedia.length; i++) {
      const m = horseProfileMediaInputSchema.parse(initialMedia[i]);
      await db.execute({
        sql: 'INSERT INTO horse_profile_media (horse_profile_id, media_asset_id, sort_order, caption, alt_text) VALUES (?, ?, ?, ?, ?)',
        args: [horseId, m.mediaAssetId, m.sortOrder ?? i * 10, m.caption ?? null, m.altText],
      });
    }

    const horse = await getHorseById(horseId);
    if (!horse) throw new Error('Horse profile creation failed');
    const media = await horseMedia(db, horseId);
    return { ...horse, media };
  });
}

export async function updateHorse(
  id: number,
  input: Partial<HorseProfileCreateInput>,
  mediaUpdates?: { reorder?: Array<{ mediaAssetId: string; sortOrder: number }>; remove?: string[] }
): Promise<HorseProfileRecord | null> {
  const db = getDbClient();
  const existing = await getHorseById(id);
  if (!existing) return null;

  const updates: string[] = [];
  const args: (string | number | null)[] = [];

  if (input.name !== undefined) { updates.push('name = ?'); args.push(input.name); }
  if (input.slug !== undefined) { args.push(await ensureUniqueSlug(db, input.slug, id)); updates.push('slug = ?'); }
  if (input.description !== undefined) { updates.push('description = ?'); args.push(input.description ?? ''); }
  if (input.primaryMediaAssetId !== undefined) {
    if (input.primaryMediaAssetId) {
      const exists = await getMediaAssetById(input.primaryMediaAssetId);
      if (!exists) throw new Error(`Primary media asset not found: ${input.primaryMediaAssetId}`);
    }
    updates.push('primary_media_asset_id = ?'); args.push(input.primaryMediaAssetId ?? null);
  }
  if (input.status !== undefined) { updates.push('status = ?'); args.push(input.status as HorseStatus); }
  if (input.sortOrder !== undefined) { updates.push('sort_order = ?'); args.push(input.sortOrder ?? 0); }

  if (updates.length > 0) {
    updates.push('updated_at = unixepoch()');
    args.push(id);
    await db.execute({
      sql: `UPDATE horse_profiles SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });
  }

  if (mediaUpdates?.reorder) {
    for (const item of mediaUpdates.reorder) {
      await db.execute({
        sql: 'UPDATE horse_profile_media SET sort_order = ? WHERE horse_profile_id = ? AND media_asset_id = ?',
        args: [item.sortOrder, id, item.mediaAssetId],
      });
    }
  }

  if (mediaUpdates?.remove?.length) {
    for (const mediaAssetId of mediaUpdates.remove) {
      await db.execute({
        sql: 'DELETE FROM horse_profile_media WHERE horse_profile_id = ? AND media_asset_id = ?',
        args: [id, mediaAssetId],
      });
    }
  }

  return getHorseById(id);
}

export async function addHorseMedia(horseId: number, items: HorseProfileMediaCreateInput[]): Promise<HorseProfileRecord | null> {
  const db = getDbClient();
  const horse = await getHorseById(horseId);
  if (!horse) return null;
  await validateMedia(db, items);
  for (let i = 0; i < items.length; i++) {
    const parsed = horseProfileMediaInputSchema.parse(items[i]);
    await db.execute({
      sql: 'INSERT OR IGNORE INTO horse_profile_media (horse_profile_id, media_asset_id, sort_order, caption, alt_text) VALUES (?, ?, ?, ?, ?)',
      args: [horseId, parsed.mediaAssetId, parsed.sortOrder ?? (horse.mediaCount + i) * 10, parsed.caption ?? null, parsed.altText],
    });
  }
  return getHorseById(horseId);
}

export async function updateHorseMediaMeta(
  horseId: number,
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
  args.push(horseId, mediaAssetId);
  await db.execute({
    sql: `UPDATE horse_profile_media SET ${setters.join(', ')} WHERE horse_profile_id = ? AND media_asset_id = ?`,
    args,
  });
}

export async function removeHorseMedia(horseId: number, mediaAssetId: string): Promise<void> {
  const db = getDbClient();
  await db.execute({
    sql: 'DELETE FROM horse_profile_media WHERE horse_profile_id = ? AND media_asset_id = ?',
    args: [horseId, mediaAssetId],
  });
}

export async function publishHorse(id: number): Promise<HorseProfileRecord | null> {
  return updateHorse(id, { status: 'published' });
}

export async function archiveHorse(id: number): Promise<HorseProfileRecord | null> {
  return updateHorse(id, { status: 'archived' });
}
