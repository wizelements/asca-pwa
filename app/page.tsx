import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import MeetingCallout from '@/components/MeetingCallout';
import ConnectLearnGiveCards from '@/components/ConnectLearnGiveCards';
import EventUpdatesForm from '@/components/EventUpdatesForm';
import { MEMBERSHIP_APPLICATION_URL } from '@/lib/content/site';
import { ACTIVITY_HIGHLIGHTS } from '@/lib/content/club';

const galleryPhotos = [
  { src: '/images/gallery/horse-closeup.jpg', alt: 'Close-up of an ASCA horse' },
  { src: '/images/gallery/rider.jpg', alt: 'ASCA rider on horseback' },
  { src: '/images/gallery/blog-member.jpg', alt: 'ASCA members together at an event' },
  { src: '/images/gallery/activity.jpg', alt: 'ASCA members on a trail ride' },
  { src: '/images/gallery/event.jpg', alt: 'ASCA community event' },
  { src: '/images/members/member-1.jpg', alt: 'An ASCA member with their horse' },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* TODO: replace /images/hero/home.jpg with the latest ASCA group/community photo when provided. */}
        <Hero
          image="/images/hero/home.jpg"
          title="We Ride To Inspire"
          subtitle="Atlanta's premiere saddle club — promoting horsemanship, fellowship, education, and community across metro Atlanta."
        />

        {/* Meeting callout + primary CTAs */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <MeetingCallout />
            <div className="mt-8 flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row">
              <Link href="/where-to-find-us" className="btn-primary">
                Attend a Meeting
              </Link>
              <a
                href={MEMBERSHIP_APPLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Become a Member
              </a>
              <Link href="/support-asca" className="btn-accent">
                Support ASCA
              </Link>
            </div>
          </div>
        </section>

        {/* Connect / Learn / Give */}
        <section id="connect" className="scroll-mt-24 bg-brand-bg-subtle py-20">
          <div className="container">
            <p className="section-label text-center">Our Purpose</p>
            <h2 className="section-title text-center">Connect · Learn · Give</h2>
            <ConnectLearnGiveCards />
          </div>
        </section>

        {/* Our Latest Activities (replaces old blog section) */}
        <section className="py-20">
          <div className="container">
            <p className="section-label text-center">What We&apos;ve Been Up To</p>
            <h2 className="section-title text-center">Our Latest Activities</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-brand-fg-secondary">
              From trail rides to community outreach, here&apos;s a glimpse of how ASCA stays active across metro Atlanta and beyond.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ACTIVITY_HIGHLIGHTS.map((activity) => (
                <Link
                  key={activity.title}
                  href="/gallery"
                  className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
                >
                  <Image
                    src={activity.image}
                    alt={activity.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="absolute bottom-4 left-4 text-base font-semibold text-white">
                    {activity.title}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/gallery" className="btn-secondary">
                View Full Gallery
              </Link>
            </div>
          </div>
        </section>

        {/* Photo Gallery preview */}
        <section className="bg-brand-bg-subtle py-20">
          <div className="container">
            <p className="section-label text-center">Gallery</p>
            <h2 className="section-title text-center">Life at ASCA</h2>
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* Stay Up to Date on our Events */}
        <section className="py-20">
          <div className="container max-w-3xl text-center">
            <p className="section-label">Stay Connected</p>
            <h2 className="section-title">Stay Up to Date on our Events</h2>
            <p className="mx-auto max-w-2xl text-brand-fg-secondary">
              Tell us a little about yourself and what you&apos;re interested in, and we&apos;ll keep you posted on upcoming ASCA meetings, rides, and community events.
            </p>
            <EventUpdatesForm />
          </div>
        </section>

        {/* Membership CTA */}
        <section className="bg-brand-forest py-20 text-white">
          <div className="container text-center">
            <p className="section-label text-brand-accent">Membership</p>
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Ride With Us?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-amber-100">
              Attend a meeting, join the club, or get involved with ASCA today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={MEMBERSHIP_APPLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent"
              >
                ASCA Membership Application
              </a>
              <Link href="/get-involved" className="btn-secondary border-white text-white hover:bg-white/10">
                Get Involved
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
