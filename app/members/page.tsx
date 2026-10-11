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

        <section className="quiet-luxe py-24 md:py-28">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-16">
              <div>
                <p className="section-label">{siteText(copy, 'members.intro.label')}</p>
                <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                  {siteText(copy, 'members.intro.title')}
                </h2>
                <div className="mt-6 h-px w-16 bg-brand-accent" aria-hidden="true" />
                <p className="mt-7 text-base leading-8 text-brand-fg-secondary md:text-lg md:leading-9">
                  {siteText(copy, 'members.intro.body1')}
                </p>
                <p className="mt-5 text-base leading-8 text-brand-fg-secondary">
                  {siteText(copy, 'members.intro.body2')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[communityOne, communityTwo].map((image, index) => (
                  <div
                    key={image.slot}
                    className={`media-luxe relative overflow-hidden ${index === 0 ? 'aspect-[4/5] translate-y-5' : 'aspect-[4/5]'}`}
                  >
                    <ManagedImage
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f14]/28 via-transparent to-transparent" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-brand-forest/10 bg-brand-bg-subtle py-24 md:py-28">
          <div className="container">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="section-label">{siteText(copy, 'members.reasons.label')}</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'members.reasons.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {siteList(copy, 'members.reasons.items').map((reason, index) => (
                <article key={reason} className="editorial-card group min-h-[165px] p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-serif text-sm italic text-brand-fg-muted/60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px flex-1 bg-brand-accent/55" aria-hidden="true" />
                  </div>
                  <p className="mt-7 font-serif text-2xl font-medium leading-tight text-brand-fg-primary">{reason}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 md:py-28">
          <div className="container">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="section-label">{siteText(copy, 'members.facts.label')}</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'members.facts.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[1.5rem] border border-brand-forest/10 bg-brand-forest/10 sm:grid-cols-2 lg:grid-cols-3">
              {publicFacts.map((fact, index) => (
                <article key={fact.label} className="bg-[#fbfaf6] p-7 md:p-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-forest">
                    {fact.label}
                  </p>
                  <div className="mt-5 h-px w-10 bg-brand-accent" aria-hidden="true" />
                  <p className="mt-5 font-serif text-2xl font-medium leading-snug text-brand-fg-primary">
                    {fact.value}
                  </p>
                  <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-fg-muted">
                    ASCA · {String(index + 1).padStart(2, '0')}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="forest-luxe relative overflow-hidden py-24 text-white md:py-28">
          <div className="absolute inset-[14px] rounded-[1.5rem] border border-brand-accent/15" aria-hidden="true" />
          <div className="container relative z-10 max-w-4xl text-center">
            <p className="heritage-rule justify-center text-[10px] font-bold uppercase tracking-[0.24em] text-brand-accent">
              Membership
            </p>
            <h2 className="mt-7 font-serif text-4xl font-medium tracking-tight md:text-6xl">
              {siteText(copy, 'members.final.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/72 md:text-lg md:leading-9">
              {siteText(copy, 'members.final.body')}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/where-to-find-us" className="btn-accent">
                {siteText(copy, 'members.final.eventsCta')}
              </Link>
              <Link href="/share" className="btn-secondary border-white/45 text-white hover:bg-white/10">
                {siteText(copy, 'members.final.shareCta')}
              </Link>
              <a
                href={MEMBERSHIP_APPLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary border-white/45 text-white hover:bg-white/10"
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
