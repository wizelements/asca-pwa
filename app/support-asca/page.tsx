import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupportMethods from '@/components/SupportMethods';
import { getCachedContactEmail } from '@/lib/db/queries-cache';
import { getManagedImage } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';
import { getCachedSiteContent, siteList, siteText } from '@/lib/site-content';

export const metadata: Metadata = {
  title: { absolute: 'Support ASCA | Atlanta Saddle Club Association' },
  description:
    'Support the Atlanta Saddle Club Association. Your contributions fund horsemanship education, community outreach, and equestrian experiences across metro Atlanta.',
};

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-brand-fg-secondary">
          <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-brand-forest" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function SupportAsca() {
  const [images, contactEmail, copy] = await Promise.all([
    getPublicManagedImages(),
    getCachedContactEmail().catch(() => 'info@atlantasaddleclub.com'),
    getCachedSiteContent(),
  ]);
  const hero = getManagedImage(images, 'support.hero');

  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title={siteText(copy, 'support.hero.title')}
          subtitle={siteText(copy, 'support.hero.subtitle')}
        />

        {/* Opening */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label">{siteText(copy, 'support.intro.label')}</p>
            <h2 className="section-title">{siteText(copy, 'support.intro.title')}</h2>
            <p className="text-lg leading-relaxed text-brand-fg-secondary">
              {siteText(copy, 'support.intro.body')}
            </p>
          </div>
        </section>

        {/* Why Your Support Matters */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container max-w-4xl">
            <h2 className="section-title text-center">{siteText(copy, 'support.reasons.title')}</h2>
            <div className="card mt-8">
              <BulletList items={siteList(copy, 'support.reasons.items')} />
              <p className="mt-6 leading-relaxed text-brand-fg-secondary">
                {siteText(copy, 'support.reasons.body')}
              </p>
            </div>
          </div>
        </section>

        {/* Donation methods */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <h2 className="section-title text-center">{siteText(copy, 'support.give.title')}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-center text-brand-fg-secondary">
              {siteText(copy, 'support.give.body')}
            </p>
            <SupportMethods />
          </div>
        </section>

        {/* Other Ways to Support + Current Needs */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container max-w-4xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="card">
                <h2 className="text-2xl font-bold text-brand-fg-primary">{siteText(copy, 'support.other.title')}</h2>
                <BulletList items={siteList(copy, 'support.other.items')} />
              </div>
              <div className="card">
                <h2 className="text-2xl font-bold text-brand-fg-primary">{siteText(copy, 'support.needs.title')}</h2>
                <BulletList items={siteList(copy, 'support.needs.items')} />
              </div>
            </div>
          </div>
        </section>

        {/* Sponsorship contact */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="section-title">{siteText(copy, 'support.sponsor.title')}</h2>
            <p className="text-brand-fg-secondary">
              {siteText(copy, 'support.sponsor.body')}
            </p>
            <div className="mt-6">
              <a
                href={`mailto:${contactEmail}`}
                className="text-lg font-semibold text-brand-forest hover:text-brand-forest-muted"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-brand-forest py-12 text-white">
          <div className="container max-w-2xl text-center">
            <p className="text-lg leading-relaxed text-amber-100">
              {siteText(copy, 'support.final.body')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
