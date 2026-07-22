import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canAdmin } from '@/lib/gallery/services/authorization';
import { getMediaIntegrityReport } from '@/lib/gallery/services/media-integrity';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canAdmin(user)) return forbidden();

    const report = await getMediaIntegrityReport();
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[MEDIA INTEGRITY GET]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to generate media integrity report' }, { status: 500 });
  }
}
