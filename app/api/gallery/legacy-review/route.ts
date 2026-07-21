import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { canAdmin } from '@/lib/gallery/services/authorization';
import {
  getLegacyReviewRecords,
  getLegacyReviewById,
  resolveReviewToExistingAlbum,
  resolveReviewToExistingHorse,
  resolveReviewToSkip,
  updateLegacyReviewPrivacy,
} from '@/lib/gallery/services/legacy-review';
import { invalidateLegacyReview, invalidateAlbumPublicSurfaces, invalidateHorses } from '@/lib/gallery/services/cache';
import { logActivity } from '@/lib/db/queries';
import type { LegacyGalleryReviewStatus, PrivacyReviewStatus } from '@/lib/gallery/types';

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const review = await getLegacyReviewById(Number(id));
      if (!review) {
        return NextResponse.json({ error: 'Review record not found' }, { status: 404 });
      }
      return NextResponse.json(review);
    }

    const filters: any = {};
    const status = searchParams.get('status') as LegacyGalleryReviewStatus | null;
    const privacy = searchParams.get('privacy') as PrivacyReviewStatus | null;
    const legacyCategory = searchParams.get('legacyCategory');
    const destinationType = searchParams.get('destinationType') as any;

    if (status) filters.status = status;
    if (privacy) filters.privacyReviewStatus = privacy;
    if (legacyCategory) filters.legacyCategory = legacyCategory;
    if (destinationType) filters.destinationType = destinationType;

    const records = await getLegacyReviewRecords(Object.keys(filters).length > 0 ? filters : undefined);
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('[LEGACY REVIEW GET]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch legacy review records' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canAdmin(user)) return forbidden();

    const body = await request.json();
    const { id, action, albumId, horseProfileId, privacyReviewStatus, notes } = body;

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const reviewId = Number(id);
    const reviewerId = Number(user.sub);

    let review;
    if (action === 'resolveToAlbum') {
      if (!albumId || Number.isNaN(Number(albumId))) {
        return NextResponse.json({ error: 'albumId required' }, { status: 400 });
      }
      review = await resolveReviewToExistingAlbum(
        reviewId,
        Number(albumId),
        privacyReviewStatus || 'approved',
        reviewerId,
        notes
      );
      invalidateAlbumPublicSurfaces();
    } else if (action === 'resolveToHorse') {
      if (!horseProfileId || Number.isNaN(Number(horseProfileId))) {
        return NextResponse.json({ error: 'horseProfileId required' }, { status: 400 });
      }
      review = await resolveReviewToExistingHorse(
        reviewId,
        Number(horseProfileId),
        privacyReviewStatus || 'approved',
        reviewerId,
        notes
      );
      invalidateHorses();
    } else if (action === 'skip') {
      review = await resolveReviewToSkip(reviewId, reviewerId, notes);
    } else if (action === 'setPrivacy') {
      if (!privacyReviewStatus) {
        return NextResponse.json({ error: 'privacyReviewStatus required' }, { status: 400 });
      }
      review = await updateLegacyReviewPrivacy(reviewId, privacyReviewStatus, notes, reviewerId);
      invalidateAlbumPublicSurfaces();
      invalidateHorses();
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    if (!review) {
      return NextResponse.json({ error: 'Review record not found' }, { status: 404 });
    }

    invalidateLegacyReview();
    await logActivity('legacy-review', `${action} review #${reviewId}`, user.name || user.email);
    return NextResponse.json(review);
  } catch (error: any) {
    console.error('[LEGACY REVIEW PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to resolve review' }, { status: 500 });
  }
}
