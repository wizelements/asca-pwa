import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MeetingCallout from '@/components/MeetingCallout';
import EventLegend from '@/components/EventLegend';
import EventCalendar from '@/components/events/EventCalendar';
import { getPublicEvents } from '@/lib/events';
import { getPublicManagedImages } from '@/lib/public-content';
import { getManagedImage } from '@/lib/media';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Where to Find Us | ASCA Events' },
  description:
    'Find upcoming Atlanta Saddle Club Association meetings, rides, outreach events, and community activities.',
};

export default async function WhereToFindUs() {
  const [events, images] = await Promise.all([getPublicEvents(), getPublicManagedImages()]);
  const hero = getManagedImage(images, 'whereToFindUs.hero');

  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title="Where to Find Us"
          subtitle="Meetings, rides, and community events throughout the year."
        />

        <section className="py-16">
          <div className="container">
            <p className="mx-auto mb-10 max-w-3xl text-center text-lg leading-relaxed text-brand-fg-secondary">
              Find upcoming ASCA meetings, events hosted by ASCA, events where ASCA will be present, and community
              outreach activities sponsored by ASCA.
            </p>

            <MeetingCallout />

            <div className="my-10">
              <h2 className="sr-only">Event category key</h2>
              <EventLegend />
            </div>

            <EventCalendar events={events} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
