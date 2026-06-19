import type { Metadata } from 'next';
import Image from 'next/image';
import Hero from '@/components/Hero';
import GalleryCard from '@/components/Cards/GalleryCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, getTheme, getGalleryImages } from '@/lib/db/queries';

export const metadata: Metadata = {
  title: { absolute: 'Photo Gallery | ASCA' },
  description: 'Photos from ASCA events, trail rides, and community activities. See our horses, riders, and members in action.',
};

const staticGallery = [
  { src: '/images/gallery/horse-closeup.jpg', alt: 'Horse close-up at ASCA', title: 'Our Horses' },
  { src: '/images/gallery/rider.jpg', alt: 'ASCA rider on horseback', title: 'Trail Rides' },
  { src: '/images/gallery/blog-member.jpg', alt: 'ASCA member activity', title: 'Community' },
  { src: '/images/gallery/activity.jpg', alt: 'ASCA trail ride activity', title: 'Activities' },
  { src: '/images/gallery/event.jpg', alt: 'ASCA community event', title: 'Events' },
  { src: '/images/members/member-1.jpg', alt: 'ASCA member', title: 'Members' },
];

export default async function Gallery() {
  const [settings, theme, gallery] = await Promise.all([
    getSettings(),
    getTheme(),
    getGalleryImages(),
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
          image={settings.heroes?.gallery?.image || '/images/gallery/horse-closeup.jpg'}
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
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((item: any) => (
                  <GalleryCard
                    key={item.id}
                    title={item.title}
                    image={item.image}
                    alt={item.alt}
                    description={item.description}
                    category={item.category}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {staticGallery.map((photo) => (
                  <div key={photo.src} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <p className="absolute bottom-4 left-4 text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {photo.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
