import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SupportMethods from '@/components/SupportMethods';
import { CONTACT_EMAILS } from '@/lib/content/site';
import { SUPPORT_REASONS, OTHER_WAYS_TO_SUPPORT, SUPPORT_NEEDS } from '@/lib/content/club';

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

export default function SupportAsca() {
  return (
    <>
      <Header />
      <main>
        <Hero
          image="/images/hero/donate.jpg"
          title="Support ASCA"
          subtitle="Help us make a difference both in and out of the saddle."
        />

        {/* Opening */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label">Support</p>
            <h2 className="section-title">Why We Need You</h2>
            <p className="text-lg leading-relaxed text-brand-fg-secondary">
              The Atlanta Saddle Club Association is dedicated to promoting horsemanship, education, community
              involvement, and fellowship through a shared love of horses. Through our programs, events, and outreach
              efforts, we strive to create opportunities for individuals and families to learn, connect, and grow
              while preserving the traditions and values of the equestrian community.
            </p>
          </div>
        </section>

        {/* Why Your Support Matters */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container max-w-4xl">
            <h2 className="section-title text-center">Why Your Support Matters</h2>
            <div className="card mt-8">
              <BulletList items={SUPPORT_REASONS} />
              <p className="mt-6 leading-relaxed text-brand-fg-secondary">
                Every contribution, large or small, helps us expand our programs, strengthen our community impact,
                and create meaningful opportunities for riders and families in metro Atlanta and beyond.
              </p>
            </div>
          </div>
        </section>

        {/* Donation methods */}
        <section className="py-16">
          <div className="container max-w-4xl">
            <h2 className="section-title text-center">Ways to Give</h2>
            <p className="mx-auto mb-8 max-w-2xl text-center text-brand-fg-secondary">
              Make a direct donation using either of the options below.
            </p>
            <SupportMethods />
          </div>
        </section>

        {/* Other Ways to Support + Current Needs */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container max-w-4xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="card">
                <h2 className="text-2xl font-bold text-brand-fg-primary">Other Ways to Support</h2>
                <BulletList items={OTHER_WAYS_TO_SUPPORT} />
              </div>
              <div className="card">
                <h2 className="text-2xl font-bold text-brand-fg-primary">Current Needs</h2>
                <BulletList items={SUPPORT_NEEDS} />
              </div>
            </div>
          </div>
        </section>

        {/* Sponsorship contact */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="section-title">Contact Us About Sponsorship Opportunities</h2>
            <p className="text-brand-fg-secondary">
              Interested in sponsoring an event or partnering with ASCA? Reach out:
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
              <a
                href={`mailto:${CONTACT_EMAILS.primary}`}
                className="text-lg font-semibold text-brand-forest hover:text-brand-forest-muted"
              >
                {CONTACT_EMAILS.primary}
              </a>
              <a
                href={`mailto:${CONTACT_EMAILS.secondary}`}
                className="text-lg font-semibold text-brand-forest hover:text-brand-forest-muted"
              >
                {CONTACT_EMAILS.secondary}
              </a>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-brand-forest py-12 text-white">
          <div className="container max-w-2xl text-center">
            <p className="text-lg leading-relaxed text-amber-100">
              Thank you for supporting the Atlanta Saddle Club Association and helping us make a difference both in
              and out of the saddle.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
