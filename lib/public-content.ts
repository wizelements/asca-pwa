import { getSettings } from '@/lib/db/queries';
import { DEFAULT_MANAGED_IMAGES, getManagedImagesFromRecord, type ManagedImage } from '@/lib/media';

export async function getPublicManagedImages(): Promise<ManagedImage[]> {
  try {
    const settings = await getSettings();
    return getManagedImagesFromRecord(settings.heroes as any);
  } catch (error) {
    console.error('[PUBLIC MEDIA]', error);
    return DEFAULT_MANAGED_IMAGES;
  }
}
