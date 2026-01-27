import { getSettings, getTheme } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [settings, theme] = await Promise.all([
      getSettings(),
      getTheme(),
    ]);

    return NextResponse.json({
      ...settings,
      theme,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
