import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OfficerList from '@/components/OfficerList';
import ManagedImage from '@/components/media/ManagedImage';
import { MEMBERSHIP_APPLICATION_URL } from '@/lib/content/site';
import { getManagedImage } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';

export const metadata: Metadata = {
  title: { absolute: 'About ASCA | Atlanta Saddle Club Association' },
  description:
    "Atlanta Saddle Club Association (ASCA) is Atlanta's premiere saddle club, sponsoring trail rides, riding lessons, camp outs, and community activities since 2020.",
};

export default async function About() {
  const images = await getPublicManagedImages();
  const hero = getManagedImage(images, 'about.hero');
  const historyImage = getManagedImage(images, 'about.history');

  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title="About ASCA"
          subtitle="Atlanta's premiere saddle club, promoting positive horsemanship within the community."
        />

        {/* Opening */}
        <section className="py-16">
          <div className="container max-w-3xl text-center">
            <p className="section-label">Who We Are</p>
            <h2 className="section-title">Atlanta Saddle Club Association</h2>
            <p className="text-lg leading-relaxed text-brand-fg-secondary">
              Atlanta Saddle Club Association (ASCA) — Atlanta&apos;s premiere saddle club. ASCA sponsors and
              promotes horse trail rides, horseback riding lessons, camp outs, and other activities.
            </p>
          </div>
        </section>

        {/* History */}
        <section className="bg-brand-bg-subtle py-16">
          <div className="container max-w-4xl">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <p className="section-label">History</p>
                <h2 className="section-title">How ASCA Began</h2>
                <p className="leading-relaxed text-brand-fg-secondary">
                  The Atlanta Saddle Club Association (ASCA) was formed on May 5, 2020 by a group of dedicated
                  horsemen who wanted to create a community in metro Atlanta that promotes positive horsemanship,
                  shares information related to handling and training horses, encourages and develops sportsmanship
                  among ASCA members and the local community, and introduces underserved communities to horses and
                  their transformative power.
                </p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <ManagedImage
                  src={historyImage.src}
                  alt={historyImage.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Current Officers */}
        <section className="py-16">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="section-label">Leadership</p>
              <h2 className="section-title">Current Officers</h2>
            </div>
            <OfficerList />
          </div>
        </section>

        {/* Join the Club */}
        <section className="bg-brand-forest py-16 text-white">
          <div className="container max-w-3xl text-center">
            <p className="section-label text-brand-accent">Join the Club</p>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Become a Member</h2>
            <p className="text-lg leading-relaxed text-amber-100">
              If you would like to become a member, please plan to attend one of our club meetings, or some of our
              activities and events, so that you can meet our members and learn more about ASCA. The club meets
              monthly at Piccadilly Cafeteria, 2449 Godby Road, College Park 30349, on the first Wednesday at 7pm.
            </p>
            <a
              href={MEMBERSHIP_APPLICATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent mt-8 inline-flex"
            >
              ASCA Membership Application
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
