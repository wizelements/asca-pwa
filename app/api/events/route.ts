import { NextRequest, NextResponse } from 'next/server';
import { getEvents } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const events = await getEvents(true);

    const result = limit ? events.slice(0, Number(limit)) : events;

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[EVENTS PUBLIC GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
