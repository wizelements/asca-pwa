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

        <section className="quiet-luxe py-20 md:py-24">
          <div className="container max-w-5xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="section-label">Gather · Ride · Serve</p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-brand-fg-primary md:text-4xl">
                A club built around horses, fellowship, and standards that endure.
              </h2>
            </div>

            <MeetingCallout />

            <div className="mt-9 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
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

        <section id="connect" className="scroll-mt-24 border-y border-brand-forest/10 bg-brand-bg-subtle py-24 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-label">{siteText(copy, 'home.purpose.label')}</p>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'home.purpose.title')}
              </h2>
              <div className="mx-auto mt-6 h-px w-20 bg-brand-accent" aria-hidden="true" />
            </div>
            <ConnectLearnGiveCards />
          </div>
        </section>

        <section className="py-24 md:py-28">
          <div className="container">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="section-label">In the saddle · In the community</p>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'home.activities.title')}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-brand-fg-secondary">
                {siteText(copy, 'home.activities.body')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {useAlbums
                ? featuredAlbums.map((album) => (
                    <Link
                      key={album.id}
                      href={`/gallery/${album.slug}`}
                      className="media-luxe group relative block aspect-[4/3] overflow-hidden"
                    >
                      <Image
                        src={album.coverUrl || '/images/gallery/placeholder.svg'}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f14]/90 via-[#0d1f14]/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                        <span className="font-serif text-2xl font-semibold text-white">{album.title}</span>
                      </div>
                    </Link>
                  ))
                : activityHighlights.map((activity) => {
                    const category = ACTIVITY_CATEGORY_MAP[activity.title ?? ''];
                    const href = category ? `/gallery?category=${encodeURIComponent(category)}` : '/gallery';
                    return (
                      <Link
                        key={activity.slot}
                        href={href}
                        className="media-luxe group relative block aspect-[4/3] overflow-hidden"
                      >
                        <ManagedImage
                          src={activity.src}
                          alt={activity.alt}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f14]/90 via-[#0d1f14]/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                            <span className="font-serif text-2xl font-semibold text-white">{activity.title}</span>
                        </div>
                      </Link>
                    );
                  })}
            </div>

            <div className="mt-12 text-center">
              <Link href="/gallery" className="btn-secondary">
                {siteText(copy, 'home.activities.cta')}
              </Link>
            </div>
          </div>
        </section>

        <section id="event-updates" className="quiet-luxe scroll-mt-24 border-y border-brand-forest/10 py-24 md:py-28">
          <div className="container max-w-4xl">
            <div className="editorial-card px-6 py-10 text-center sm:px-10 md:px-14 md:py-14">
              <p className="section-label">{siteText(copy, 'home.updates.label')}</p>
              <h2 className="font-serif text-4xl font-semibold tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'home.updates.title')}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-brand-fg-secondary">
                {siteText(copy, 'home.updates.body')}
              </p>
              <EventUpdatesForm />
            </div>
          </div>
        </section>

        <section className="forest-luxe relative overflow-hidden py-24 text-white md:py-28">
          <div className="container relative z-10 text-center">
            <p className="heritage-rule justify-center text-xs font-bold uppercase tracking-[0.12em] text-brand-accent">
              {siteText(copy, 'home.final.label')}
            </p>
            <h2 className="mx-auto mt-7 max-w-4xl font-serif text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              {siteText(copy, 'home.final.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/90 md:text-lg">
              {siteText(copy, 'home.final.body')}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/get-involved" className="btn-secondary border-white/45 text-white hover:bg-white/10">
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
