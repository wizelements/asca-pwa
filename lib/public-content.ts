import { getCachedManagedImages } from '@/lib/db/queries-cache';
import { DEFAULT_MANAGED_IMAGES, type ManagedImage } from '@/lib/media';

export async function getPublicManagedImages(): Promise<ManagedImage[]> {
  try {
    return await getCachedManagedImages();
  } catch (error) {
    console.error('[PUBLIC MEDIA]', error);
    return DEFAULT_MANAGED_IMAGES;
  }
}
