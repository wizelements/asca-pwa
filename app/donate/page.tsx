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
      <Header />
      <main>
        <Hero
          image={settings.heroes?.donate?.image || '/images/hero/donate.jpg'}
          title={settings.heroes?.donate?.title || 'Support ASCA'}
          subtitle={settings.heroes?.donate?.subtitle || 'Make a difference in our community'}
        />

        <section className="py-20">
          <div className="container max-w-4xl">
            <div className="text-center">
              <p className="section-label">Support</p>
              <h2 className="section-title">Why Your Support Matters</h2>
            </div>
            <div className="mt-10 card">
              <p className="text-brand-fg-secondary leading-relaxed">
                Funds that the club collects give us the opportunity to give back to the community. We value our local community and desire to
                be an asset for both the young and the young at heart.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-brand-fg-secondary">
                {[
                  'Maintain quality riding facilities and equipment',
                  'Provide scholarships for youth programs',
                  'Support community outreach initiatives',
                  'Host educational workshops and training sessions',
                ].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <div className="card">
                <h3 className="text-xl font-bold text-brand-fg-primary">Donate via Venmo</h3>
                <p className="mt-3 text-sm text-brand-fg-secondary">Username</p>
                <a
                  href={`https://venmo.com/${settings.venmo?.username || '@therealasca1'}`}
                  className="mt-4 inline-flex text-lg font-semibold text-brand-forest hover:text-brand-forest-muted"
                >
                  {settings.venmo?.username || '@therealasca1'}
                </a>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {(settings.venmo?.presets || [10, 25, 50, 100]).map((amount: number) => (
                    <a
                      key={amount}
                      href={`https://venmo.com/${settings.venmo?.username || '@therealasca1'}?amount=${amount}`}
                      className="btn-primary text-xs"
                    >
                      ${amount}
                    </a>
                  ))}
                </div>
              </div>

              {settings.cashApp && (
                <div className="card">
                  <h3 className="text-xl font-bold text-brand-fg-primary">Donate via CashApp</h3>
                  <p className="mt-4 text-lg font-semibold text-brand-fg-secondary">{settings.cashApp}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
