import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MeetingCallout from '@/components/MeetingCallout';
import EventLegend from '@/components/EventLegend';
import EventList from '@/components/EventList';
import { EVENTS, isEventCategory, type AscaEvent } from '@/lib/content/events';
import { getEvents, type Event as DbEvent } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Where to Find Us | ASCA Events' },
  description:
    'Find upcoming ASCA meetings, hosted events, events where ASCA will be present, and community outreach activities sponsored by ASCA.',
};

function formatEventDateLabel(event: DbEvent) {
  if (event.dateLabel) return event.dateLabel;

  const start = event.date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  const end = event.endDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  return start === end ? start : `${start}–${end}`;
}

function dbEventToCalendarEvent(event: DbEvent): AscaEvent {
  const month = event.month || event.date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  return {
    month,
    title: event.title,
    category: isEventCategory(event.category) ? event.category : 'hosted',
    dateLabel: formatEventDateLabel(event),
    description: event.description || undefined,
    location: event.location || undefined,
    registrationRequired: event.registrationRequired,
  };
}

async function getCalendarEvents() {
  try {
    const events = await getEvents(true);
    return events.length > 0 ? events.map(dbEventToCalendarEvent) : EVENTS;
  } catch (error) {
    console.error('[WHERE TO FIND US EVENTS]', error);
    return EVENTS;
  }
}

export default async function WhereToFindUs() {
  const events = await getCalendarEvents();

  return (
    <>
      <Header />
      <main>
        <Hero
          image="/images/hero/calendar.jpg"
          title="Where to Find Us"
          subtitle="Meetings, rides, and community events throughout the year."
        />

        <section className="py-16">
          <div className="container max-w-4xl">
            <p className="mx-auto mb-10 max-w-3xl text-center text-lg leading-relaxed text-brand-fg-secondary">
              Find upcoming ASCA meetings, events hosted by ASCA, events where ASCA will be present, and community
              outreach activities sponsored by ASCA.
            </p>

            <MeetingCallout />

            <div className="my-10">
              <h2 className="sr-only">Event category key</h2>
              <EventLegend />
            </div>

            <EventList events={events} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
