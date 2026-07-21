import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canEdit, canAdmin } from '@/lib/gallery/services/authorization';
import {
  getAdminHorses,
  getPublicHorses,
  getHorseDetailBySlug,
  getHorseById,
  createHorse,
  updateHorse,
  publishHorse,
  archiveHorse,
  addHorseMedia,
  removeHorseMedia,
  updateHorseMediaMeta,
} from '@/lib/gallery/services/horses';
import { horseProfileInputSchema, horseProfileMediaInputSchema } from '@/lib/gallery/validation';
import { invalidateHorses } from '@/lib/gallery/services/cache';
import { logActivity } from '@/lib/db/queries';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const status = searchParams.get('status');

    if (slug) {
      const horse = await getHorseDetailBySlug(slug);
      if (!horse) {
        return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
      }
      return NextResponse.json(horse);
    }

    if (id) {
      const horse = await getHorseById(Number(id));
      if (!horse) {
        return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
      }
      return NextResponse.json(horse);
    }

    const horses = await getAdminHorses(status ? { status: status as any } : undefined);
    return NextResponse.json(horses);
  } catch (error: any) {
    console.error('[HORSES GET]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch horses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const body = await request.json();
    const parsed = horseProfileInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const media = Array.isArray(body.media) ? body.media : [];
    const horse = await createHorse(parsed.data, media);
    invalidateHorses();
    await logActivity('horse', `Created horse profile "${horse.name}"`, user.name || user.email);

    return NextResponse.json(horse, { status: 201 });
  } catch (error: any) {
    console.error('[HORSES POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create horse profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canEdit(user)) return forbidden();

    const body = await request.json();
    const { id, action, media, mediaUpdates, mediaAssetId, mediaMeta, ...updates } = body;

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ error: 'Horse ID required' }, { status: 400 });
    }

    const horseId = Number(id);

    if (action === 'publish' || action === 'archive') {
      if (!canAdmin(user)) return forbidden();
      const horse = action === 'publish' ? await publishHorse(horseId) : await archiveHorse(horseId);
      if (!horse) {
        return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
      }
      invalidateHorses();
      await logActivity('horse', `${action} horse "${horse.name}"`, user.name || user.email);
      return NextResponse.json(horse);
    }

    if (action === 'addMedia' && Array.isArray(media)) {
      const items = media.map((m: unknown) => horseProfileMediaInputSchema.parse(m));
      const horse = await addHorseMedia(horseId, items);
      if (!horse) {
        return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
      }
      invalidateHorses();
      return NextResponse.json(horse);
    }

    if (action === 'removeMedia' && mediaAssetId) {
      await removeHorseMedia(horseId, mediaAssetId);
      invalidateHorses();
      return NextResponse.json({ success: true });
    }

    if (action === 'updateMediaMeta' && mediaAssetId && mediaMeta) {
      await updateHorseMediaMeta(horseId, mediaAssetId, mediaMeta);
      invalidateHorses();
      return NextResponse.json({ success: true });
    }

    const parsed = horseProfileInputSchema.partial().safeParse(updates);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const horse = await updateHorse(horseId, parsed.data, mediaUpdates);
    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }
    invalidateHorses();
    await logActivity('horse', `Updated horse "${horse.name}"`, user.name || user.email);
    return NextResponse.json(horse);
  } catch (error: any) {
    console.error('[HORSES PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update horse profile' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canAdmin(user)) return forbidden();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ error: 'Horse ID required' }, { status: 400 });
    }

    const horse = await archiveHorse(Number(id));
    if (!horse) {
      return NextResponse.json({ error: 'Horse not found' }, { status: 404 });
    }
    invalidateHorses();
    await logActivity('horse', `Archived horse "${horse.name}"`, user.name || user.email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[HORSES DELETE]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to archive horse profile' }, { status: 500 });
  }
}
