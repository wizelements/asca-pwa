import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { canEdit, canAdmin } from '@/lib/gallery/services/authorization';
import {
  getAdminAlbums,
  getPublicAlbums,
  getAlbumDetailBySlug,
  getAlbumDetailById,
  getAlbumById,
  createAlbum,
  updateAlbum,
  publishAlbum,
  archiveAlbum,
  restoreAlbum,
  restoreDeletedAlbum,
  featureAlbum,
  unfeatureAlbum,
  setAlbumPrivacyStatus,
  deleteAlbum,
  countPublicAlbums,
  countAdminAlbums,
} from '@/lib/gallery/services/albums';
import { getCategoryBySlug, getCategoryById } from '@/lib/gallery/services/categories';
import { invalidateAlbumPublicSurfaces, invalidateAlbums } from '@/lib/gallery/services/cache';
import type { ActivityAlbumStatus } from '@/lib/gallery/types';
import { albumInputSchema, albumMediaInputSchema } from '@/lib/gallery/validation';
import { logActivity } from '@/lib/db/queries';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

const editorAlbumUpdateSchema = albumInputSchema.pick({
  title: true,
  slug: true,
  categoryId: true,
  eventId: true,
  activityDate: true,
  location: true,
  summary: true,
  coverMediaAssetId: true,
  sortOrder: true,
}).partial();

const mediaUpdatesSchema = z.object({
  add: z.array(albumMediaInputSchema).max(200).optional(),
  remove: z.array(z.string().min(1)).max(200).optional(),
  reorder: z.array(z.object({
    mediaAssetId: z.string().min(1),
    sortOrder: z.number().int(),
  })).max(500).optional(),
  metadata: z.array(z.object({
    mediaAssetId: z.string().min(1),
    altText: z.string().min(1).max(1000).optional(),
    caption: z.string().max(500).nullable().optional(),
  })).max(500).optional(),
}).optional();

function publicEnough(album: NonNullable<Awaited<ReturnType<typeof getAlbumDetailBySlug>>>): boolean {
  return (
    album.status === 'published' &&
    (album.privacyReviewStatus === 'not_required' || album.privacyReviewStatus === 'approved') &&
    album.category?.active === true &&
    album.mediaCount > 0 &&
    Boolean(album.coverMediaAssetId)
  );
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const categorySlug = searchParams.get('category');
    const statusParam = searchParams.get('status');
    const id = searchParams.get('id');
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '24')));
    const offset = (page - 1) * pageSize;

    if (id && /^\d+$/.test(id)) {
      const album = await getAlbumDetailById(Number(id), statusParam === 'trash' && canAdmin(user));
      if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      if (!canEdit(user) && !publicEnough(album)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(album);
    }

    if (slug) {
      const album = await getAlbumDetailBySlug(slug);
      if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      if (!canEdit(user) && !publicEnough(album)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(album);
    }

    if (statusParam === 'trash') {
      if (!canAdmin(user)) return forbidden();
      const [albums, total] = await Promise.all([
        getAdminAlbums({ deleted: true }, pageSize, offset),
        countAdminAlbums({ deleted: true }),
      ]);
      return NextResponse.json(albums, { headers: { 'X-Total-Count': String(total) } });
    }

    if (categorySlug) {
      const category = await getCategoryBySlug(categorySlug);
      if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

      if (canEdit(user)) {
        const [albums, total] = await Promise.all([
          getAdminAlbums({ categoryId: category.id }, pageSize, offset),
          countAdminAlbums({ categoryId: category.id }),
        ]);
        return NextResponse.json(albums, { headers: { 'X-Total-Count': String(total) } });
      }

      const [albums, total] = await Promise.all([
        getPublicAlbums(categorySlug, pageSize, offset),
        countPublicAlbums(categorySlug),
      ]);
      return NextResponse.json(albums, { headers: { 'X-Total-Count': String(total) } });
    }

    const status: ActivityAlbumStatus | undefined =
      statusParam === 'published' || statusParam === 'archived' || statusParam === 'draft'
        ? statusParam
        : undefined;

    if (!canEdit(user)) {
      const [albums, total] = await Promise.all([
        getPublicAlbums(undefined, pageSize, offset),
        countPublicAlbums(),
      ]);
      return NextResponse.json(albums, { headers: { 'X-Total-Count': String(total) } });
    }

    const [albums, total] = await Promise.all([
      getAdminAlbums({ status }, pageSize, offset),
      countAdminAlbums({ status }),
    ]);
    return NextResponse.json(albums, { headers: { 'X-Total-Count': String(total) } });
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
    const parsed = albumInputSchema.safeParse({
      ...body,
      status: 'draft',
      featured: false,
      privacyReviewStatus: 'pending',
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const category = await getCategoryById(parsed.data.categoryId);
    if (!category) return badRequest('Category not found');

    const mediaResult = z.array(albumMediaInputSchema).max(200).safeParse(
      Array.isArray(body.media) ? body.media : []
    );
    if (!mediaResult.success) {
      return NextResponse.json({ error: mediaResult.error.flatten() }, { status: 400 });
    }

    const album = await createAlbum(parsed.data, mediaResult.data);
    invalidateAlbums();
    await logActivity('album', 'Created draft album "' + album.title + '"', user.name || user.email);
    return NextResponse.json(album, { status: 201 });
  } catch (error: any) {
    console.error('[ALBUMS POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error?.message) return badRequest(error.message);
    return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const body = await request.json();
    const { id, action, mediaUpdates, ...updates } = body;

    if (!id || Number.isNaN(Number(id))) return badRequest('Album ID required');
    const albumId = Number(id);

    if (action) {
      if (!canAdmin(user)) return forbidden();

      let album;
      if (action === 'publish') album = await publishAlbum(albumId);
      else if (action === 'archive') album = await archiveAlbum(albumId);
      else if (action === 'restore') album = await restoreAlbum(albumId);
      else if (action === 'restoreTrash') album = await restoreDeletedAlbum(albumId);
      else if (action === 'feature') album = await featureAlbum(albumId, true);
      else if (action === 'unfeature') album = await unfeatureAlbum(albumId);
      else if (action === 'setPrivacy') {
        const privacy = z.enum(['not_required', 'pending', 'approved', 'restricted']).safeParse(updates.privacyReviewStatus);
        if (!privacy.success) return badRequest('Valid privacyReviewStatus required');
        album = await setAlbumPrivacyStatus(albumId, privacy.data);
      } else {
        return badRequest('Unsupported album action');
      }

      if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      invalidateAlbumPublicSurfaces();
      await logActivity('album', action + ' album "' + album.title + '"', user.name || user.email);
      return NextResponse.json(album);
    }

    const protectedKeys = ['status', 'featured', 'privacyReviewStatus'];
    const attemptedProtectedKey = protectedKeys.find((key) => Object.prototype.hasOwnProperty.call(updates, key));
    if (attemptedProtectedKey) {
      return forbidden();
    }

    const parsed = editorAlbumUpdateSchema.safeParse(updates);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const mediaParsed = mediaUpdatesSchema.safeParse(mediaUpdates);
    if (!mediaParsed.success) {
      return NextResponse.json({ error: mediaParsed.error.flatten() }, { status: 400 });
    }

    const album = await updateAlbum(albumId, parsed.data, mediaParsed.data);
    if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });

    invalidateAlbumPublicSurfaces();
    await logActivity('album', 'Updated album "' + album.title + '"', user.name || user.email);
    return NextResponse.json(album);
  } catch (error: any) {
    console.error('[ALBUMS PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error?.message) return badRequest(error.message);
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canAdmin(user)) return forbidden();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || Number.isNaN(Number(id))) return badRequest('Album ID required');

    const album = await deleteAlbum(Number(id));
    if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });

    invalidateAlbumPublicSurfaces();
    await logActivity('album', 'Moved album "' + album.title + '" to trash', user.name || user.email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[ALBUMS DELETE]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
  }
}
