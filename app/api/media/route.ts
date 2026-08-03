import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { createMediaAsset } from '@/lib/media-storage';

function canWrite(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canWrite(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (typeof body.dataUrl !== 'string') {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    const url = await createMediaAsset(body.dataUrl);
    return NextResponse.json({ url }, { status: 201 });
  } catch (error: any) {
    console.error('[MEDIA POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof SyntaxError || String(error.message).includes('image')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to store image' }, { status: 500 });
  }
}
