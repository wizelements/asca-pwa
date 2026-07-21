import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCalendar from '@/components/events/EventCalendar';
import { getCachedPublicEvents } from '@/lib/db/queries-cache';

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'Event Calendar | ASCA' },
  description:
    'Find upcoming Atlanta Saddle Club Association meetings, rides, outreach events, and community activities.',
};

export default async function WhereToFindUs() {
  const events = await getCachedPublicEvents();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-bg-body">
        <section className="py-12 md:py-16">
          <div className="container text-center">
            <p className="section-label">Where You&apos;ll Find ASCA</p>
            <h1 className="section-title">Event Calendar</h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-brand-fg-secondary">
              Find upcoming ASCA meetings, hosted events, trail rides, parades, and community outreach activities.
            </p>
          </div>
        </section>
        <section className="pb-16">
          <div className="container">
            <EventCalendar events={events} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
