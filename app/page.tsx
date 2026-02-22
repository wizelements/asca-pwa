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
      <Header />
      <main>
        <Hero
          image={settings.heroes?.home?.image || '/images/hero/home.jpg'}
          title={settings.heroes?.home?.title || 'We Ride To Inspire'}
          subtitle={settings.heroes?.home?.subtitle || settings.tagline}
          cta={settings.heroes?.home?.cta || { text: 'Get Involved', link: '/get-involved' }}
        />

        <section className="bg-brand-bg-subtle py-20">
          <div className="container">
            <p className="section-label text-center">Calendar Preview</p>
            <h2 className="section-title text-center">Upcoming Events</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-brand-fg-secondary">
              Join us for our latest events and activities.
            </p>
            {upcomingEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                <div className="mt-12 text-center">
                  <Link href="/calendar" className="btn-secondary">
                    View All Events
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-brand-fg-secondary mb-6">Check back soon for upcoming events.</p>
                <Link href="/calendar" className="btn-secondary">
                  View Calendar
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <p className="section-label text-center">Why Join</p>
            <h2 className="section-title text-center">A Club Built on Purpose</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Community',
                  description: 'Connect with fellow riders and equestrian enthusiasts in a supportive network.',
                  accent: 'Together we grow',
                },
                {
                  title: 'Training',
                  description: 'Access expert instruction and resources that improve horsemanship and care.',
                  accent: 'Skill with heart',
                },
                {
                  title: 'Charity',
                  description: 'Give back through events and outreach that uplift the Atlanta community.',
                  accent: 'Serve with pride',
                },
              ].map((feature) => (
                <div key={feature.title} className="card">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-forest">{feature.accent}</p>
                  <h3 className="mt-4 text-xl font-bold text-brand-fg-primary">{feature.title}</h3>
                  <p className="mt-3 text-sm text-brand-fg-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-forest text-white py-20">
          <div className="container text-center">
            <p className="section-label text-brand-accent">Membership</p>
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Ride With Us?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-amber-100">
              Learn more about membership or get involved with ASCA today.
            </p>
            <Link href="/get-involved" className="btn-accent mt-8 inline-flex">
              Join Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
