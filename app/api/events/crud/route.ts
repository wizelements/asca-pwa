import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
  logActivity,
  type Event,
} from '@/lib/db/queries';
import { EVENT_CATEGORY_VALUES, isEventCategory } from '@/lib/content/events';

function canWrite(role: string): boolean {
  return role === 'admin' || role === 'editor';
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function invalidCategoryResponse() {
  return NextResponse.json(
    { error: `Category must be one of: ${EVENT_CATEGORY_VALUES.join(', ')}` },
    { status: 400 }
  );
}

function parseDate(value: unknown, field: string) {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} is invalid`);
  }
  return date;
}

function isValidationError(error: unknown) {
  return error instanceof Error && error.message.includes('invalid');
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get('published');
    const id = searchParams.get('id');

    if (id) {
      const event = await getEventById(Number(id));
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json(event);
    }

    const published = publishedParam !== null ? publishedParam === 'true' : undefined;
    const events = await getEvents(published);
    return NextResponse.json(events);
  } catch (error: any) {
    console.error('[EVENTS GET]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canWrite(user.role)) return forbidden();
    const body = await request.json();
    const category = String(body.category || 'hosted');

    if (!isEventCategory(category)) return invalidCategoryResponse();
    if (!body.title || !body.date) {
      return NextResponse.json({ error: 'Title and date are required' }, { status: 400 });
    }

    const data = {
      title: body.title,
      description: body.description || '',
      date: parseDate(body.date, 'Date'),
      endDate: parseDate(body.endDate || body.date, 'End date'),
      time: body.time || '',
      location: body.location || '',
      imageUrl: body.imageUrl,
      imageAlt: body.imageAlt || '',
      ctaLabel: body.ctaLabel || '',
      ctaHref: body.ctaHref || '',
      isTba: Boolean(body.isTba),
      capacity: body.capacity,
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
      rsvpList: Array.isArray(body.rsvpList) ? body.rsvpList : [],
      category,
      month: body.month || undefined,
      dateLabel: body.dateLabel || undefined,
      sortOrder: body.sortOrder !== undefined && body.sortOrder !== '' ? Number(body.sortOrder) : 0,
      registrationRequired: Boolean(body.registrationRequired),
      published: Boolean(body.published),
    };

    const event = await createEvent(data as any);
    await logActivity('event', `Created event "${event.title}"`, user.name || user.email);

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('[EVENTS POST]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (isValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canWrite(user.role)) return forbidden();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const data: Partial<Event> = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.date !== undefined) data.date = parseDate(updates.date, 'Date');
    if (updates.endDate !== undefined) data.endDate = parseDate(updates.endDate || updates.date, 'End date');
    if (updates.time !== undefined) data.time = updates.time;
    if (updates.location !== undefined) data.location = updates.location;
    if (updates.imageUrl !== undefined) data.imageUrl = updates.imageUrl;
    if (updates.imageAlt !== undefined) data.imageAlt = updates.imageAlt;
    if (updates.ctaLabel !== undefined) data.ctaLabel = updates.ctaLabel;
    if (updates.ctaHref !== undefined) data.ctaHref = updates.ctaHref;
    if (updates.isTba !== undefined) data.isTba = Boolean(updates.isTba);
    if (updates.capacity !== undefined) data.capacity = updates.capacity;
    if (updates.registrationDeadline !== undefined) {
      data.registrationDeadline = updates.registrationDeadline ? new Date(updates.registrationDeadline) : undefined;
    }
    if (updates.rsvpList !== undefined) data.rsvpList = updates.rsvpList;
    if (updates.category !== undefined) {
      if (!isEventCategory(String(updates.category))) return invalidCategoryResponse();
      data.category = updates.category;
    }
    if (updates.month !== undefined) data.month = updates.month;
    if (updates.dateLabel !== undefined) data.dateLabel = updates.dateLabel;
    if (updates.sortOrder !== undefined) data.sortOrder = Number(updates.sortOrder) || 0;
    if (updates.registrationRequired !== undefined) data.registrationRequired = Boolean(updates.registrationRequired);
    if (updates.published !== undefined) data.published = Boolean(updates.published);

    const event = await updateEvent(Number(id), data);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await logActivity('event', `Updated event "${event.title}"`, user.name || user.email);

    return NextResponse.json(event);
  } catch (error: any) {
    console.error('[EVENTS PUT]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (isValidationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!canWrite(user.role)) return forbidden();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const event = await getEventById(Number(id));
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await deleteEvent(Number(id));
    await logActivity('event', `Deleted event "${event.title}"`, user.name || user.email);

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    console.error('[EVENTS DELETE]', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
