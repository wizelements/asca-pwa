import type { Metadata } from 'next';
import Image from 'next/image';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme } from '@/lib/db/queries';

export const metadata: Metadata = {
  title: 'About ASCA',
  description: 'ASCA sponsors and promotes horse trail rides, horseback riding lessons, camp outs and other activities promoting horsemanship in Atlanta.',
};

export default async function About() {
  const [settings, theme] = await Promise.all([
    getSettings(),
    getTheme(),
  ]);

  return (
    <>
      <style>{`
        :root {
          --color-primary: ${theme.colors.primary};
          --color-secondary: ${theme.colors.secondary};
          --color-accent: ${theme.colors.accent};
          --color-neutral: ${theme.colors.neutral};
        }
      `}</style>
      <Header />
      <main>
        <Hero
          image={settings.heroes?.about?.image || '/images/hero/about.jpg'}
          title={settings.heroes?.about?.title || 'About ASCA'}
          subtitle={settings.heroes?.about?.subtitle || 'Atlanta\'s premiere saddle club. We exist to promote positive horsemanship within the community.'}
        />

        <section className="py-20">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="card">
                <p className="section-label">What We Do</p>
                <h2 className="section-title">A Community Built Around Horses</h2>
                <p className="text-brand-fg-secondary leading-relaxed">
                  ASCA sponsors and promotes horse trail rides, horseback riding lessons, camp outs and other activities
                  that promote the development of horsemanship skills for both the young and the young at heart.
                </p>
              </div>

              <div className="card">
                <p className="section-label">Our Mission</p>
                <h2 className="section-title">Purpose-Driven Horsemanship</h2>
                <p className="text-brand-fg-secondary leading-relaxed">
                  The purpose of ASCA is to promote a knowledge of horsemanship, to disseminate any general information
                  relating to handling and training horses, and to encourage and develop sportsmanship among members and
                  the local community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Join the Club */}
        <section className="bg-brand-forest text-white py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label text-brand-accent">Join the Club</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Become a Member</h2>
            <p className="text-lg text-amber-100 leading-relaxed">
              If you would like to become a member we ask that you attend a club meeting and attend activities
              and events that we have to learn more about the club and some of the members.
            </p>
            <a href="/get-involved" className="btn-accent mt-8 inline-flex">
              Get Involved
            </a>
          </div>
        </section>

        {/* Real ASCA Photos */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src="/images/gallery/horse-closeup.jpg"
                  alt="Horse at ASCA"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src="/images/gallery/rider.jpg"
                  alt="ASCA rider on horseback"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <p className="section-label text-center">Our Values</p>
            <h2 className="section-title text-center">The Heart of ASCA</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Community',
                  description: 'Building connections and supporting local initiatives through the bond between riders and horses.',
                  accent: 'Together we rise',
                },
                {
                  title: 'Excellence',
                  description: 'Promoting quality horsemanship, education, and personal development for all ages.',
                  accent: 'Ride with skill',
                },
                {
                  title: 'Growth',
                  description: 'Inspiring a culture that we can be more than what is expected of us.',
                  accent: 'Always evolving',
                },
              ].map((value) => (
                <div key={value.title} className="card text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-accent font-semibold">{value.accent}</p>
                  <h3 className="mt-4 text-xl font-bold text-brand-fg-primary">{value.title}</h3>
                  <p className="mt-3 text-sm text-brand-fg-secondary">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
