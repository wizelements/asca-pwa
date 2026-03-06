import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import EventCard from '@/components/Cards/EventCard';
import {
  getSettings,
  getTheme,
  getUpcomingEvents,
} from '@/lib/db/queries';

const galleryPhotos = [
  { src: '/images/gallery/horse-closeup.jpg', alt: 'Horse close-up at ASCA' },
  { src: '/images/gallery/rider.jpg', alt: 'ASCA rider on horseback' },
  { src: '/images/gallery/blog-member.jpg', alt: 'ASCA member activity' },
  { src: '/images/gallery/activity.jpg', alt: 'ASCA trail ride activity' },
  { src: '/images/gallery/event.jpg', alt: 'ASCA community event' },
  { src: '/images/members/member-1.jpg', alt: 'ASCA member' },
];

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

        {/* Connect / Learn / Give */}
        <section className="py-20">
          <div className="container">
            <p className="section-label text-center">Our Purpose</p>
            <h2 className="section-title text-center">Connect · Learn · Give</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Connect',
                  accent: 'Together we grow',
                  description:
                    'Horses are very sensitive and pick up on others\' emotions quickly, and they accurately reflect these feelings back to the student. This creates a feedback loop that allows the student to learn new positive ways of thinking and being.',
                },
                {
                  title: 'Learn',
                  accent: 'Skill with heart',
                  description:
                    'Through working closely with the horse, our members build a gradual sense of acceptance and feeling "liked." This enhances a person\'s positive self-concept and identity. The bonding with the horse is key.',
                },
                {
                  title: 'Give',
                  accent: 'Serve with pride',
                  description:
                    'Funds that the club collects gives us the opportunity to give back to the community. We value our local community and desire to be an asset for both the young and the young at heart.',
                },
              ].map((feature) => (
                <div key={feature.title} className="card">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-accent font-semibold">{feature.accent}</p>
                  <h3 className="mt-4 text-xl font-bold text-brand-fg-primary">{feature.title}</h3>
                  <p className="mt-3 text-sm text-brand-fg-secondary leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="bg-brand-bg-subtle py-20">
          <div className="container">
            <p className="section-label text-center">Gallery</p>
            <h2 className="section-title text-center">Life at ASCA</h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryPhotos.map((photo) => (
                <div key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/gallery" className="btn-secondary">
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-20">
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

        {/* Blog Preview */}
        <section className="bg-brand-bg-subtle py-20">
          <div className="container">
            <p className="section-label text-center">From The Blog</p>
            <h2 className="section-title text-center">Latest Stories</h2>
            <div className="mt-12 mx-auto max-w-3xl">
              <div className="card overflow-hidden md:flex">
                <div className="relative h-56 md:h-auto md:w-72 flex-shrink-0">
                  <Image
                    src="/images/gallery/blog-member.jpg"
                    alt="Equine Assisted Therapy"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 288px"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-accent font-semibold">Featured</p>
                  <h3 className="mt-2 text-lg font-bold text-brand-fg-primary">
                    Feeling good with Horses: Benefits of Equine Assisted Therapy
                  </h3>
                  <p className="mt-1 text-xs text-brand-fg-muted">By Clariece Pinkney</p>
                  <p className="mt-3 text-sm text-brand-fg-secondary leading-relaxed">
                    Equine-Assisted Therapy (EAT) or equine-assisted learning or, the more well-known horseback riding, can be beneficial for people of all ages in numerous ways. Here&apos;s how you can benefit from the healing power of horses.
                  </p>
                  <Link href="/blog" className="mt-4 inline-flex text-sm font-semibold text-brand-forest hover:text-brand-forest-muted transition-colors">
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
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
