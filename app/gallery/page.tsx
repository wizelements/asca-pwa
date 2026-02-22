import Hero from '@/components/Hero';
import GalleryCard from '@/components/Cards/GalleryCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme, getGallery } from '@/lib/db/queries';

export default async function Gallery() {
  const [settings, theme, gallery] = await Promise.all([
    getSettings(),
    getTheme(),
    getGallery(),
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
          image={settings.heroes?.gallery?.image || '/images/hero/members.jpg'}
          title={settings.heroes?.gallery?.title || 'Photo Gallery'}
          subtitle={settings.heroes?.gallery?.subtitle || 'Moments from ASCA events and activities'}
        />

        <section className="bg-brand-bg-subtle py-20">
          <div className="container">
            <div className="text-center">
              <p className="section-label">Gallery</p>
              <h2 className="section-title">Captured Moments</h2>
            </div>
            {gallery.length > 0 ? (
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {gallery.map((item: any) => (
                  <GalleryCard
                    key={item._id?.toString() || Math.random()}
                    title={item.title}
                    image={item.image}
                    description={item.description}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-brand-fg-secondary">Gallery photos coming soon.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
