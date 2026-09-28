import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import {
  getEvents,
  getFormSubmissions,
  getGalleryImages,
  getMembers,
  getRecentActivity,
  getSettings,
  getTheme,
} from '@/lib/db/queries';
import { getMediaAssetsForExport } from '@/lib/media-storage';
import { getGalleryBackupData } from '@/lib/gallery/services/albums';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const [
      settings,
      theme,
      events,
      members,
      legacyGalleryImages,
      mediaAssets,
      gallery,
      formSubmissions,
      recentActivity,
    ] = await Promise.all([
      getSettings(),
      getTheme(),
      getEvents(),
      getMembers(),
      getGalleryImages(undefined, undefined, true),
      getMediaAssetsForExport(),
      getGalleryBackupData(),
      getFormSubmissions(),
      getRecentActivity(100),
    ]);

    const exportedAt = new Date().toISOString();
    const payload = {
      exportedAt,
      exportedBy: user.email,
      site: 'Atlanta Saddle Club Association',
      version: 2,
      recoveryNotes: {
        gallerySystem: 'activity_albums',
        includesLegacyGallery: true,
        includesMediaAssets: true,
        restoreOrder: [
          'mediaAssets',
          'gallery.categories',
          'gallery.albums',
          'gallery.albumMedia',
        ],
      },
      data: {
        settings,
        theme,
        events,
        members,
        gallery,
        legacyGalleryImages,
        mediaAssets,
        formSubmissions,
        recentActivity,
      },
    };

    return NextResponse.json(payload, {
      headers: {
        'Content-Disposition': 'attachment; filename="asca-content-backup-' + exportedAt.slice(0, 10) + '.json"',
        'Cache-Control': 'private, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[ADMIN EXPORT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to export admin content' }, { status: 500 });
  }
}
