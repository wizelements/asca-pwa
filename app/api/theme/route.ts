import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getTheme, updateTheme, logActivity } from '@/lib/db/queries';

function canWrite(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET() {
  try {
    const theme = await getTheme();
    return NextResponse.json(theme);
  } catch (error) {
    console.error('[THEME GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canWrite(user.role)) return forbidden();
    const data = await request.json();

    const updated = await updateTheme(data);

    await logActivity('theme', 'Updated site theme', user.name || user.email);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[THEME POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to update theme' },
      { status: 500 }
    );
  }
}
