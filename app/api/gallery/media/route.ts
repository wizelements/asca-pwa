import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canEdit } from '@/lib/gallery/services/authorization';
import { createMediaAssetFromDataUrl } from '@/lib/gallery/services/media';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidDataUrl() {
  return NextResponse.json({ error: 'Invalid data URL' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const body = await request.json();
    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';

    if (!dataUrl.startsWith('data:image/')) {
      return invalidDataUrl();
    }

    const asset = await createMediaAssetFromDataUrl(dataUrl);
    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error('[GALLERY MEDIA POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to store media asset' }, { status: 500 });
  }
}
