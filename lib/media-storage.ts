import { createHash } from 'node:crypto';

import { getDb } from '@/lib/db';

const DATA_IMAGE_PATTERN = /^data:(image\/(?:avif|gif|jpeg|png|webp));base64,([a-z0-9+/=\s]+)$/i;
const MAX_DATA_URL_LENGTH = 8 * 1024 * 1024;

export function mediaAssetUrl(id: string, version: string | number): string {
  return `/api/media/asset/${encodeURIComponent(id)}?v=${encodeURIComponent(String(version))}`;
}

export function legacySiteMediaUrl(slot: string, version: string | number): string {
  return `/api/media/site/${encodeURIComponent(slot)}?v=${encodeURIComponent(String(version))}`;
}

export function legacyGalleryMediaUrl(id: number, version: string | number): string {
  return `/api/media/gallery/${id}?v=${encodeURIComponent(String(version))}`;
}

export function decodeDataImage(dataUrl: string): { bytes: Uint8Array; contentType: string } {
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    throw new Error('Optimized image is too large to store.');
  }

  const match = DATA_IMAGE_PATTERN.exec(dataUrl);
  if (!match) {
    throw new Error('Only base64-encoded AVIF, GIF, JPEG, PNG, and WebP images are supported.');
  }

  return {
    bytes: Uint8Array.from(Buffer.from(match[2], 'base64')),
    contentType: match[1].toLowerCase(),
  };
}

export async function createMediaAsset(dataUrl: string): Promise<string> {
  decodeDataImage(dataUrl);

  const version = createHash('sha256').update(dataUrl).digest('hex').slice(0, 20);
  const id = `asset-${version}`;
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO media_assets (id, data_url, created_at, updated_at)
          VALUES (?, ?, unixepoch(), unixepoch())
          ON CONFLICT(id) DO UPDATE SET data_url = excluded.data_url, updated_at = unixepoch()`,
    args: [id, dataUrl],
  });

  return mediaAssetUrl(id, version);
}

export async function getMediaAssetDataUrl(id: string): Promise<string | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT data_url FROM media_assets WHERE id = ?',
    args: [id],
  });
  const value = result.rows[0]?.data_url;
  return typeof value === 'string' ? value : null;
}

export async function getLegacySiteDataUrl(slot: string): Promise<string | null> {
  const legacySlot = slot.replace(/\./g, '_');
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT COALESCE(
            NULLIF(json_extract(media.value, '$.src'), ''),
            NULLIF(json_extract(media.value, '$.image'), '')
          ) AS data_url
          FROM settings, json_each(settings.heroes) AS media
          WHERE settings.id = 1 AND media.key IN (?, ?)
          ORDER BY CASE WHEN media.key = ? THEN 0 ELSE 1 END
          LIMIT 1`,
    args: [slot, legacySlot, slot],
  });
  const value = result.rows[0]?.data_url;
  return typeof value === 'string' ? value : null;
}

export async function getLegacyGalleryDataUrl(id: number): Promise<string | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT image FROM gallery_images WHERE id = ?',
    args: [id],
  });
  const value = result.rows[0]?.image;
  return typeof value === 'string' ? value : null;
}

export async function getMediaAssetsForExport() {
  const db = getDb();
  const result = await db.execute(
    'SELECT id, data_url, created_at, updated_at FROM media_assets ORDER BY id'
  );
  return result.rows;
}
