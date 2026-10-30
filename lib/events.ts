import {
  EVENTS,
  isEventCategory,
  MONTHLY_MEETING_LOCATION,
  type AscaEvent,
} from '@/lib/content/events';
import { compareEvents } from '@/lib/date';
import { getEvents as getDbEvents, type Event as DbEvent } from '@/lib/db/queries';
import { getSiteContent, siteText } from '@/lib/site-content';

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatEventDateLabel(event: DbEvent) {
  if (event.dateLabel) return event.dateLabel;

  const start = event.date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  const end = event.endDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  return start === end ? start : `${start}–${end}`;
}

function inferMonth(event: DbEvent, isTba: boolean): string | undefined {
  if (event.month) return event.month;
  if (isTba) return undefined;
  return event.date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
}

function inferTime(event: DbEvent): string | undefined {
  if (event.time) return event.time;
  return event.title.toLowerCase() === 'monthly meeting' ? '7:00pm' : undefined;
}

function inferLocation(event: DbEvent): string | undefined {
  if (event.location) return event.location;
  return event.title.toLowerCase() === 'monthly meeting' ? MONTHLY_MEETING_LOCATION : undefined;
}

export function dbEventToAscaEvent(event: DbEvent): AscaEvent {
  const dateLabel = formatEventDateLabel(event);
  const isTba = event.isTba || /\bTBA\b/i.test(dateLabel);
  const startDate = isTba ? undefined : toDateOnly(event.date);
  const endDate = isTba ? undefined : toDateOnly(event.endDate);

  return {
    id: `event-${event.id}`,
    title: event.title,
    category: isEventCategory(event.category) ? event.category : 'hosted',
    startDate,
    endDate: endDate && endDate !== startDate ? endDate : undefined,
    sortDate: toDateOnly(event.date),
    endSortDate: toDateOnly(event.endDate),
    time: inferTime(event),
    month: inferMonth(event, isTba),
    dateLabel,
    sortOrder: event.sortOrder,
    description: event.description || undefined,
    location: inferLocation(event),
    imageUrl: event.imageUrl,
    imageAlt: event.imageAlt,
    ctaLabel: event.ctaLabel,
    ctaHref: event.ctaHref,
    isTba,
    published: event.published,
    registrationRequired: event.registrationRequired,
  };
}

export async function getPublicEvents(): Promise<AscaEvent[]> {
  try {
    const [dbEvents, meetingCopy] = await Promise.all([getDbEvents(true), getSiteContent()]);
    const meetingLocation = [
      siteText(meetingCopy, 'shared.meeting.venue'),
      siteText(meetingCopy, 'shared.meeting.address'),
    ].filter(Boolean).join(', ');
    const meetingTime = siteText(meetingCopy, 'shared.meeting.time');

    const events = dbEvents.length > 0
      ? dbEvents.map((row) => {
          const event = dbEventToAscaEvent(row);
          // Never overwrite a specific location/time chosen in the Events editor.
          if (row.title.trim().toLowerCase() === 'monthly meeting') {
            if (!row.location) event.location = meetingLocation;
            if (!row.time) event.time = meetingTime;
          }
          return event;
        })
      : EVENTS.map((event) => (
          event.title.trim().toLowerCase() === 'monthly meeting'
            ? { ...event, location: meetingLocation, time: meetingTime }
            : event
        ));

    return [...events].sort(compareEvents);
  } catch (error) {
    console.error('[PUBLIC EVENTS]', error);
    return [...EVENTS].sort(compareEvents);
  }
}
