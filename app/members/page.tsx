import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ManagedImage from '@/components/media/ManagedImage';
import { MEMBERSHIP_APPLICATION_URL } from '@/lib/content/site';
import { WHY_MEMBERS_JOIN, FUN_FACTS } from '@/lib/content/club';
import { getManagedImage } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';

export const metadata: Metadata = {
  title: { absolute: 'Meet Our Members | ASCA' },
  description:
    'Meet the members of the Atlanta Saddle Club Association — trail riders, horse owners, families, and horse lovers united by a passion for horses and community.',
};

export default async function Members() {
  const images = await getPublicManagedImages();
  const hero = getManagedImage(images, 'members.hero');
  const communityOne = getManagedImage(images, 'members.community.1');
  const communityTwo = getManagedImage(images, 'members.community.2');

  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title="Meet Our Members"
          subtitle="United by a shared passion for horses, adventure, and community."
        />

        {/* Main copy */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label">Our Community</p>
            <h2 className="section-title">A Place to Belong</h2>
            <p className="text-lg leading-relaxed text-brand-fg-secondary">
              Our members come from all walks of life, and represent different ages, backgrounds, and experiences,
              but we&apos;re united by a shared passion for horses, adventure, and community. We believe those
              differences should never limit what is possible. Whether you&apos;re a seasoned rider or fulfilling a
              childhood dream of becoming a cowboy or cowgirl, you&apos;ll find a place to belong here.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-brand-fg-secondary">
              Our members include trail riders, horse owners, first-time riders, lifelong equestrians, families,
              retirees, professionals, students, and horse lovers who simply enjoy being part of the community. No
              matter your experience level, there&apos;s a place for you in our club.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <ManagedImage
                  src={communityOne.src}
                  alt={communityOne.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <ManagedImage
                  src={communityTwo.src}
                  alt={communityTwo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Members Join */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="section-label">Why Members Join</p>
              <h2 className="section-title">Reasons to Ride With Us</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_MEMBERS_JOIN.map((reason) => (
                <div key={reason} className="card flex items-center gap-3">
                  <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-forest" aria-hidden="true" />
                  <span className="text-brand-fg-primary">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fun Facts */}
        <section className="py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="section-label">By the Numbers</p>
              <h2 className="section-title">Fun Facts About Our Club</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FUN_FACTS.map((fact) => (
                <div key={fact.label} className="card">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-forest">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-brand-fg-secondary">{fact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-brand-forest py-16 text-white">
          <div className="container max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Interested in Learning More?</h2>
            <p className="text-lg leading-relaxed text-amber-100">
              We&apos;d love to meet you. Whether you&apos;re an experienced rider, new to horses, or simply looking
              for a welcoming community, we invite you to join us at an upcoming meeting or event.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/where-to-find-us" className="btn-accent">
                Where to Find Us
              </Link>
              <a
                href={MEMBERSHIP_APPLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary border-white text-white hover:bg-white/10"
              >
                ASCA Membership Application
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
