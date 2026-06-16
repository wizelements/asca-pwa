import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MEMBERSHIP_APPLICATION_URL } from '@/lib/content/site';

export const metadata: Metadata = {
  title: 'Get Involved',
  description:
    "There's a place for everyone at the Atlanta Saddle Club Association — become a member, attend an event, volunteer, or partner with us.",
};

interface InvolveCard {
  title: string;
  body: string;
  cta: string;
  href: string;
  external?: boolean;
}

const CARDS: InvolveCard[] = [
  {
    title: 'Become a Member',
    body: 'Join a network of horse enthusiasts who share a passion for riding, learning, service, and fellowship.',
    cta: 'ASCA Membership Application',
    href: MEMBERSHIP_APPLICATION_URL,
    external: true,
  },
  {
    title: 'Attend an Event',
    body: 'From trail rides and educational programs to community outreach and special events, there are many opportunities to participate throughout the year.',
    cta: 'Where to Find Us',
    href: '/where-to-find-us',
  },
  {
    title: 'Volunteer',
    body: 'Help support our events, youth programs, fundraising efforts, and community service projects.',
    cta: 'Contact Us',
    href: '/#contact',
  },
  {
    title: 'Partner With Us',
    body: 'Businesses, organizations, and community leaders can support our mission through sponsorships and partnerships.',
    cta: 'Support ASCA',
    href: '/support-asca',
  },
];

export default function GetInvolved() {
  return (
    <>
      <Header />
      <main>
        <Hero
          image="/images/hero/involved.jpg"
          title="Get Involved"
          subtitle="Join our equestrian community — there's a place for everyone."
        />

        {/* Opening */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label">Connect</p>
            <h2 className="section-title">Ways to Take Part</h2>
            <p className="text-lg leading-relaxed text-brand-fg-secondary">
              There&apos;s a place for everyone at the Atlanta Saddle Club Association. Whether you&apos;re an
              experienced rider, new to horses, looking to volunteer, or simply interested in becoming part of a
              welcoming community, we&apos;d love to meet you.
            </p>
          </div>
        </section>

        {/* Pathway cards */}
        <section className="pb-8">
          <div className="container">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {CARDS.map((card) => (
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
                ASCA Membership Application
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
              Ready to get started? Complete our membership application or{' '}
              <Link href="/#contact" className="font-semibold text-brand-forest hover:text-brand-forest-muted">
                contact us
              </Link>{' '}
              to learn more.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
