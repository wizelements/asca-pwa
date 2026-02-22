import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme } from '@/lib/db/queries';

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
          title={settings.heroes?.about?.title || 'Our Story'}
          subtitle={settings.heroes?.about?.subtitle || 'A legacy of equestrian excellence'}
        />

        <section className="py-20">
          <div className="container">
            <div className="grid gap-12 md:grid-cols-2">
              <div className="card">
                <p className="section-label">What We Do</p>
                <h2 className="section-title">A Community Built Around Horses</h2>
                <p className="text-brand-fg-secondary leading-relaxed">
                  ASCA sponsors and promotes trail rides, horseback riding lessons, camp outs, and community activities. Our mission is to
                  celebrate the bond between riders and horses while promoting personal growth and service.
                </p>
              </div>

              <div className="card">
                <p className="section-label">Our Mission</p>
                <h2 className="section-title">Purpose-Driven Horsemanship</h2>
                <p className="text-brand-fg-secondary leading-relaxed">
                  The purpose of ASCA is to promote horsemanship, share knowledge around handling and training horses, and encourage
                  sportsmanship among members and the local community.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-brand-bg-subtle py-20">
          <div className="container">
            <p className="section-label text-center">Our Values</p>
            <h2 className="section-title text-center">The Heart of ASCA</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Community',
                  description: 'Building connections and supporting local initiatives.',
                  accent: 'Together we rise',
                },
                {
                  title: 'Excellence',
                  description: 'Promoting quality horsemanship and education.',
                  accent: 'Ride with skill',
                },
                {
                  title: 'Growth',
                  description: 'Personal development through equestrian activities.',
                  accent: 'Always evolving',
                },
              ].map((value) => (
                <div key={value.title} className="card text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-forest">{value.accent}</p>
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
