import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { getSettings, updateSettings, logActivity } from '@/lib/db/queries';
import { CACHE_TAG_SETTINGS } from '@/lib/db/queries-cache';

function canWrite(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[SETTINGS GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canWrite(user.role)) return forbidden();
    const data = await request.json();

    const updated = await updateSettings(data);
    revalidateTag(CACHE_TAG_SETTINGS);
    await logActivity('settings', 'Updated site settings', user.name || user.email);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[SETTINGS POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
