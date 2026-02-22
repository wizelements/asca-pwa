import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In production, fetch from MongoDB activity log
    // For now, return mock data
    const activity = [
      {
        id: '1',
        type: 'Event Created',
        title: 'Summer Riding Competition',
        timestamp: '2 hours ago',
        user: 'Admin',
      },
      {
        id: '2',
        type: 'Member Added',
        title: 'John Smith registered',
        timestamp: '5 hours ago',
        user: 'System',
      },
      {
        id: '3',
        type: 'Blog Published',
        title: 'New Training Guide Released',
        timestamp: '1 day ago',
        user: 'Editor',
      },
      {
        id: '4',
        type: 'Settings Updated',
        title: 'Theme colors modified',
        timestamp: '2 days ago',
        user: 'Admin',
      },
      {
        id: '5',
        type: 'Form Submitted',
        title: 'Contact form submission',
        timestamp: '3 days ago',
        user: 'Visitor',
      },
    ];

    return NextResponse.json(activity, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
