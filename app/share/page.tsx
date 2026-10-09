import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareAscaCard from '@/components/ShareAscaCard';
import { getSiteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: { absolute: 'Share ASCA | Atlanta Saddle Club Association' },
  description:
    'Share the Atlanta Saddle Club Association website, scan the official QR code, or install ASCA on your phone.',
  alternates: { canonical: '/share' },
};

export default function ShareAscaPage() {
  const siteUrl = getSiteUrl();

  return (
    <>
      <Header />
      <main className="relative overflow-hidden bg-brand-bg-body">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-brand-accent/15 via-brand-bg-soft/60 to-transparent"
          aria-hidden="true"
        />

        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <p className="section-label">ASCA Member Share Center</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-brand-fg-primary sm:text-5xl">
                Share the ride. Grow the community.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-fg-secondary sm:text-lg">
                Keep this page on your phone and use it whenever someone asks about ASCA.
                They can scan the code, open the site, or you can send the link in seconds.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-5xl">
              <ShareAscaCard siteUrl={siteUrl} />
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated p-5 shadow-sm">
                <p className="text-sm font-bold text-brand-fg-primary">1 · Show</p>
                <p className="mt-2 text-sm leading-6 text-brand-fg-secondary">
                  Open this page and let someone scan the large ASCA QR code.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated p-5 shadow-sm">
                <p className="text-sm font-bold text-brand-fg-primary">2 · Share</p>
                <p className="mt-2 text-sm leading-6 text-brand-fg-secondary">
                  Send the official website through your phone&apos;s normal share menu.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated p-5 shadow-sm">
                <p className="text-sm font-bold text-brand-fg-primary">3 · Install</p>
                <p className="mt-2 text-sm leading-6 text-brand-fg-secondary">
                  Add ASCA to your home screen so the share center is always close by.
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
