import { getDbClient } from './db.ts';
import {
  createMediaAsset as createStoredAsset,
  mediaAssetUrl,
  getMediaAssetDataUrl,
  ALLOWED_IMAGE_TYPES,
} from '../../media-storage.ts';

export { ALLOWED_IMAGE_TYPES };

export interface MediaAssetRecord {
  id: string;
  dataUrl: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface MediaAssetUsage {
  total: number;
  locations: string[];
}

export async function createMediaAssetFromDataUrl(dataUrl: string): Promise<{ id: string; url: string }> {
  const url = await createStoredAsset(dataUrl);
  const id = url.replace('/api/media/asset/', '').split('?')[0];
  return { id, url };
}

export async function mediaAssetExists(id: string): Promise<boolean> {
  const dataUrl = await getMediaAssetDataUrl(id);
  return dataUrl != null;
}

export async function getMediaAssetById(id: string): Promise<MediaAssetRecord | null> {
  const db = getDbClient();
  const result = await db.execute({
    sql: 'SELECT id, data_url, created_at, updated_at FROM media_assets WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    dataUrl: String(row.data_url),
    createdAt: row.created_at ? new Date(Number(row.created_at) * 1000) : null,
    updatedAt: row.updated_at ? new Date(Number(row.updated_at) * 1000) : null,
  };
}

export function getMediaAssetPublicUrl(id: string, updatedAt?: Date | null): string {
  const version = updatedAt ? Math.floor(updatedAt.getTime() / 1000) : id.replace(/^asset-/, '');
  return mediaAssetUrl(id, version);
}

export async function getMediaAssetUsage(id: string): Promise<MediaAssetUsage> {
  const db = getDbClient();
  const publicUrlPrefix = '/api/media/asset/' + id;
  const results = await Promise.all([
    db.execute({ sql: 'SELECT COUNT(*) as c FROM activity_albums WHERE cover_media_asset_id = ?', args: [id] }),
    db.execute({ sql: 'SELECT COUNT(*) as c FROM album_media_assets WHERE media_asset_id = ?', args: [id] }),
    db.execute({ sql: 'SELECT COUNT(*) as c FROM horse_profiles WHERE primary_media_asset_id = ?', args: [id] }),
    db.execute({ sql: 'SELECT COUNT(*) as c FROM horse_profile_media WHERE media_asset_id = ?', args: [id] }),
    db.execute({ sql: 'SELECT COUNT(*) as c FROM gallery_images WHERE image LIKE ?', args: [publicUrlPrefix + '%'] }),
    db.execute({ sql: 'SELECT COUNT(*) as c FROM settings WHERE heroes LIKE ?', args: ['%' + publicUrlPrefix + '%'] }),
  ]);

  const labels = [
    'album cover',
    'album photo',
    'horse primary photo',
    'horse photo',
    'legacy gallery',
    'page image',
  ];
  const locations: string[] = [];
  let total = 0;

  results.forEach((result, index) => {
    const count = Number(result.rows[0]?.c ?? 0);
    total += count;
    if (count > 0) locations.push(labels[index] + (count > 1 ? 's' : ''));
  });

  return { total, locations };
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const usage = await getMediaAssetUsage(id);
  if (usage.total > 0) {
    throw new Error('Media asset is still in use by: ' + usage.locations.join(', '));
  }

  const db = getDbClient();
  await db.execute({
    sql: 'DELETE FROM media_assets WHERE id = ?',
    args: [id],
  });
}
