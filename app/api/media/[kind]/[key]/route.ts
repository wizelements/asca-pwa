import { NextRequest, NextResponse } from 'next/server';

import { DEFAULT_MANAGED_IMAGES } from '@/lib/media';
import {
  decodeDataImage,
  getLegacyGalleryDataUrl,
  getLegacySiteDataUrl,
  getMediaAssetDataUrl,
} from '@/lib/media-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_SLOTS: ReadonlySet<string> = new Set([
  ...DEFAULT_MANAGED_IMAGES.map((image) => image.slot),
  'theme.logo',
]);

function cacheControl(request: NextRequest): string {
  return request.nextUrl.searchParams.has('v')
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=0, must-revalidate';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kind: string; key: string }> }
) {
  try {
    const { kind, key } = await params;
    let dataUrl: string | null = null;

    if (kind === 'asset') {
      if (!/^[a-z0-9:._-]{1,120}$/i.test(key)) {
        return new NextResponse('Not found', { status: 404 });
      }
      dataUrl = await getMediaAssetDataUrl(key);
    } else if (kind === 'site') {
      if (!SITE_SLOTS.has(key)) {
        return new NextResponse('Not found', { status: 404 });
      }
      dataUrl = await getLegacySiteDataUrl(key);
    } else if (kind === 'gallery') {
      const id = Number(key);
      if (!Number.isSafeInteger(id) || id < 1) {
        return new NextResponse('Not found', { status: 404 });
      }
      dataUrl = await getLegacyGalleryDataUrl(id);
    } else {
      return new NextResponse('Not found', { status: 404 });
    }

    if (!dataUrl?.startsWith('data:image/')) {
      return new NextResponse('Not found', { status: 404 });
    }

    const { bytes, contentType } = decodeDataImage(dataUrl);
    const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
    return new NextResponse(body, {
      headers: {
        'Cache-Control': cacheControl(request),
        'Content-Length': String(bytes.byteLength),
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[MEDIA GET]', error);
    return new NextResponse('Unable to load image', { status: 500 });
  }
}
