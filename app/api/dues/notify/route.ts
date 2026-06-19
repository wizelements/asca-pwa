import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!process.env.DUES_CRON_SECRET || authHeader !== `Bearer ${process.env.DUES_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    { error: 'Dues notifications are not yet configured in this version.' },
    { status: 501 }
  );
}
