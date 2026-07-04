import Link from 'next/link';
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

interface GalleryPageProps {
  searchParams?: Promise<{ category?: string }>;
}

function groupByCategory<T extends { category?: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const key = item.category || 'General';
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export default async function Gallery({ searchParams }: GalleryPageProps) {
  const params = await searchParams ?? {};
  const selectedCategory = params.category;

  const [images, gallery] = await Promise.all([
    getPublicManagedImages(),
    selectedCategory
      ? getGalleryImages(selectedCategory, true)
      : getGalleryImages(undefined, true),
  ]);
  const hero = getManagedImage(images, 'gallery.hero');
  const staticGallery = FALLBACK_GALLERY_SLOTS.map((slot) => getManagedImage(images, slot));

  // For filtered view: if DB empty, fall back to static images matching the category.
  const filteredStatic = selectedCategory
    ? staticGallery.filter((photo) =>
        photo.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        photo.title?.toLowerCase().includes(selectedCategory.toLowerCase())
      )
    : staticGallery;

  const displayGallery = gallery.length > 0 ? gallery : filteredStatic;

  // If a specific category was requested and nothing matches, show a clear empty state (no 404).
  const groupedGallery = selectedCategory
    ? { [selectedCategory]: displayGallery }
    : groupByCategory(displayGallery);

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
              <p className="section-label">{selectedCategory ? selectedCategory : 'Gallery'}</p>
              <h2 className="section-title">
                {selectedCategory ? `${selectedCategory} Photos` : 'Captured Moments'}
              </h2>
            </div>

            {Object.entries(groupedGallery).map(([category, items]) => (
              <div key={category} className="mt-12">
                {!selectedCategory && (
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-brand-fg-primary">{category}</h3>
                    <Link
                      href={`/gallery?category=${encodeURIComponent(category)}`}
                      className="text-sm font-semibold text-brand-forest hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                )}
                {items.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item: any) => (
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
                  <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-8 text-center text-brand-fg-muted">
                    No photos in this category yet. Visit the admin gallery to add some.
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
