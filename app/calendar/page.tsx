import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';

export default function Calendar() {
  const upcomingEvents: any[] = [];
  const pastEvents: any[] = [];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-primary to-secondary text-neutral">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-4">Events Calendar</h1>
            <p className="text-xl">Join us for upcoming rides, training, and community events</p>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20 bg-neutral">
          <div className="container">
            <h2 className="text-4xl font-bold mb-12 text-primary">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                No upcoming events. Check back soon!
              </div>
            )}
          </div>
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="container">
              <h2 className="text-4xl font-bold mb-12 text-primary">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pastEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
