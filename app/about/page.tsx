import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OfficerList from '@/components/OfficerList';
import ManagedImage from '@/components/media/ManagedImage';
import { getManagedImage } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';
import { getCachedSiteContent, siteText } from '@/lib/site-content';

export const metadata: Metadata = {
  title: { absolute: 'About ASCA | Atlanta Saddle Club Association' },
  description:
    "Atlanta Saddle Club Association (ASCA) is Atlanta's premiere saddle club, sponsoring trail rides, riding lessons, camp outs, and community activities since 2020.",
};

export default async function About() {
  const [images, copy] = await Promise.all([
    getPublicManagedImages(),
    getCachedSiteContent(),
  ]);
  const hero = getManagedImage(images, 'about.hero');
  const historyImage = getManagedImage(images, 'about.history');

  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title={siteText(copy, 'about.hero.title')}
          subtitle={siteText(copy, 'about.hero.subtitle')}
        />

        <section className="quiet-luxe py-24 md:py-28">
          <div className="container max-w-5xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-label">{siteText(copy, 'about.intro.label')}</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'about.intro.title')}
              </h2>
              <div className="mx-auto mt-6 h-px w-20 bg-brand-accent" aria-hidden="true" />
              <p className="mt-7 text-lg leading-9 text-brand-fg-secondary">
                {siteText(copy, 'about.intro.body')}
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-brand-forest/10 bg-brand-bg-subtle py-24 md:py-28">
          <div className="container">
            <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
              <div className="order-2 lg:order-1">
                <p className="section-label">Heritage</p>
                <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                  {siteText(copy, 'about.history.title')}
                </h2>
                <p className="mt-6 text-base leading-8 text-brand-fg-secondary md:text-lg md:leading-9">
                  {siteText(copy, 'about.history.body')}
                </p>
                <div className="mt-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-fg-muted">
                  <span className="h-px w-10 bg-brand-accent" aria-hidden="true" />
                  Atlanta · Since 2020
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="media-luxe relative aspect-[4/3] overflow-hidden">
                  <ManagedImage
                    src={historyImage.src}
                    alt={historyImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f14]/35 via-transparent to-transparent" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-28">
          <div className="container">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="section-label">{siteText(copy, 'about.leadership.label')}</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'about.leadership.title')}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-brand-fg-secondary md:text-base">
                Leadership shaped by horsemanship, service, and responsibility to the community.
              </p>
            </div>
            <OfficerList />
          </div>
        </section>

        <section className="forest-luxe relative overflow-hidden py-24 text-white md:py-28">
          <div className="absolute inset-[14px] rounded-[1.5rem] border border-brand-accent/15" aria-hidden="true" />
          <div className="container relative z-10 max-w-4xl text-center">
            <p className="heritage-rule justify-center text-[10px] font-bold uppercase tracking-[0.24em] text-brand-accent">
              {siteText(copy, 'about.join.label')}
            </p>
            <h2 className="mt-7 font-serif text-4xl font-medium tracking-tight md:text-6xl">
              {siteText(copy, 'about.join.title')}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/72 md:text-lg md:leading-9">
              {siteText(copy, 'about.join.body')}{' '}
              We meet on the {siteText(copy, 'shared.meeting.cadence')} at {siteText(copy, 'shared.meeting.time')} at{' '}
              {siteText(copy, 'shared.meeting.venue')}, {siteText(copy, 'shared.meeting.address')}.
            </p>
            <Link href="/get-involved" className="btn-accent mt-9 inline-flex">
              {siteText(copy, 'about.join.cta')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
