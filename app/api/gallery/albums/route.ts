import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import {
  canEdit,
  canAdmin,
} from '@/lib/gallery/services/authorization';
import {
  getAdminAlbums,
  getPublicAlbums,
  getAlbumDetailBySlug,
  getAlbumsByCategory,
  createAlbum,
  updateAlbum,
  publishAlbum,
  archiveAlbum,
  featureAlbum,
  unfeatureAlbum,
  setAlbumPrivacyStatus,
  deleteAlbum,
} from '@/lib/gallery/services/albums';
import { getCategoryBySlug, getCategoryById } from '@/lib/gallery/services/categories';
import {
  invalidateAlbumPublicSurfaces,
  invalidateAlbums,
} from '@/lib/gallery/services/cache';
import type { ActivityAlbumStatus } from '@/lib/gallery/types';
import { albumInputSchema } from '@/lib/gallery/validation';
import { logActivity } from '@/lib/db/queries';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const categorySlug = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const id = searchParams.get('id');

    if (slug) {
      const album = await getAlbumDetailBySlug(slug);
      if (!album) {
        return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      }
      return NextResponse.json(album);
    }

    if (id) {
      const album = await getAlbumDetailBySlug(id); // id lookup not implemented; slug is unique
      if (!album) {
        return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      }
      return NextResponse.json(album);
    }

    if (categorySlug) {
      const category = await getCategoryBySlug(categorySlug);
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      const albums = await getAlbumsByCategory(category.id);
      return NextResponse.json(albums);
    }

    // Admin list can see all statuses; public list is for unauthenticated consumers elsewhere.
    const status: ActivityAlbumStatus | undefined =
      statusParam === 'published' || statusParam === 'archived' || statusParam === 'draft'
        ? statusParam
        : undefined;
    const albums = await getAdminAlbums({ status });
    return NextResponse.json(albums);
  } catch (error: any) {
    console.error('[ALBUMS GET]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const body = await request.json();
    const parsed = albumInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const category = await getCategoryById(parsed.data.categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    const media = Array.isArray(body.media) ? body.media : [];
    const album = await createAlbum(parsed.data, media);
    invalidateAlbums();
    await logActivity('album', `Created album "${album.title}"`, user.name || user.email);

    return NextResponse.json(album, { status: 201 });
  } catch (error: any) {
    console.error('[ALBUMS POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ error: 'Album ID required' }, { status: 400 });
    }

    const albumId = Number(id);

    // Admin-only actions.
    if (action === 'publish' || action === 'archive' || action === 'feature' || action === 'unfeature') {
      if (!canAdmin(user)) return forbidden();
      let album;
      if (action === 'publish') album = await publishAlbum(albumId);
      else if (action === 'archive') album = await archiveAlbum(albumId);
      else if (action === 'feature') album = await featureAlbum(albumId, true);
      else album = await unfeatureAlbum(albumId);
      if (!album) {
        return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      }
      invalidateAlbumPublicSurfaces();
      await logActivity('album', `${action} album "${album.title}"`, user.name || user.email);
      return NextResponse.json(album);
    }

    if (action === 'setPrivacy') {
      if (!canAdmin(user)) return forbidden();
      if (!updates.privacyReviewStatus) {
        return NextResponse.json({ error: 'privacyReviewStatus required' }, { status: 400 });
      }
      const album = await setAlbumPrivacyStatus(albumId, updates.privacyReviewStatus);
      if (!album) {
        return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      }
      invalidateAlbumPublicSurfaces();
      await logActivity('album', `Set privacy ${updates.privacyReviewStatus} on "${album.title}"`, user.name || user.email);
      return NextResponse.json(album);
    }

    // General update.
    const parsed = albumInputSchema.partial().safeParse(updates);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const mediaUpdates = updates.mediaUpdates;
    const album = await updateAlbum(albumId, parsed.data, mediaUpdates);
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }
    invalidateAlbumPublicSurfaces();
    await logActivity('album', `Updated album "${album.title}"`, user.name || user.email);
    return NextResponse.json(album);
  } catch (error: any) {
    console.error('[ALBUMS PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canAdmin(user)) return forbidden();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ error: 'Album ID required' }, { status: 400 });
    }

    const album = await deleteAlbum(Number(id));
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }
    invalidateAlbumPublicSurfaces();
    await logActivity('album', `Deleted album "${album.title}"`, user.name || user.email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ALBUMS DELETE]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
}
