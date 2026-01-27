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

        <section className="py-20 container">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                What We Do
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                ASCA sponsors and promotes horse trail rides, horseback riding lessons, camp outs and other activities of various kinds. Our mission is to foster a community that celebrates the bond between riders and horses while promoting personal growth and community service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Through working closely with the horse, our members build a gradual sense of acceptance and feeling 'liked.' This enhances a person's positive self-concept and identity. The bonding with the horse is key.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                Our Mission
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                The purpose of ASCA is to promote a knowledge of horsemanship, to disseminate any general information relating to handling and training horses, and to encourage and develop sportsmanship among members and the local community.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Funds that the club collects give us the opportunity to give back to the community. We value our local community and desire to be an asset for both the young and the young at heart.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container">
            <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: 'var(--color-primary)' }}>
              Our Values
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Community',
                  description: 'Building connections and supporting local initiatives',
                  icon: '🤝',
                },
                {
                  title: 'Excellence',
                  description: 'Promoting quality horsemanship and education',
                  icon: '⭐',
                },
                {
                  title: 'Growth',
                  description: 'Personal development through equestrian activities',
                  icon: '📈',
                },
              ].map((value) => (
                <div key={value.title} className="bg-white p-8 rounded-lg shadow">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
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
