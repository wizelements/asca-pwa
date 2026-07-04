import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import MeetingCallout from '@/components/MeetingCallout';
import ConnectLearnGiveCards from '@/components/ConnectLearnGiveCards';
import EventUpdatesForm from '@/components/EventUpdatesForm';
import ManagedImage from '@/components/media/ManagedImage';

import { getManagedImage, type SiteImageSlot } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';

const ACTIVITY_SLOTS: SiteImageSlot[] = [
  'home.activity.trailRides',
  'home.activity.communityOutreach',
  'home.activity.parades',
  'home.activity.horsemanship',
  'home.activity.festivalRodeo',
  'home.activity.fellowship',
];

/** Map an activity card title to a gallery category slug used in /gallery?category=<slug>. */
const ACTIVITY_CATEGORY_MAP: Record<string, string> = {
  'Trail Rides': 'Trail Rides',
  'Community Outreach': 'Community Outreach',
  'Parades': 'Parades',
  'Horsemanship': 'Horsemanship',
  'Festival & Rodeo Events': 'Festival & Rodeo Events',
  'Fellowship': 'Fellowship',
};

export default async function Home() {
  const images = await getPublicManagedImages();
  const hero = getManagedImage(images, 'home.hero');
  const activityHighlights = ACTIVITY_SLOTS.map((slot) => getManagedImage(images, slot));


  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
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
              <Link href="/members" className="btn-secondary">
                Become a Member
              </Link>
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
            <h2 className="section-title text-center">Our Latest Activities</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-brand-fg-secondary">
              From trail rides to community outreach, here&apos;s a glimpse of how ASCA stays active across metro Atlanta and beyond.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activityHighlights.map((activity) => {
                const category = ACTIVITY_CATEGORY_MAP[activity.title ?? ''];
                const href = category ? `/gallery?category=${encodeURIComponent(category)}` : '/gallery';
                return (
                <Link
                  key={activity.slot}
                  href={href}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
                >
                  <ManagedImage
                    src={activity.src}
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
              );
              })}
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
            <p className="section-label text-brand-accent">Get Involved</p>
            <h2 className="text-3xl font-bold md:text-4xl">Ready to Get Involved?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-amber-100">
              Attend a meeting, join the club, volunteer, or support ASCA today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
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
