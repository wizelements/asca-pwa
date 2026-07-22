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

// Cache invalidation must never fail the write that triggered it.
// revalidateTag throws when called outside a Next.js request context
// (for example in plain-node tests), so failures are logged and swallowed.
function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag);
  } catch (error) {
    console.warn(`[cache] revalidateTag(${tag}) skipped:`, error instanceof Error ? error.message : error);
  }
}

export function invalidateAlbums(): void {
  safeRevalidateTag(CACHE_TAG_ALBUMS);
  safeRevalidateTag(CACHE_TAG_GALLERY_LEGACY);
}

export function invalidateHomepage(): void {
  safeRevalidateTag(CACHE_TAG_HOME);
}

export function invalidateCategories(): void {
  safeRevalidateTag(CACHE_TAG_CATEGORIES);
  safeRevalidateTag(CACHE_TAG_ALBUMS);
}

export function invalidateHorses(): void {
  safeRevalidateTag(CACHE_TAG_HORSES);
}

export function invalidateLegacyReview(): void {
  safeRevalidateTag(CACHE_TAG_LEGACY_REVIEW);
}

export function invalidateMediaIntegrity(): void {
  safeRevalidateTag(CACHE_TAG_MEDIA_INTEGRITY);
}

export function invalidateAlbumPublicSurfaces(): void {
  invalidateAlbums();
  invalidateHomepage();
  invalidateCategories();
}

export function invalidateHorsePublicSurfaces(): void {
  invalidateHorses();
}
