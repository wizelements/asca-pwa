import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ManagedImage from '@/components/media/ManagedImage';
import { MEMBERSHIP_APPLICATION_URL } from '@/lib/content/site';
import { getManagedImage } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';
import { getCachedActiveMemberCount } from '@/lib/db/queries-cache';
import { getCachedSiteContent, siteList, siteText } from '@/lib/site-content';

export const metadata: Metadata = {
  title: { absolute: 'Meet Our Members | ASCA' },
  description:
    'Meet the members of the Atlanta Saddle Club Association — trail riders, horse owners, families, and horse lovers united by a passion for horses and community.',
};

export default async function Members() {
  const [images, activeMemberCount, copy] = await Promise.all([
    getPublicManagedImages(),
    getCachedActiveMemberCount().catch(() => null),
    getCachedSiteContent(),
  ]);
  const publicFacts = [
    { label: 'Years in operation', value: siteText(copy, 'members.fact.years') },
    { label: 'Members', value: activeMemberCount !== null ? String(activeMemberCount) : '—' },
    { label: 'Trail rides completed', value: siteText(copy, 'members.fact.trails') },
    { label: 'Parades completed', value: siteText(copy, 'members.fact.parades') },
    { label: 'Community giving', value: siteText(copy, 'members.fact.giving') },
    { label: 'Black Cowboy Heritage Festival', value: siteText(copy, 'members.fact.festival') },
    { label: 'Trots for Tots Breakfast with Santa', value: siteText(copy, 'members.fact.tots') },
  ];
  const hero = getManagedImage(images, 'members.hero');
  const communityOne = getManagedImage(images, 'members.community.1');
  const communityTwo = getManagedImage(images, 'members.community.2');

  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title={siteText(copy, 'members.hero.title')}
          subtitle={siteText(copy, 'members.hero.subtitle')}
        />

        {/* Main copy */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label">{siteText(copy, 'members.intro.label')}</p>
            <h2 className="section-title">{siteText(copy, 'members.intro.title')}</h2>
            <p className="text-lg leading-relaxed text-brand-fg-secondary">
              {siteText(copy, 'members.intro.body1')}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-brand-fg-secondary">
              {siteText(copy, 'members.intro.body2')}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <ManagedImage
                  src={communityOne.src}
                  alt={communityOne.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <ManagedImage
                  src={communityTwo.src}
                  alt={communityTwo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Members Join */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="section-label">{siteText(copy, 'members.reasons.label')}</p>
              <h2 className="section-title">{siteText(copy, 'members.reasons.title')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {siteList(copy, 'members.reasons.items').map((reason) => (
                <div key={reason} className="card flex items-center gap-3">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-forest" aria-hidden="true" />
                  <span className="text-brand-fg-primary">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fun Facts */}
        <section className="py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="section-label">{siteText(copy, 'members.facts.label')}</p>
              <h2 className="section-title">{siteText(copy, 'members.facts.title')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {publicFacts.map((fact) => (
                <div key={fact.label} className="card">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-forest">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-brand-fg-secondary">{fact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-brand-forest py-16 text-white">
          <div className="container max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{siteText(copy, 'members.final.title')}</h2>
            <p className="text-lg leading-relaxed text-amber-100">
              {siteText(copy, 'members.final.body')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/where-to-find-us" className="btn-accent">
                {siteText(copy, 'members.final.eventsCta')}
              </Link>
              <Link href="/share" className="btn-secondary border-white text-white hover:bg-white/10">
                {siteText(copy, 'members.final.shareCta')}
              </Link>
              <a
                href={MEMBERSHIP_APPLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                {siteText(copy, 'members.final.applyCta')}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
