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
    },
    {
      title: siteText(copy, 'involved.event.title'),
      body: siteText(copy, 'involved.event.body'),
      cta: siteText(copy, 'involved.event.cta'),
      href: '/where-to-find-us',
    },
    {
      title: siteText(copy, 'involved.volunteer.title'),
      body: siteText(copy, 'involved.volunteer.body'),
      cta: siteText(copy, 'involved.volunteer.cta'),
      href: '/#contact',
    },
    {
      title: siteText(copy, 'involved.partner.title'),
      body: siteText(copy, 'involved.partner.body'),
      cta: siteText(copy, 'involved.partner.cta'),
      href: '/support-asca',
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

        {/* Opening */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label">{siteText(copy, 'involved.intro.label')}</p>
            <h2 className="section-title">{siteText(copy, 'involved.intro.title')}</h2>
            <p className="text-lg leading-relaxed text-brand-fg-secondary">
              {siteText(copy, 'involved.intro.body')}
            </p>
          </div>
        </section>

        {/* Pathway cards */}
        <section className="pb-8">
          <div className="container">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {cards.map((card) => (
                <div key={card.title} className="card flex flex-col">
                  <h3 className="text-xl font-bold text-brand-fg-primary">{card.title}</h3>
                  <p className="mt-3 flex-1 text-brand-fg-secondary">{card.body}</p>
                  {card.external ? (
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary mt-6 inline-flex self-start text-xs"
                    >
                      {card.cta}
                    </a>
                  ) : (
                    <Link href={card.href} className="btn-primary mt-6 inline-flex self-start text-xs">
                      {card.cta}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Membership application embed */}
        <section className="py-16">
          <div className="container max-w-3xl">
            <div className="rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated p-4 shadow-sm">
              <h2 className="mb-4 text-center text-xl font-bold font-display text-brand-fg-primary">
                {siteText(copy, 'involved.application.title')}
              </h2>
              <iframe
                src={MEMBERSHIP_APPLICATION_URL}
                title="ASCA Membership Application"
                width="100%"
                height="800"
                style={{ border: 'none', minHeight: '800px' }}
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-brand-bg-subtle py-12">
          <div className="container max-w-2xl text-center">
            <p className="text-lg text-brand-fg-secondary">
              {siteText(copy, 'involved.final.body')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
