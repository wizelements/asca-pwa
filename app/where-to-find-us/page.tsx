import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MeetingCallout from '@/components/MeetingCallout';
import EventLegend from '@/components/EventLegend';
import EventList from '@/components/EventList';

export const metadata: Metadata = {
  title: 'Where to Find Us',
  description:
    'Find upcoming ASCA meetings, hosted events, events where ASCA will be present, and community outreach activities sponsored by ASCA.',
};

export default function WhereToFindUs() {
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

            <EventList />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
