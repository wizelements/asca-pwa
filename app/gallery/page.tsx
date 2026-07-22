import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import GalleryCard from '@/components/Cards/GalleryCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { GalleryImage } from '@/lib/db/queries';
import { getCachedGalleryImages } from '@/lib/db/queries-cache';
import { getManagedImage, type SiteImageSlot } from '@/lib/media';
import { getPublicManagedImages } from '@/lib/public-content';
import { getPublicAlbums, countPublicAlbums, type AlbumRecord } from '@/lib/gallery/services/albums';
import { getPublicCategories, type ActivityCategoryRecord } from '@/lib/gallery/services/categories';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import Pagination from '@/components/gallery/Pagination';

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
  searchParams?: Promise<{ category?: string; page?: string }>;
}

function groupByCategory<T extends { category?: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((groups, item) => {
    const key = item.category || 'General';
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

function LegacyGallery({
  selectedCategory,
  images,
  gallery,
}: {
  selectedCategory?: string;
  images: Awaited<ReturnType<typeof getPublicManagedImages>>;
  gallery: GalleryImage[];
}) {
  const hero = getManagedImage(images, 'gallery.hero');
  const staticGallery = FALLBACK_GALLERY_SLOTS.map((slot) => getManagedImage(images, slot));

  const filteredStatic: GalleryImage[] = selectedCategory
    ? staticGallery
        .filter(
          (photo) =>
            photo.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            photo.title?.toLowerCase().includes(selectedCategory.toLowerCase())
        )
        .map((photo, index) => ({
          id: index,
          title: photo.title || photo.alt || 'Photo',
          description: photo.caption,
          category: photo.category || 'General',
          image: photo.src,
          alt: photo.alt,
          published: true,
        }))
    : staticGallery.map((photo, index) => ({
        id: index,
        title: photo.title || photo.alt || 'Photo',
        description: photo.caption,
        category: photo.category || 'General',
        image: photo.src,
        alt: photo.alt,
        published: true,
      }));

  const displayGallery: GalleryImage[] = gallery.length > 0 ? gallery : filteredStatic;
  const groupedGallery = selectedCategory
    ? { [selectedCategory]: displayGallery }
    : groupByCategory(displayGallery);

  return (
    <>
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
    </>
  );
}

function AlbumCard({ album }: { album: AlbumRecord }) {
  return (
    <Link
      href={`/gallery/${album.slug}`}
      className="group block overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-md"
    >
      {album.coverUrl ? (
        <Image
          src={album.coverUrl}
          alt={album.title}
          width={600}
          height={450}
          className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-brand-bg-subtle" />
      )}
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-forest">
          {album.category?.name || 'Gallery'}
        </p>
        <h3 className="mt-1 text-lg font-bold text-brand-fg-primary">{album.title}</h3>
        {album.summary && <p className="mt-1 line-clamp-2 text-sm text-brand-fg-secondary">{album.summary}</p>}
        {album.activityDate && (
          <p className="mt-1 text-xs text-brand-fg-muted">{album.activityDate.toLocaleDateString()}</p>
        )}
      </div>
    </Link>
  );
}

async function NewGallery({ selectedCategory, page }: { selectedCategory?: string; page: number }) {
  const pageSize = 12;
  const [images, albums, categories, total] = await Promise.all([
    getPublicManagedImages(),
    selectedCategory ? getPublicAlbums(selectedCategory, pageSize, (page - 1) * pageSize) : getPublicAlbums(undefined, pageSize, (page - 1) * pageSize),
    getPublicCategories(),
    selectedCategory ? countPublicAlbums(selectedCategory) : countPublicAlbums(),
  ]);
  const hero = getManagedImage(images, 'gallery.hero');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <Hero image={hero.src} imageAlt={hero.alt} title="Photo Gallery" subtitle="Albums from ASCA events and activities" />

      <section className="bg-brand-bg-subtle py-20">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <Link
              href="/gallery"
              className={`rounded-full px-4 py-2 text-sm font-medium ${!selectedCategory ? 'bg-brand-forest text-white' : 'bg-brand-bg-elevated text-brand-fg-primary'}`}
            >
              All
            </Link>
            {categories.map((cat: ActivityCategoryRecord) => (
              <Link
                key={cat.slug}
                href={`/gallery?category=${encodeURIComponent(cat.slug)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === cat.slug ? 'bg-brand-forest text-white' : 'bg-brand-bg-elevated text-brand-fg-primary'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {albums.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album: AlbumRecord) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-8 text-center text-brand-fg-muted">
              No albums yet.
            </div>
          )}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/gallery"
            query={selectedCategory ? { category: selectedCategory } : {}}
          />
        </div>
      </section>
    </>
  );
}

export default async function Gallery({ searchParams }: GalleryPageProps) {
  const params = await searchParams ?? {};
  const selectedCategory = params.category;
  const page = Math.max(1, Number(params.page || '1'));

  if (isPublicPreviewEnabled()) {
    return (
      <>
        <Header />
        <NewGallery selectedCategory={selectedCategory} page={page} />
        <Footer />
      </>
    );
  }

  const [images, gallery] = await Promise.all([
    getPublicManagedImages(),
    getCachedGalleryImages(selectedCategory),
  ]);

  return (
    <>
      <Header />
      <LegacyGallery selectedCategory={selectedCategory} images={images} gallery={gallery} />
      <Footer />
    </>
  );
}
