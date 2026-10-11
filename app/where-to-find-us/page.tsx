import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCalendar from '@/components/events/EventCalendar';
import { getCachedPublicEvents } from '@/lib/db/queries-cache';
import { getCachedSiteContent, siteText } from '@/lib/site-content';

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'Event Calendar | ASCA' },
  description:
    'Find upcoming Atlanta Saddle Club Association meetings, rides, outreach events, and community activities.',
};

export default async function WhereToFindUs() {
  const [events, copy] = await Promise.all([
    getCachedPublicEvents(),
    getCachedSiteContent(),
  ]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-bg-body">
        <section className="forest-luxe relative overflow-hidden py-20 text-white md:py-28">
          <div className="container relative z-10 max-w-4xl text-center">
            <p className="section-label text-brand-accent">
              {siteText(copy, 'calendar.label')}
            </p>
            <h1 className="mt-7 font-serif text-5xl font-semibold tracking-tight md:text-7xl">
              {siteText(copy, 'calendar.title')}
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/90 md:text-lg md:leading-9">
              {siteText(copy, 'calendar.body')}
            </p>
          </div>
        </section>

        <section className="quiet-luxe py-20 md:py-24">
          <div className="container">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-12 bg-brand-accent" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-fg-muted">
                Rides · Meetings · Outreach · Community
              </p>
            </div>
            <EventCalendar events={events} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
