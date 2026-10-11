import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareAscaCard from '@/components/ShareAscaCard';
import { getSiteUrl } from '@/lib/site-url';
import { getCachedSiteIdentity } from '@/lib/db/queries-cache';
import { getCachedSiteContent, siteText } from '@/lib/site-content';

export const metadata: Metadata = {
  title: { absolute: 'Share ASCA | Atlanta Saddle Club Association' },
  description:
    'Share the Atlanta Saddle Club Association website, scan the official QR code, or install ASCA on your phone.',
  alternates: { canonical: '/share' },
};

export default async function ShareAscaPage() {
  const siteUrl = getSiteUrl();
  const [copy, identity] = await Promise.all([
    getCachedSiteContent(),
    getCachedSiteIdentity().catch(() => ({
      siteName: 'Atlanta Saddle Club Association',
      motto: 'We Ride To Inspire',
      heroDescription: "Atlanta's premiere saddle club — promoting horsemanship, fellowship, education, and community across metro Atlanta.",
    })),
  ]);

  return (
    <>
      <Header />
      <main className="relative overflow-hidden bg-brand-bg-body">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-[#eee7d8] via-[#f8f5ed] to-transparent"
          aria-hidden="true"
        />

        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-label">{siteText(copy, 'share.hero.label')}</p>
              <h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight text-brand-fg-primary sm:text-6xl">
                {siteText(copy, 'share.hero.title')}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-fg-secondary sm:text-lg">
                {siteText(copy, 'share.hero.body')}
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-5xl">
              <ShareAscaCard
                siteUrl={siteUrl}
                siteName={identity.siteName}
                motto={identity.motto}
                copy={{
                  label: siteText(copy, 'share.card.label'),
                  title: siteText(copy, 'share.card.title'),
                  body: siteText(copy, 'share.card.body'),
                  scanLabel: siteText(copy, 'share.card.scanLabel'),
                  downloadLabel: siteText(copy, 'share.card.downloadLabel'),
                }}
              />
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
              <div className="editorial-card p-6">
                <p className="font-serif text-xl font-semibold text-brand-fg-primary">{siteText(copy, 'share.step1.title')}</p>
                <p className="mt-3 text-base leading-7 text-brand-fg-secondary">
                  {siteText(copy, 'share.step1.body')}
                </p>
              </div>
              <div className="editorial-card p-6">
                <p className="font-serif text-xl font-semibold text-brand-fg-primary">{siteText(copy, 'share.step2.title')}</p>
                <p className="mt-3 text-base leading-7 text-brand-fg-secondary">
                  {siteText(copy, 'share.step2.body')}
                </p>
              </div>
              <div className="editorial-card p-6">
                <p className="font-serif text-xl font-semibold text-brand-fg-primary">{siteText(copy, 'share.step3.title')}</p>
                <p className="mt-3 text-base leading-7 text-brand-fg-secondary">
                  {siteText(copy, 'share.step3.body')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
