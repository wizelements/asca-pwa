import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import GalleryCard from '@/components/Cards/GalleryCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  const galleryItems = [
    ...gallery.map((item: any) => ({
      key: `db-${item.id}`,
      title: item.title,
      image: item.image,
      alt: item.alt,
      description: item.description,
      category: item.category,
    })),
    ...staticGallery.map((photo) => ({
      key: `fallback-${photo.slot}`,
      title: photo.title || 'ASCA activity photo',
      image: photo.src,
      alt: photo.alt,
      description: photo.caption,
      category: 'ASCA Gallery',
    })),
  ];

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
            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryItems.map((item) => (
                <GalleryCard
                  key={item.key}
                  title={item.title}
                  image={item.image}
                  alt={item.alt}
                  description={item.description}
                  category={item.category}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
