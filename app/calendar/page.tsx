import Hero from '@/components/Hero';
import EventCard from '@/components/Cards/EventCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme, getAllEvents } from '@/lib/db/queries';

export default async function Calendar() {
  const [settings, theme, events] = await Promise.all([
    getSettings(),
    getTheme(),
    getAllEvents(),
  ]);

  const eventsByMonth = events.reduce((acc: any, event: any) => {
    const monthKey = new Date(event.date).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(event);
    return acc;
  }, {});

  const sortedMonths = Object.keys(eventsByMonth).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <>
      <style>{`
        :root {
          --color-primary: ${theme.colors.primary};
          --color-secondary: ${theme.colors.secondary};
          --color-accent: ${theme.colors.accent};
          --color-neutral: ${theme.colors.neutral};
        }
      `}</style>
      <Header />
      <main>
        <Hero
          image={settings.heroes?.calendar?.image || '/images/hero/calendar.jpg'}
          title={settings.heroes?.calendar?.title || 'Events Calendar'}
          subtitle={settings.heroes?.calendar?.subtitle || 'Join us for exciting activities and community events'}
        />

        {sortedMonths.length > 0 ? (
          sortedMonths.map((monthKey) => (
            <section key={monthKey} className="py-20">
              <div className="container">
                <div className="mb-10">
                  <p className="section-label">{monthKey}</p>
                  <h2 className="section-title">Upcoming Events</h2>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {eventsByMonth[monthKey].map((event: any) => (
                    <EventCard
                      key={event._id.toString()}
                      title={event.title}
                      date={new Date(event.date).toLocaleDateString()}
                      time={event.time}
                      location={event.location}
                      image={event.image}
                      description={event.description}
                      rsvpLink={`#${event._id}`}
                    />
                  ))}
                </div>
              </div>
            </section>
          ))
        ) : (
          <section className="py-20">
            <div className="container text-center">
              <p className="text-brand-fg-secondary">No events scheduled yet. Check back soon.</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
