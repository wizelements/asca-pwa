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
    <ul className="mt-7 space-y-4">
      {items.map((item, index) => (
        <li key={item} className="flex items-start gap-4 text-brand-fg-secondary">
          <span className="mt-0.5 font-serif text-sm italic text-brand-forest/70">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="leading-7">{item}</span>
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

        <section className="quiet-luxe py-24 md:py-28">
          <div className="container max-w-5xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-label">{siteText(copy, 'support.intro.label')}</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'support.intro.title')}
              </h2>
              <div className="mx-auto mt-6 h-px w-20 bg-brand-accent" aria-hidden="true" />
              <p className="mt-7 text-lg leading-9 text-brand-fg-secondary">
                {siteText(copy, 'support.intro.body')}
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-brand-forest/10 bg-brand-bg-subtle py-24 md:py-28">
          <div className="container max-w-5xl">
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div>
                <p className="section-label">Stewardship</p>
                <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                  {siteText(copy, 'support.reasons.title')}
                </h2>
                <p className="mt-6 text-base leading-8 text-brand-fg-secondary">
                  {siteText(copy, 'support.reasons.body')}
                </p>
              </div>
              <article className="editorial-card p-8 md:p-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-forest">
                  What your support sustains
                </p>
                <BulletList items={siteList(copy, 'support.reasons.items')} />
              </article>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-28">
          <div className="container max-w-5xl">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="section-label">Direct support</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'support.give.title')}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-brand-fg-secondary">
                {siteText(copy, 'support.give.body')}
              </p>
            </div>
            <SupportMethods />
          </div>
        </section>

        <section className="quiet-luxe border-y border-brand-forest/10 py-24 md:py-28">
          <div className="container max-w-5xl">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <article className="editorial-card p-8 md:p-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-forest">Participation</p>
                <h2 className="mt-5 font-serif text-3xl font-medium text-brand-fg-primary">
                  {siteText(copy, 'support.other.title')}
                </h2>
                <div className="mt-5 h-px w-12 bg-brand-accent" aria-hidden="true" />
                <BulletList items={siteList(copy, 'support.other.items')} />
              </article>

              <article className="editorial-card p-8 md:p-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-forest">Current priorities</p>
                <h2 className="mt-5 font-serif text-3xl font-medium text-brand-fg-primary">
                  {siteText(copy, 'support.needs.title')}
                </h2>
                <div className="mt-5 h-px w-12 bg-brand-accent" aria-hidden="true" />
                <BulletList items={siteList(copy, 'support.needs.items')} />
              </article>
            </div>
          </div>
        </section>

        <section className="py-24 md:py-28">
          <div className="container max-w-4xl">
            <div className="editorial-card p-8 text-center md:p-12">
              <p className="section-label">Partnership</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'support.sponsor.title')}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-brand-fg-secondary">
                {siteText(copy, 'support.sponsor.body')}
              </p>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-7 inline-flex border-b border-brand-accent/70 pb-1 text-lg font-semibold text-brand-forest hover:text-brand-forest-muted"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </section>

        <section className="forest-luxe py-20 text-white md:py-24">
          <div className="container max-w-3xl text-center">
            <p className="heritage-rule justify-center text-[10px] font-bold uppercase tracking-[0.24em] text-brand-accent">
              With gratitude
            </p>
            <p className="mx-auto mt-7 max-w-2xl font-serif text-2xl font-medium leading-relaxed md:text-3xl">
              {siteText(copy, 'support.final.body')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
