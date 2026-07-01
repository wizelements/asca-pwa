import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCalendar from '@/components/events/EventCalendar';
import { getPublicEvents } from '@/lib/events';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: 'Where to Find Us | ASCA Events' },
  description:
    'Find upcoming Atlanta Saddle Club Association meetings, rides, outreach events, and community activities.',
};

export default async function WhereToFindUs() {
  const events = await getPublicEvents();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-brand-bg-body">
        <EventCalendar events={events} />
      </main>
      <Footer />
    </>
  );
}
