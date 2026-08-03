import { NextRequest, NextResponse } from 'next/server';
import { getMembers } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const members = await getMembers(true);

    const result = limit ? members.slice(0, Number(limit)) : members;

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[MEMBERS PUBLIC GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
