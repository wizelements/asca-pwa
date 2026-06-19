import { requireAuth } from '@/lib/auth';
import { getRecentActivity } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const activity = await getRecentActivity(limit);
    return NextResponse.json(activity);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
