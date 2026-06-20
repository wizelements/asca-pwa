import { NextResponse } from 'next/server';
import { EVENTS } from '@/lib/content/events';
import { createEvent, createGalleryImage, getEvents, getGalleryImages } from '@/lib/db/queries';

const gallerySeed = [
  { title: 'Our Horses', image: '/images/gallery/horse-closeup.jpg', description: 'ASCA horses up close', category: 'Horses', alt: 'Horse close-up at ASCA' },
  { title: 'Trail Rides', image: '/images/gallery/rider.jpg', description: 'Members on horseback', category: 'Trail Rides', alt: 'ASCA rider on horseback' },
  { title: 'Community', image: '/images/gallery/blog-member.jpg', description: 'ASCA member activity', category: 'Community', alt: 'ASCA member activity' },
  { title: 'Activities', image: '/images/gallery/activity.jpg', description: 'ASCA trail ride activity', category: 'Activities', alt: 'ASCA trail ride activity' },
  { title: 'Events', image: '/images/gallery/event.jpg', description: 'Community event photos', category: 'Events', alt: 'ASCA community event' },
  { title: 'Members', image: '/images/members/member-1.jpg', description: 'ASCA members', category: 'Members', alt: 'ASCA member' },
];

function parseSeedDate(value: string | undefined, fallback: string | undefined) {
  const date = new Date(`${value || fallback || '2026-12-31'}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return new Date('2026-12-31T00:00:00Z');
  return date;
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  const validKey = process.env.SEED_KEY;
  if (!validKey || key !== validKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, string> = {};

  try {
    const existingEvents = await getEvents();
    if (existingEvents.length === 0) {
      for (const event of EVENTS) {
        await createEvent({
          title: event.title,
          description: event.description || '',
          date: parseSeedDate(event.sortDate, event.endSortDate),
          endDate: parseSeedDate(event.endSortDate, event.sortDate),
          location: event.location || '',
          imageUrl: undefined,
          imageAlt: '',
          capacity: undefined,
          registrationDeadline: undefined,
          rsvpList: [],
          category: event.category,
          month: event.month,
          dateLabel: event.dateLabel,
          sortOrder: event.sortOrder || 0,
          registrationRequired: Boolean(event.registrationRequired),
          published: true,
        } as any);
      }
      results.events = `${EVENTS.length} approved events seeded`;
    } else {
      results.events = `Events already has ${existingEvents.length} records`;
    }

    const existingGallery = await getGalleryImages();
    if (existingGallery.length === 0) {
      for (const image of gallerySeed) {
        await createGalleryImage(image as any);
      }
      results.gallery = `${gallerySeed.length} gallery images seeded`;
    } else {
      results.gallery = `Gallery already has ${existingGallery.length} images`;
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[SEED]', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
