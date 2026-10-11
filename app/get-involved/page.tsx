import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MEMBERSHIP_APPLICATION_URL } from '@/lib/content/site';
import { getManagedImage } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';
import { getCachedSiteContent, siteText } from '@/lib/site-content';

export const metadata: Metadata = {
  title: { absolute: 'Get Involved | ASCA' },
  description:
    "There's a place for everyone at the Atlanta Saddle Club Association — become a member, attend an event, volunteer, or partner with us.",
};

export default async function GetInvolved() {
  const [images, copy] = await Promise.all([
    getPublicManagedImages(),
    getCachedSiteContent(),
  ]);

  const cards = [
    {
      title: siteText(copy, 'involved.member.title'),
      body: siteText(copy, 'involved.member.body'),
      cta: siteText(copy, 'involved.member.cta'),
      href: MEMBERSHIP_APPLICATION_URL,
      external: true,
      numeral: 'I',
    },
    {
      title: siteText(copy, 'involved.event.title'),
      body: siteText(copy, 'involved.event.body'),
      cta: siteText(copy, 'involved.event.cta'),
      href: '/where-to-find-us',
      numeral: 'II',
    },
    {
      title: siteText(copy, 'involved.volunteer.title'),
      body: siteText(copy, 'involved.volunteer.body'),
      cta: siteText(copy, 'involved.volunteer.cta'),
      href: '/#contact',
      numeral: 'III',
    },
    {
      title: siteText(copy, 'involved.partner.title'),
      body: siteText(copy, 'involved.partner.body'),
      cta: siteText(copy, 'involved.partner.cta'),
      href: '/support-asca',
      numeral: 'IV',
    },
  ];

  const hero = getManagedImage(images, 'getInvolved.hero');

  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title={siteText(copy, 'involved.hero.title')}
          subtitle={siteText(copy, 'involved.hero.subtitle')}
        />

        <section className="quiet-luxe py-24 md:py-28">
          <div className="container max-w-5xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-label">{siteText(copy, 'involved.intro.label')}</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'involved.intro.title')}
              </h2>
              <div className="mx-auto mt-6 h-px w-20 bg-brand-accent" aria-hidden="true" />
              <p className="mt-7 text-lg leading-9 text-brand-fg-secondary">
                {siteText(copy, 'involved.intro.body')}
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-brand-forest/10 bg-brand-bg-subtle py-24 md:py-28">
          <div className="container">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {cards.map((card) => (
                <article key={card.title} className="editorial-card group flex min-h-[300px] flex-col p-8 md:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-forest">
                      A way into ASCA
                    </p>
                    <span className="font-serif text-sm italic text-brand-fg-muted/60">{card.numeral}</span>
                  </div>
                  <div className="mt-8 h-px w-12 bg-brand-accent transition-all duration-300 group-hover:w-20" aria-hidden="true" />
                  <h3 className="mt-6 font-serif text-3xl font-medium leading-tight text-brand-fg-primary">
                    {card.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-brand-fg-secondary md:text-base md:leading-8">
                    {card.body}
                  </p>
                  {card.external ? (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-forest hover:text-brand-forest-muted"
                    >
                      {card.cta} <span aria-hidden="true">→</span>
                    </a>
                  ) : (
                    <Link
                      href={card.href}
                      className="mt-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-forest hover:text-brand-forest-muted"
                    >
                      {card.cta} <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 md:py-28">
          <div className="container max-w-4xl">
            <div className="mb-10 text-center">
              <p className="section-label">Membership</p>
              <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
                {siteText(copy, 'involved.application.title')}
              </h2>
            </div>
            <div className="editorial-card overflow-hidden p-3 sm:p-4">
              <iframe
                src={MEMBERSHIP_APPLICATION_URL}
                title="ASCA Membership Application"
                width="100%"
                height="800"
                className="rounded-[1rem] bg-white"
                style={{ border: 'none', minHeight: '800px' }}
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="forest-luxe py-16 text-white md:py-20">
          <div className="container max-w-3xl text-center">
            <p className="heritage-rule justify-center text-[10px] font-bold uppercase tracking-[0.24em] text-brand-accent">
              Next step
            </p>
            <p className="mx-auto mt-6 max-w-2xl font-serif text-2xl font-medium leading-relaxed md:text-3xl">
              {siteText(copy, 'involved.final.body')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
