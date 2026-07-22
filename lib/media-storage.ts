import { createHash } from 'node:crypto';

import { getDb } from './db.ts';

const DATA_IMAGE_PATTERN = /^data:(image\/(?:avif|gif|jpeg|png|webp));base64,([a-z0-9+/=\s]+)$/i;
const MAX_DATA_URL_LENGTH = 8 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp']);

export function stripImageMetadata(dataUrl: string): string {
  const { bytes, contentType } = decodeDataImage(dataUrl);

  if (contentType === 'image/jpeg') {
    return stripJpegMetadata(bytes, contentType);
  }

  if (contentType === 'image/png') {
    return stripPngMetadata(bytes, contentType);
  }

  if (contentType === 'image/webp') {
    return stripWebpMetadata(bytes, contentType);
  }

  // GIF/AVIF have less pervasive EXIF/GPS metadata; return as-is for now.
  return dataUrl;
}

function reEncodeBase64(bytes: Uint8Array, contentType: string): string {
  return `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`;
}

function stripJpegMetadata(bytes: Uint8Array, contentType: string): string {
  const out: number[] = [];
  let i = 0;
  out.push(bytes[i++]); // SOI 0xFF
  out.push(bytes[i++]); // SOI 0xD8

  while (i < bytes.length) {
    if (bytes[i] !== 0xff) {
      // Corrupted; return original untouched rather than crash.
      return reEncodeBase64(bytes, contentType);
    }
    const marker = bytes[i + 1];
    // Skip stuffing bytes.
    let start = i;
    while (start < bytes.length && bytes[start] === 0xff) start++;
    const actualMarker = bytes[start];
    if (actualMarker === 0xd9 || actualMarker === 0xda) {
      // EOI or SOS: copy rest of file and stop scanning segments.
      for (let k = i; k < bytes.length; k++) out.push(bytes[k]);
      break;
    }
    const length = (bytes[start + 1] << 8) | bytes[start + 2];
    const segmentEnd = start + 1 + length;
    // Drop APP1 (EXIF/XMP) and APP2 (FlashPix/ICC extension).
    const shouldDrop = actualMarker === 0xe1 || actualMarker === 0xe2;
    if (!shouldDrop) {
      for (let k = i; k < segmentEnd; k++) out.push(bytes[k]);
    }
    i = segmentEnd;
  }

  return reEncodeBase64(Uint8Array.from(out), contentType);
}

function stripPngMetadata(bytes: Uint8Array, contentType: string): string {
  // PNG signature + IHDR must be preserved.
  const out: number[] = [];
  for (let i = 0; i < 33; i++) out.push(bytes[i]); // signature(8) + IHDR chunk(25)

  let i = 33;
  while (i < bytes.length) {
    if (i + 12 > bytes.length) break;
    const length = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
    const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);
    const chunkEnd = i + 12 + length;
    const drop = type === 'eXIf' || type === 'iTXt' || type === 'tEXt' || type === 'zTXt';
    if (!drop) {
      for (let k = i; k < chunkEnd; k++) out.push(bytes[k]);
    }
    if (type === 'IEND') break;
    i = chunkEnd;
  }

  return reEncodeBase64(Uint8Array.from(out), contentType);
}

function stripWebpMetadata(bytes: Uint8Array, contentType: string): string {
  // WebP RIFF header: 'RIFF' + size(4) + 'WEBP'.
  const out: number[] = [];
  for (let i = 0; i < 12; i++) out.push(bytes[i]);

  let i = 12;
  while (i < bytes.length) {
    if (i + 8 > bytes.length) break;
    const chunkType = String.fromCharCode(bytes[i], bytes[i + 1], bytes[i + 2], bytes[i + 3]);
    const chunkSize = bytes[i + 4] | (bytes[i + 5] << 8) | (bytes[i + 6] << 16) | (bytes[i + 7] << 24);
    const paddedSize = chunkSize + (chunkSize % 2 === 0 ? 0 : 1);
    const chunkEnd = i + 8 + paddedSize;
    if (chunkType !== 'EXIF') {
      for (let k = i; k < chunkEnd; k++) out.push(bytes[k]);
    }
    i = chunkEnd;
  }

  return reEncodeBase64(Uint8Array.from(out), contentType);
}

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
  const { contentType } = decodeDataImage(dataUrl);
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`Unsupported image type: ${contentType}`);
  }

  const cleanedDataUrl = stripImageMetadata(dataUrl);

  const version = createHash('sha256').update(cleanedDataUrl).digest('hex').slice(0, 20);
  const id = `asset-${version}`;
  const db = getDb();
  await db.execute({
    sql: `INSERT INTO media_assets (id, data_url, created_at, updated_at)
          VALUES (?, ?, unixepoch(), unixepoch())
          ON CONFLICT(id) DO UPDATE SET data_url = excluded.data_url, updated_at = unixepoch()`,
    args: [id, cleanedDataUrl],
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
