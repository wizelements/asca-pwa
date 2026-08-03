import { unstable_cache } from 'next/cache';
import {
  getGalleryImages as getGalleryImagesRaw,
  getSiteTagline as getSiteTaglineRaw,
  getSettings as getSettingsRaw,
  getTheme as getThemeRaw,
  type Theme,
} from './queries';
import { getPublicEvents as getPublicEventsRaw } from '@/lib/events';
import { getManagedImagesFromRecord, type ManagedImage } from '@/lib/media';
import { legacySiteMediaUrl } from '@/lib/media-storage';

const CACHE_TAG_SETTINGS = 'settings';
const CACHE_TAG_THEME = 'theme';
const CACHE_TAG_EVENTS = 'events';
const CACHE_TAG_GALLERY = 'gallery';

export const getCachedManagedImages = unstable_cache(
  async (): Promise<ManagedImage[]> => {
    const settings = await getSettingsRaw();
    const version = settings.updatedAt instanceof Date
      ? settings.updatedAt.getTime()
      : Date.parse(String(settings.updatedAt || '')) || 0;
    return getManagedImagesFromRecord(settings.heroes as any).map((image) => (
      image.src.startsWith('data:image/')
        ? { ...image, src: legacySiteMediaUrl(image.slot, version) }
        : image
    ));
  },
  ['managed-images-public'],
  { revalidate: 60, tags: [CACHE_TAG_SETTINGS] }
);

export const getCachedTheme = unstable_cache(
  async (): Promise<Theme> => getThemeRaw(),
  ['theme-public'],
  { revalidate: 60, tags: [CACHE_TAG_THEME] }
);

export const getCachedSiteTagline = unstable_cache(
  async (): Promise<string> => getSiteTaglineRaw(),
  ['site-tagline-public'],
  { revalidate: 60, tags: [CACHE_TAG_SETTINGS] }
);

export const getCachedPublicEvents = unstable_cache(
  async () => getPublicEventsRaw(),
  ['events-public'],
  { revalidate: 60, tags: [CACHE_TAG_EVENTS] }
);

export const getCachedGalleryImages = unstable_cache(
  async (category?: string) => {
    try {
      return await getGalleryImagesRaw(category, true);
    } catch (error) {
      console.error('[PUBLIC GALLERY]', error);
      return [];
    }
  },
  ['gallery-public'],
  { revalidate: 60, tags: [CACHE_TAG_GALLERY] }
);

export { CACHE_TAG_SETTINGS, CACHE_TAG_THEME, CACHE_TAG_EVENTS, CACHE_TAG_GALLERY };
