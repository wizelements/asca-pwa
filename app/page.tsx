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
import { getFeaturedAlbums } from '@/lib/gallery/services/albums';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import { getCachedSiteIdentity } from '@/lib/db/queries-cache';
import { getCachedSiteContent, siteText } from '@/lib/site-content';
import Image from 'next/image';

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
  const [images, identity, featuredAlbums, copy] = await Promise.all([
    getPublicManagedImages(),
    getCachedSiteIdentity().catch(() => ({
      siteName: 'Atlanta Saddle Club Association',
      motto: 'We Ride To Inspire',
      heroDescription: "Atlanta's premiere saddle club — promoting horsemanship, fellowship, education, and community across metro Atlanta.",
    })),
    isPublicPreviewEnabled() ? getFeaturedAlbums(6) : Promise.resolve([]),
    getCachedSiteContent(),
  ]);
  const hero = getManagedImage(images, 'home.hero');
  const activityHighlights = ACTIVITY_SLOTS.map((slot) => getManagedImage(images, slot));
  const useAlbums = featuredAlbums.length > 0;


  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title={identity.motto}
          subtitle={identity.heroDescription}
        />

        {/* Meeting callout + primary CTAs */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <MeetingCallout />
            <div className="mt-8 flex flex-col flex-wrap items-center justify-center gap-4 sm:flex-row">
              <Link href="/where-to-find-us" className="btn-primary">
                {siteText(copy, 'home.cta.meeting')}
              </Link>
              <Link href="/members" className="btn-secondary">
                {siteText(copy, 'home.cta.member')}
              </Link>
              <Link href="/support-asca" className="btn-accent">
                {siteText(copy, 'home.cta.support')}
              </Link>
            </div>
          </div>
        </section>

        {/* Connect / Learn / Give */}
        <section id="connect" className="scroll-mt-24 bg-brand-bg-subtle py-20">
          <div className="container">
            <p className="section-label text-center">{siteText(copy, 'home.purpose.label')}</p>
            <h2 className="section-title text-center">{siteText(copy, 'home.purpose.title')}</h2>
            <ConnectLearnGiveCards />
          </div>
        </section>

        {/* Our Latest Activities (replaces old blog section) */}
        <section className="py-20">
          <div className="container">
            <h2 className="section-title text-center">{siteText(copy, 'home.activities.title')}</h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-brand-fg-secondary">
              {siteText(copy, 'home.activities.body')}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {useAlbums
                ? featuredAlbums.map((album) => (
                    <Link
                      key={album.id}
                      href={`/gallery/${album.slug}`}
                      className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
                    >
                      <Image
                        src={album.coverUrl || '/images/gallery/placeholder.svg'}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <span className="absolute bottom-4 left-4 text-base font-semibold text-white">
                        {album.title}
                      </span>
                    </Link>
                  ))
                : activityHighlights.map((activity) => {
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
                {siteText(copy, 'home.activities.cta')}
              </Link>
            </div>
          </div>
        </section>



        {/* Stay Up to Date on our Events */}
        <section id="event-updates" className="scroll-mt-24 py-20">
          <div className="container max-w-3xl text-center">
            <p className="section-label">{siteText(copy, 'home.updates.label')}</p>
            <h2 className="section-title">{siteText(copy, 'home.updates.title')}</h2>
            <p className="mx-auto max-w-2xl text-brand-fg-secondary">
              {siteText(copy, 'home.updates.body')}
            </p>
            <EventUpdatesForm />
          </div>
        </section>

        {/* Membership CTA */}
        <section className="bg-brand-forest py-20 text-white">
          <div className="container text-center">
            <p className="section-label text-brand-accent">{siteText(copy, 'home.final.label')}</p>
            <h2 className="text-3xl font-bold md:text-4xl">{siteText(copy, 'home.final.title')}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-amber-100">
              {siteText(copy, 'home.final.body')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/get-involved" className="btn-secondary border-white text-white hover:bg-white/10">
                {siteText(copy, 'home.final.cta')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
