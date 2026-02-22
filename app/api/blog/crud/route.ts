import { connectDB } from '@/lib/db';
import { BlogPost } from '@/lib/models/BlogPost';
import { NextRequest, NextResponse } from 'next/server';

// GET all blog posts or by ID/slug
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const published = searchParams.get('published');

    if (id) {
      const post = await BlogPost.findById(id);
      if (!post) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(post);
    }

    if (slug) {
      const post = await BlogPost.findOne({ slug });
      if (!post) {
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      // Increment view count
      post.viewCount = (post.viewCount || 0) + 1;
      await post.save();
      return NextResponse.json(post);
    }

    const query = published !== null ? { published: published === 'true' } : {};
    const posts = await BlogPost.find(query).sort({ publishedAt: -1 });

    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[BLOG GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// CREATE blog post
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Validate required fields
    const { title, content, slug, author, categories } = data;
    if (!title || !content || !slug || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const post = new BlogPost({
      ...data,
      publishedAt: data.published ? new Date() : undefined,
    });

    const saved = await post.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('[BLOG POST]', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

// UPDATE blog post
export async function PUT(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Blog post ID required' },
        { status: 400 }
      );
    }

    const post = await BlogPost.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Handle slug changes (check uniqueness)
    if (data.slug && data.slug !== post.slug) {
      const existing = await BlogPost.findOne({ slug: data.slug });
      if (existing) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update publishedAt if status changes to published
    if (data.published && !post.published) {
      data.publishedAt = new Date();
    }

    const updated = await BlogPost.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[BLOG PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE blog post
export async function DELETE(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Blog post ID required' },
        { status: 400 }
      );
    }

    const deleted = await BlogPost.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    console.error('[BLOG DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
