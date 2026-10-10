import { getDbClient } from './db.ts';
import { getSettings, getTheme } from '../../db/queries.ts';
import { getManagedImagesFromRecord } from '../../media.ts';

export interface MediaReference {
  mediaAssetId: string;
  location: string;
  contextId?: string | number;
  url?: string;
}

export interface MediaIntegrityReport {
  totalAssets: number;
  totalReferenced: number;
  uniqueReferenced: number;
  orphanCandidates: string[];
  orphanDetails: Array<{ mediaAssetId: string; bytes: number; createdAt: string | null; updatedAt: string | null }>;
  missingReferences: MediaReference[];
  multiReferenced: Array<{ mediaAssetId: string; count: number; locations: string[] }>;
  byLocation: Record<string, number>;
  approximateBytes: number;
}

export function extractAssetIdFromUrl(url: string): string | null {
  if (url.startsWith('/api/media/asset/')) {
    return url.replace('/api/media/asset/', '').split('?')[0];
  }
  return null;
}

export async function getMediaIntegrityReport(): Promise<MediaIntegrityReport> {
  const db = getDbClient();
  const [
    assets,
    galleryRows,
    albumCoverRows,
    albumMediaRows,
    horsePrimaryRows,
    horseMediaRows,
    eventRows,
    memberRows,
    blogRows,
    settingsRow,
    themeRow,
  ] = await Promise.all([
    db.execute('SELECT id, length(data_url) as bytes, created_at, updated_at FROM media_assets'),
    db.execute('SELECT id, image FROM gallery_images WHERE image LIKE \'/api/media/asset/%\''),
    db.execute('SELECT id, cover_media_asset_id FROM activity_albums WHERE cover_media_asset_id IS NOT NULL'),
    db.execute('SELECT album_id, media_asset_id FROM album_media_assets'),
    db.execute('SELECT id, primary_media_asset_id FROM horse_profiles WHERE primary_media_asset_id IS NOT NULL'),
    db.execute('SELECT horse_profile_id, media_asset_id FROM horse_profile_media'),
    db.execute('SELECT id, image_url FROM events WHERE image_url LIKE \'/api/media/asset/%\''),
    db.execute('SELECT id, photo FROM members WHERE photo LIKE \'/api/media/asset/%\''),
    db.execute('SELECT id, image FROM blog_posts WHERE image LIKE \'/api/media/asset/%\''),
    getSettings().catch(() => null),
    getTheme().catch(() => null),
  ]);

  const references: MediaReference[] = [];

  // Legacy gallery images referencing media_assets
  for (const row of galleryRows.rows) {
    const id = extractAssetIdFromUrl(String(row.image));
    if (id) references.push({ mediaAssetId: id, location: 'gallery_images', contextId: Number(row.id), url: String(row.image) });
  }

  // Album covers
  for (const row of albumCoverRows.rows) {
    references.push({ mediaAssetId: String(row.cover_media_asset_id), location: 'album_cover', contextId: Number(row.id) });
  }

  // Album media
  for (const row of albumMediaRows.rows) {
    references.push({ mediaAssetId: String(row.media_asset_id), location: 'album_media', contextId: Number(row.album_id) });
  }

  // Horse primary images
  for (const row of horsePrimaryRows.rows) {
    references.push({ mediaAssetId: String(row.primary_media_asset_id), location: 'horse_primary', contextId: Number(row.id) });
  }

  // Horse additional media
  for (const row of horseMediaRows.rows) {
    references.push({ mediaAssetId: String(row.media_asset_id), location: 'horse_media', contextId: Number(row.horse_profile_id) });
  }

  // Other image-bearing records.
  for (const row of eventRows.rows) {
    const id = extractAssetIdFromUrl(String(row.image_url || ''));
    if (id) references.push({ mediaAssetId: id, location: 'event_image', contextId: Number(row.id), url: String(row.image_url) });
  }
  for (const row of memberRows.rows) {
    const id = extractAssetIdFromUrl(String(row.photo || ''));
    if (id) references.push({ mediaAssetId: id, location: 'member_photo', contextId: Number(row.id), url: String(row.photo) });
  }
  for (const row of blogRows.rows) {
    const id = extractAssetIdFromUrl(String(row.image || ''));
    if (id) references.push({ mediaAssetId: id, location: 'blog_image', contextId: Number(row.id), url: String(row.image) });
  }

  // Managed page images (settings.heroes)
  if (settingsRow) {
    const managed = getManagedImagesFromRecord(settingsRow.heroes as Record<string, any>);
    for (const image of managed) {
      const id = extractAssetIdFromUrl(image.src);
      if (id) references.push({ mediaAssetId: id, location: 'managed_page_image', contextId: image.slot, url: image.src });
    }
  }

  // Theme brand assets are stored separately from page-image settings.
  if (themeRow) {
    const logoId = extractAssetIdFromUrl(String(themeRow.logo || ''));
    const faviconId = extractAssetIdFromUrl(String(themeRow.favicon || ''));
    if (logoId) references.push({ mediaAssetId: logoId, location: 'theme_logo', url: String(themeRow.logo) });
    if (faviconId) references.push({ mediaAssetId: faviconId, location: 'theme_favicon', url: String(themeRow.favicon) });
  }

  const assetIds = new Set(assets.rows.map((r) => String(r.id)));
  const approximateBytes = assets.rows.reduce((sum, r) => sum + Number(r.bytes ?? 0), 0);

  const counts = new Map<string, { count: number; locations: Set<string> }>();
  const byLocation: Record<string, number> = {};
  const missing: MediaReference[] = [];

  for (const ref of references) {
    const entry = counts.get(ref.mediaAssetId) ?? { count: 0, locations: new Set() };
    entry.count++;
    entry.locations.add(ref.location);
    counts.set(ref.mediaAssetId, entry);

    byLocation[ref.location] = (byLocation[ref.location] ?? 0) + 1;

    if (!assetIds.has(ref.mediaAssetId)) {
      missing.push(ref);
    }
  }

  const multiReferenced = Array.from(counts.entries())
    .filter(([_, v]) => v.count > 1)
    .map(([mediaAssetId, v]) => ({
      mediaAssetId,
      count: v.count,
      locations: Array.from(v.locations),
    }))
    .sort((a, b) => b.count - a.count);

  const referencedIds = new Set(counts.keys());
  const orphanCandidates = Array.from(assetIds).filter((id) => !referencedIds.has(id));
  const assetRowsById = new Map(assets.rows.map((row) => [String(row.id), row]));
  const orphanDetails = orphanCandidates.map((mediaAssetId) => {
    const row = assetRowsById.get(mediaAssetId);
    const createdAt = Number(row?.created_at || 0);
    const updatedAt = Number(row?.updated_at || 0);
    return {
      mediaAssetId,
      bytes: Number(row?.bytes || 0),
      createdAt: createdAt > 0 ? new Date(createdAt * 1000).toISOString() : null,
      updatedAt: updatedAt > 0 ? new Date(updatedAt * 1000).toISOString() : null,
    };
  });

  return {
    totalAssets: assetIds.size,
    totalReferenced: references.length,
    uniqueReferenced: referencedIds.size,
    orphanCandidates,
    orphanDetails,
    missingReferences: missing,
    multiReferenced,
    byLocation,
    approximateBytes,
  };
}
