import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const posts = await getBlogPosts(true);

    const result = limit ? posts.slice(0, Number(limit)) : posts;

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[BLOG PUBLIC GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
