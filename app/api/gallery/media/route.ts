import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canEdit } from '@/lib/gallery/services/authorization';
import { createMediaAssetFromDataUrl, ALLOWED_IMAGE_TYPES, deleteMediaAsset } from '@/lib/gallery/services/media';
import { getDbClient } from '@/lib/gallery/services/db';
import { logActivity } from '@/lib/db/queries';

const MAX_UPLOAD_SIZE = 6 * 1024 * 1024;
const MAX_REQUEST_BYTES = 8 * 1024 * 1024;
const UPLOAD_WINDOW_SECONDS = 10 * 60;
const MAX_UPLOADS_PER_WINDOW = 120;

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidPayload(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

async function uploadRateLimited(userEmail: string): Promise<boolean> {
  const db = getDbClient();
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as c FROM activities WHERE type = ? AND user = ? AND timestamp >= unixepoch() - ?',
    args: ['gallery_upload', userEmail, UPLOAD_WINDOW_SECONDS],
  });
  return Number(result.rows[0]?.c ?? 0) >= MAX_UPLOADS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const contentLength = Number(request.headers.get('content-length') || '0');
    if (contentLength > MAX_REQUEST_BYTES) {
      return new NextResponse(JSON.stringify({ error: 'Upload request is too large.' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (await uploadRateLimited(user.email)) {
      return NextResponse.json(
        { error: 'Upload limit reached. Try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(UPLOAD_WINDOW_SECONDS) } }
      );
    }

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
      return invalidPayload('Unsupported image type: ' + (mimeType || 'unknown') + '. Allowed: JPEG, PNG, WebP, GIF, AVIF.');
    }

    const asset = await createMediaAssetFromDataUrl(dataUrl);
    await logActivity('gallery_upload', 'Uploaded gallery media asset ' + asset.id, user.email);
    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    console.error('[GALLERY MEDIA POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to store media asset' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return invalidPayload('Media asset ID required');

    await deleteMediaAsset(id);
    await logActivity('gallery_upload', 'Deleted unused gallery media asset ' + id, user.email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[GALLERY MEDIA DELETE]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (String(error.message || '').startsWith('Media asset is still in use')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Failed to delete media asset' }, { status: 500 });
  }
}
