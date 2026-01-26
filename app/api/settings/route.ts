import { connectDB } from '@/lib/db';
import { Settings } from '@/lib/models/Settings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    let settings = await Settings.findOne().lean();
    
    if (!settings) {
      // Create default settings
      const defaultSettings = new Settings({
        siteTitle: 'Atlanta Saddle Club Association',
        siteDescription: 'We Ride To Inspire',
        siteUrl: 'https://atlantasaddleclub.com',
      });
      settings = await defaultSettings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    const settings = await Settings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
    });
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
