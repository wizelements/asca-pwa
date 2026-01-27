import Hero from '@/components/Hero';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme } from '@/lib/db/queries';

export default async function Donate() {
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
      <Header settings={settings} />
      <main>
        <Hero
          image={settings.heroes?.donate?.image || '/images/hero/donate.jpg'}
          title={settings.heroes?.donate?.title || 'Support ASCA'}
          subtitle={settings.heroes?.donate?.subtitle || 'Make a difference in our community'}
        />

        <section className="py-20 bg-white">
          <div className="container max-w-2xl">
            <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-primary)' }}>
              Why Your Support Matters
            </h2>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              Funds that the club collects give us the opportunity to give back to the community. We value our local community and desire to be an asset for both the young and the young at heart.
            </p>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              Your donation helps us:
            </p>
            <ul className="space-y-3 mb-12">
              {[
                'Maintain quality riding facilities and equipment',
                'Provide scholarships for youth programs',
                'Support community outreach initiatives',
                'Host educational workshops and training sessions',
              ].map((item) => (
                <li key={item} className="flex items-start">
                  <span className="mr-3" style={{ color: 'var(--color-accent)' }}>✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-gray-50 p-8 rounded-lg mb-8">
              <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--color-primary)' }}>
                Donate via Venmo
              </h3>
              <div className="text-center mb-6">
                <p className="text-gray-700 mb-4">Username:</p>
                <a
                  href={`https://venmo.com/${settings.venmo?.username || '@therealasca1'}`}
                  className="text-xl font-bold hover:opacity-75"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {settings.venmo?.username || '@therealasca1'}
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(settings.venmo?.presets || [10, 25, 50, 100]).map((amount: number) => (
                  <a
                    key={amount}
                    href={`https://venmo.com/${settings.venmo?.username || '@therealasca1'}?amount=${amount}`}
                    className="py-3 px-4 text-center font-bold rounded text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    ${amount}
                  </a>
                ))}
              </div>
            </div>

            {settings.cashApp && (
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--color-primary)' }}>
                  Donate via CashApp
                </h3>
                <p className="text-gray-700 text-center text-lg">
                  {settings.cashApp}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
