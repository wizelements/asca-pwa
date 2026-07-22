import { getDbClient, type DbClient } from './db.ts';
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
  const version = updatedAt ? Math.floor(updatedAt.getTime() / 1000) : Date.now();
  return mediaAssetUrl(id, version);
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const db = getDbClient();
  await db.execute({
    sql: 'DELETE FROM media_assets WHERE id = ?',
    args: [id],
  });
}
