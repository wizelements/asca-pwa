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
        <section className="py-12 md:py-16">
          <div className="container text-center">
            <p className="section-label">{siteText(copy, 'calendar.label')}</p>
            <h1 className="section-title">{siteText(copy, 'calendar.title')}</h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-brand-fg-secondary">
              {siteText(copy, 'calendar.body')}
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
