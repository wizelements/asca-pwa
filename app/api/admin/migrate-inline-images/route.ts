import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { getSettings, updateSettings, getTheme, updateTheme } from '@/lib/db/queries';
import { CACHE_TAG_SETTINGS, CACHE_TAG_THEME } from '@/lib/db/queries-cache';

function canWrite(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canWrite(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await getSettings();
    const migratedSettings = await updateSettings({ heroes: settings.heroes });

    const theme = await getTheme();
    const migratedTheme = await updateTheme({ logo: theme.logo, favicon: theme.favicon });

    revalidateTag(CACHE_TAG_SETTINGS);
    revalidateTag(CACHE_TAG_THEME);

    const wasBase64 = (value?: string) => value?.startsWith('data:image/') ?? false;
    const heroSources = Object.values(migratedSettings.heroes).map((h) => h.src || h.image || '');

    return NextResponse.json({
      ok: true,
      heroes: {
        total: heroSources.length,
        remainingBase64: heroSources.filter(wasBase64).length,
      },
      theme: {
        logoRemainingBase64: wasBase64(migratedTheme.logo),
        faviconRemainingBase64: wasBase64(migratedTheme.favicon),
      },
    });
  } catch (error: any) {
    console.error('[MIGRATE INLINE IMAGES]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}
