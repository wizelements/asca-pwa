import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostById,
  getBlogPostBySlug,
  getBlogPosts,
  updateBlogPost,
  logActivity,
  type BlogPost,
} from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const publishedParam = searchParams.get('published');

    if (id) {
      const post = await getBlogPostById(Number(id));
      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }

    if (slug) {
      const post = await getBlogPostBySlug(slug);
      if (!post) {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }

    const published = publishedParam !== null ? publishedParam === 'true' : undefined;
    const posts = await getBlogPosts(published);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('[BLOG GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    if (!body.title || !body.content || !body.slug || !body.author) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await getBlogPostBySlug(body.slug);
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const post = await createBlogPost({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      author: body.author,
      image: body.image,
      category: body.category || 'general',
      published: Boolean(body.published),
    } as any);

    await logActivity('blog', `Created blog post "${post.title}"`, user.name || user.email);
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('[BLOG POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Blog post ID required' }, { status: 400 });
    }

    const existing = await getBlogPostById(Number(id));
    if (!existing) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (updates.slug && updates.slug !== existing.slug) {
      const conflict = await getBlogPostBySlug(updates.slug);
      if (conflict) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    const data: Partial<BlogPost> = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.slug !== undefined) data.slug = updates.slug;
    if (updates.excerpt !== undefined) data.excerpt = updates.excerpt;
    if (updates.content !== undefined) data.content = updates.content;
    if (updates.author !== undefined) data.author = updates.author;
    if (updates.image !== undefined) data.image = updates.image;
    if (updates.category !== undefined) data.category = updates.category;
    if (updates.published !== undefined) data.published = Boolean(updates.published);

    const post = await updateBlogPost(Number(id), data);
    await logActivity('blog', `Updated blog post "${post?.title}"`, user.name || user.email);

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('[BLOG PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Blog post ID required' }, { status: 400 });
    }

    const post = await getBlogPostById(Number(id));
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    await deleteBlogPost(Number(id));
    await logActivity('blog', `Deleted blog post "${post.title}"`, user.name || user.email);

    return NextResponse.json({ success: true, message: 'Blog post deleted' });
  } catch (error: any) {
    console.error('[BLOG DELETE]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
