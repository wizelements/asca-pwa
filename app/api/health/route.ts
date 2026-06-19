import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = getDb();
    await db.execute('SELECT 1');
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      },
      { status: 503 }
    );
  }
}
