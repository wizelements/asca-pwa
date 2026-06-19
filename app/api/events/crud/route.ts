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
    const body = await request.json();

    const data = {
      title: body.title,
      description: body.description,
      date: new Date(body.date),
      endDate: new Date(body.endDate),
      location: body.location,
      imageUrl: body.imageUrl,
      imageAlt: body.imageAlt || '',
      capacity: body.capacity,
      registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : undefined,
      rsvpList: body.rsvpList || [],
      category: body.category || 'general',
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
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }

    const data: Partial<Event> = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.date !== undefined) data.date = new Date(updates.date);
    if (updates.endDate !== undefined) data.endDate = new Date(updates.endDate);
    if (updates.location !== undefined) data.location = updates.location;
    if (updates.imageUrl !== undefined) data.imageUrl = updates.imageUrl;
    if (updates.imageAlt !== undefined) data.imageAlt = updates.imageAlt;
    if (updates.capacity !== undefined) data.capacity = updates.capacity;
    if (updates.registrationDeadline !== undefined) {
      data.registrationDeadline = updates.registrationDeadline ? new Date(updates.registrationDeadline) : undefined;
    }
    if (updates.rsvpList !== undefined) data.rsvpList = updates.rsvpList;
    if (updates.category !== undefined) data.category = updates.category;
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
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
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
