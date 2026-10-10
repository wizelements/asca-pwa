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

        {/* Opening */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label">{siteText(copy, 'about.intro.label')}</p>
            <h2 className="section-title">{siteText(copy, 'about.intro.title')}</h2>
            <p className="text-lg leading-relaxed text-brand-fg-secondary">
              {siteText(copy, 'about.intro.body')}
            </p>
          </div>
        </section>

        {/* History */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container max-w-4xl">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <h2 className="section-title">{siteText(copy, 'about.history.title')}</h2>
                <p className="leading-relaxed text-brand-fg-secondary">
                  {siteText(copy, 'about.history.body')}
                </p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <ManagedImage
                  src={historyImage.src}
                  alt={historyImage.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Current Officers */}
        <section className="py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="section-label">{siteText(copy, 'about.leadership.label')}</p>
              <h2 className="section-title">{siteText(copy, 'about.leadership.title')}</h2>
            </div>
            <OfficerList />
          </div>
        </section>

        {/* Join the Club */}
        <section className="bg-brand-forest py-16 text-white">
          <div className="container max-w-3xl text-center">
            <p className="section-label text-brand-accent">{siteText(copy, 'about.join.label')}</p>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">{siteText(copy, 'about.join.title')}</h2>
            <p className="text-lg leading-relaxed text-amber-100">
              {siteText(copy, 'about.join.body')}{' '}
              We meet on the {siteText(copy, 'shared.meeting.cadence')} at {siteText(copy, 'shared.meeting.time')} at{' '}
              {siteText(copy, 'shared.meeting.venue')}, {siteText(copy, 'shared.meeting.address')}.
            </p>
            <Link
              href="/get-involved"
              className="btn-accent mt-8 inline-flex"
            >
              {siteText(copy, 'about.join.cta')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
