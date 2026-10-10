import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/db/queries';
import {
  CACHE_TAG_SITE_CONTENT,
  getSiteContent,
  updateSiteContent,
} from '@/lib/site-content';

function canWrite(role: string) {
  return role === 'admin' || role === 'editor';
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    return NextResponse.json({ values: await getSiteContent() });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[SITE CONTENT GET]', error);
    return NextResponse.json({ error: 'Unable to load page text.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canWrite(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updates =
      body && typeof body.updates === 'object' && !Array.isArray(body.updates)
        ? body.updates
        : null;
    if (!updates) {
      return NextResponse.json({ error: 'Page text updates are required.' }, { status: 400 });
    }

    const values = await updateSiteContent(updates, Number(user.sub));
    revalidateTag(CACHE_TAG_SITE_CONTENT);
    await logActivity('site-content', 'Updated public page text', user.name || user.email);
    return NextResponse.json({ values });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : 'Unable to save page text.';
    const validation =
      /cannot be blank|must be|needs at least|too many|unknown page text|no page text/i.test(message);
    const notMigrated = /has not been migrated/i.test(message);
    if (!validation && !notMigrated) console.error('[SITE CONTENT POST]', error);
    return NextResponse.json(
      { error: message },
      { status: validation ? 400 : notMigrated ? 503 : 500 }
    );
  }
}
