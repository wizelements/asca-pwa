import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import {
  createGalleryImage,
  deleteGalleryImage,
  getGalleryImageById,
  getGalleryImages,
  logActivity,
  updateGalleryImage,
  type GalleryImage,
} from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category') || undefined;

    if (id) {
      const image = await getGalleryImageById(Number(id));
      if (!image) {
        return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 });
      }
      return NextResponse.json(image);
    }

    const images = await getGalleryImages(category);
    return NextResponse.json(images);
  } catch (error: any) {
    console.error('[GALLERY GET]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    if (!body.title || !body.image || !body.alt) {
      return NextResponse.json({ error: 'Title, image URL, and alt text are required' }, { status: 400 });
    }

    const image = await createGalleryImage({
      title: body.title,
      description: body.description || '',
      category: body.category || 'Gallery',
      image: body.image,
      alt: body.alt,
    } as Omit<GalleryImage, 'id' | 'uploadedAt'>);

    await logActivity('gallery', `Created gallery image "${image.title}"`, user.name || user.email);
    return NextResponse.json(image, { status: 201 });
  } catch (error: any) {
    console.error('[GALLERY POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Gallery image ID required' }, { status: 400 });
    }

    const data: Partial<GalleryImage> = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.category !== undefined) data.category = updates.category;
    if (updates.image !== undefined) data.image = updates.image;
    if (updates.alt !== undefined) data.alt = updates.alt;

    if (!data.title && !data.image && !data.alt && Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const image = await updateGalleryImage(Number(id), data);
    if (!image) {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 });
    }

    await logActivity('gallery', `Updated gallery image "${image.title}"`, user.name || user.email);
    return NextResponse.json(image);
  } catch (error: any) {
    console.error('[GALLERY PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gallery image ID required' }, { status: 400 });
    }

    const image = await getGalleryImageById(Number(id));
    if (!image) {
      return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 });
    }

    await deleteGalleryImage(Number(id));
    await logActivity('gallery', `Deleted gallery image "${image.title}"`, user.name || user.email);
    return NextResponse.json({ success: true, message: 'Gallery image deleted' });
  } catch (error: any) {
    console.error('[GALLERY DELETE]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 });
  }
}
