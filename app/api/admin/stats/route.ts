import { connectDB } from '@/lib/db';
import { Event } from '@/lib/models/Event';
import { Member } from '@/lib/models/Member';
import { BlogPost } from '@/lib/models/BlogPost';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch real statistics
    const [
      totalEvents,
      publishedEvents,
      totalMembers,
      activeMembers,
      totalBlogPosts,
      publishedBlogPosts,
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ published: true }),
      Member.countDocuments(),
      Member.countDocuments({ isActive: true }),
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ published: true }),
    ]);

    // Get recent activity
    const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(5);
    const recentBlogPosts = await BlogPost.find().sort({ createdAt: -1 }).limit(5);
    const recentMembers = await Member.find().sort({ createdAt: -1 }).limit(5);

    const stats = {
      events: {
        total: totalEvents,
        published: publishedEvents,
        recent: recentEvents.map((e) => ({
          id: e._id,
          title: e.title,
          createdAt: e.createdAt,
        })),
      },
      members: {
        total: totalMembers,
        active: activeMembers,
        recent: recentMembers.map((m) => ({
          id: m._id,
          name: `${m.firstName} ${m.lastName}`,
          email: m.email,
          joinDate: m.joinDate,
        })),
      },
      blog: {
        total: totalBlogPosts,
        published: publishedBlogPosts,
        recent: recentBlogPosts.map((p) => ({
          id: p._id,
          title: p.title,
          createdAt: p.createdAt,
        })),
      },
      summary: {
        totalContent: totalEvents + totalBlogPosts,
        totalCommunity: totalMembers,
      },
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
