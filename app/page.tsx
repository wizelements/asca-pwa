import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import EventCard from '@/components/Cards/EventCard';
import {
  getSettings,
  getTheme,
  getUpcomingEvents,
} from '@/lib/db/queries';

export default async function Home() {
  const [settings, theme, upcomingEvents] = await Promise.all([
    getSettings(),
    getTheme(),
    getUpcomingEvents(3),
  ]);

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
      <Header settings={settings} />
      <main>
        {/* Hero Section */}
        <Hero
          image={settings.heroes?.home?.image || '/images/hero/home.jpg'}
          title={settings.heroes?.home?.title || 'We Ride To Inspire'}
          subtitle={settings.heroes?.home?.subtitle || settings.tagline}
          cta={settings.heroes?.home?.cta || { text: 'Get Involved', link: '/get-involved' }}
        />

        {/* Upcoming Events */}
        <section className="py-20 bg-white">
          <div className="container">
            <h2 className="text-4xl font-bold mb-4 text-center" style={{ color: 'var(--color-primary)' }}>
              Upcoming Events
            </h2>
            <p className="text-gray-600 text-center mb-12">
              Join us for our latest events and activities
            </p>
            {upcomingEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  {upcomingEvents.map((event: any) => (
                    <EventCard
                      key={event._id.toString()}
                      title={event.title}
                      date={new Date(event.date).toLocaleDateString()}
                      time={event.time}
                      location={event.location}
                      image={event.image}
                      description={event.description}
                      rsvpLink={`/calendar#${event._id}`}
                    />
                  ))}
                </div>
                <div className="text-center">
                  <Link href="/calendar" className="px-8 py-3 font-bold rounded hover:opacity-90" style={{ backgroundColor: 'var(--color-accent)' }}>
                    View All Events
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6">Check back soon for upcoming events!</p>
                <Link href="/calendar" className="px-8 py-3 font-bold rounded hover:opacity-90" style={{ backgroundColor: 'var(--color-accent)' }}>
                  View Calendar
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>Why Join ASCA?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Community',
                  description: 'Connect with fellow riders and equestrian enthusiasts',
                  icon: '👥',
                },
                {
                  title: 'Training',
                  description: 'Access expert instruction and horse care education',
                  icon: '🏇',
                },
                {
                  title: 'Charity',
                  description: 'Make a difference through our community initiatives',
                  icon: '❤️',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-white" style={{ backgroundColor: 'var(--color-secondary)' }}>
          <div className="container text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Ride With Us?</h2>
            <p className="text-lg mb-8 text-gray-200">
              Learn more about membership or get involved with ASCA today
            </p>
            <Link href="/get-involved" className="inline-block px-8 py-3 font-bold rounded hover:opacity-90" style={{ backgroundColor: 'var(--color-accent)' }}>
              Join Now
            </Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
