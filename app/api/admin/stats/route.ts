import { requireAuth } from '@/lib/auth';
import { getRecentActivity, getStats } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);

    const stats = await getStats();
    const activity = await getRecentActivity(5);

    return NextResponse.json({
      ...stats,
      recentActivity: activity,
      user,
    }, {
      headers: {
        'Cache-Control': 'private, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[ADMIN STATS]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
