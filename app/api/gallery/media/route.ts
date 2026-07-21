import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canEdit } from '@/lib/gallery/services/authorization';
import { createMediaAssetFromDataUrl, ALLOWED_IMAGE_TYPES } from '@/lib/gallery/services/media';

const MAX_UPLOAD_SIZE = 6 * 1024 * 1024; // 6 MB data URL cap

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidPayload(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const body = await request.json();
    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';

    if (!dataUrl.startsWith('data:image/')) {
      return invalidPayload('Only base64-encoded images are accepted.');
    }
    if (dataUrl.length > MAX_UPLOAD_SIZE) {
      return invalidPayload('Image exceeds the 6 MB upload limit.');
    }

    const match = /^data:(image\/[^;]+);base64,/i.exec(dataUrl);
    const mimeType = match?.[1]?.toLowerCase();
    if (!mimeType || !ALLOWED_IMAGE_TYPES.has(mimeType)) {
      return invalidPayload(`Unsupported image type: ${mimeType || 'unknown'}. Allowed: JPEG, PNG, WebP, GIF, AVIF.`);
    }

    const asset = await createMediaAssetFromDataUrl(dataUrl);
    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error('[GALLERY MEDIA POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to store media asset' }, { status: 500 });
  }
}
