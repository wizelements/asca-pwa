import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import GalleryCard from '@/components/Cards/GalleryCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ManagedImage from '@/components/media/ManagedImage';
import { getGalleryImages } from '@/lib/db/queries';
import { getManagedImage, type SiteImageSlot } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';

export const metadata: Metadata = {
  title: { absolute: 'Photo Gallery | ASCA' },
  description: 'Photos from ASCA events, trail rides, and community activities. See our horses, riders, and members in action.',
};

const FALLBACK_GALLERY_SLOTS: SiteImageSlot[] = [
  'gallery.fallback.1',
  'gallery.fallback.2',
  'gallery.fallback.3',
  'gallery.fallback.4',
  'gallery.fallback.5',
  'gallery.fallback.6',
];

export default async function Gallery() {
  const [images, gallery] = await Promise.all([
    getPublicManagedImages(),
    getGalleryImages(undefined, true),
  ]);
  const hero = getManagedImage(images, 'gallery.hero');
  const staticGallery = FALLBACK_GALLERY_SLOTS.map((slot) => getManagedImage(images, slot));

  return (
    <>
      <Header />
      <main>
        <Hero
          image={hero.src}
          imageAlt={hero.alt}
          title="Photo Gallery"
          subtitle="Moments from ASCA events and activities"
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
                  <div key={photo.slot} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
                    <ManagedImage
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
