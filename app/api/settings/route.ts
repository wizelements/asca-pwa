import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { getSettings, updateSettings, logActivity } from '@/lib/db/queries';
import { CACHE_TAG_SETTINGS } from '@/lib/db/queries-cache';

function canWrite(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

function isSafePublicUrl(value: unknown): boolean {
  if (value === '' || value == null) return true;
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isValidEmail(value: unknown): boolean {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

    if (data.contactEmail !== undefined && !isValidEmail(data.contactEmail)) {
      return NextResponse.json({ error: 'Enter a valid public contact email address.' }, { status: 400 });
    }

    if (data.social && typeof data.social === 'object') {
      for (const [network, value] of Object.entries(data.social)) {
        if (!['facebook', 'instagram', 'tiktok'].includes(network)) continue;
        if (!isSafePublicUrl(value)) {
          return NextResponse.json(
            { error: `${network.charAt(0).toUpperCase() + network.slice(1)} must use a valid http:// or https:// URL.` },
            { status: 400 }
          );
        }
      }
    }

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
