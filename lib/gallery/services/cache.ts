import { revalidateTag } from 'next/cache';

export const CACHE_TAG_HOME = 'homepage';
export const CACHE_TAG_GALLERY_LEGACY = 'gallery';
export const CACHE_TAG_ALBUMS = 'albums';
export const CACHE_TAG_CATEGORIES = 'categories';
export const CACHE_TAG_HORSES = 'horses';
export const CACHE_TAG_LEGACY_REVIEW = 'legacy-review';
export const CACHE_TAG_MEDIA_INTEGRITY = 'media-integrity';
export const CACHE_TAG_SETTINGS = 'settings';
export const CACHE_TAG_THEME = 'theme';
export const CACHE_TAG_EVENTS = 'events';

export function invalidateAlbums(): void {
  revalidateTag(CACHE_TAG_ALBUMS);
  revalidateTag(CACHE_TAG_GALLERY_LEGACY);
}

export function invalidateHomepage(): void {
  revalidateTag(CACHE_TAG_HOME);
}

export function invalidateCategories(): void {
  revalidateTag(CACHE_TAG_CATEGORIES);
  revalidateTag(CACHE_TAG_ALBUMS);
}

export function invalidateHorses(): void {
  revalidateTag(CACHE_TAG_HORSES);
}

export function invalidateLegacyReview(): void {
  revalidateTag(CACHE_TAG_LEGACY_REVIEW);
}

export function invalidateMediaIntegrity(): void {
  revalidateTag(CACHE_TAG_MEDIA_INTEGRITY);
}

export function invalidateAlbumPublicSurfaces(): void {
  invalidateAlbums();
  invalidateHomepage();
  invalidateCategories();
}

export function invalidateHorsePublicSurfaces(): void {
  invalidateHorses();
}
