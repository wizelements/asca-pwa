import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
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
import Breadcrumbs from '@/components/gallery/Breadcrumbs';
import PublicEmptyState from '@/components/gallery/PublicEmptyState';
import { getCachedSiteContent, siteText, type SiteContentValues } from '@/lib/site-content';

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
  copy,
}: {
  selectedCategory?: string;
  images: Awaited<ReturnType<typeof getPublicManagedImages>>;
  gallery: GalleryImage[];
  copy: SiteContentValues;
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
        title={siteText(copy, 'gallery.hero.title')}
        subtitle={siteText(copy, 'gallery.hero.subtitle')}
      />

      <section className="quiet-luxe py-24 md:py-28">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]} />
          <div className="text-center">
            <p className="section-label">{selectedCategory ? selectedCategory : 'Gallery'}</p>
            <h2 className="font-serif text-4xl font-medium tracking-tight text-brand-fg-primary md:text-5xl">
              {selectedCategory ? `${selectedCategory} Photos` : 'Captured Moments'}
            </h2>
          </div>

          {Object.entries(groupedGallery).map(([category, items]) => (
            <div key={category} className="mt-12">
              {!selectedCategory && (
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-serif text-3xl font-medium text-brand-fg-primary">{category}</h3>
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
                <PublicEmptyState
                  title="No photos here yet"
                  description="More moments from the ASCA community will be added soon."
                  action={{ label: 'Back to home', href: '/' }}
                />
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
      className="media-luxe group block overflow-hidden bg-brand-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden">
      {album.coverUrl ? (
        <Image
          src={album.coverUrl}
          alt={album.title}
          width={600}
          height={450}
          className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-brand-bg-subtle" />
      )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f14]/28 via-transparent to-transparent" aria-hidden="true" />
        <span aria-hidden="true" className="absolute bottom-3 right-3 rounded-full border border-white/15 bg-[#0d1f14]/72 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">{album.mediaCount} photos</span>
        <span className="sr-only">{album.mediaCount} photos</span>
      </div>
      <div className="border-t border-brand-forest/10 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-forest">
          {album.category?.name || 'Gallery'}
        </p>
        <h3 className="mt-2 font-serif text-2xl font-medium text-brand-fg-primary">{album.title}</h3>
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
  const [images, categories, total, copy] = await Promise.all([
    getPublicManagedImages(),
    getPublicCategories(),
    selectedCategory ? countPublicAlbums(selectedCategory) : countPublicAlbums(),
    getCachedSiteContent(),
  ]);

  if (selectedCategory && !categories.some((category) => category.slug === selectedCategory)) {
    notFound();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const albums = await getPublicAlbums(
    selectedCategory,
    pageSize,
    (safePage - 1) * pageSize
  );
  const hero = getManagedImage(images, 'gallery.hero');

  return (
    <>
      <Hero image={hero.src} imageAlt={hero.alt} title={siteText(copy, 'gallery.hero.title')} subtitle={siteText(copy, 'gallery.hero.subtitle')} />

      <section className="quiet-luxe py-24 md:py-28">
        <div className="container">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gallery' }]} />
          <div className="mb-8 flex snap-x items-center gap-2 overflow-x-auto py-2 md:flex-wrap md:gap-3">
            <Link
              href="/gallery"
              aria-current={!selectedCategory ? 'true' : undefined}
              className={`flex min-h-[44px] shrink-0 snap-start items-center whitespace-nowrap rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${!selectedCategory ? 'border-brand-forest bg-brand-forest text-white' : 'border-brand-forest/10 bg-white text-brand-fg-primary hover:border-brand-forest/30'}`}
            >
              All
            </Link>
            {categories.map((cat: ActivityCategoryRecord) => (
              <Link
                key={cat.slug}
                href={`/gallery?category=${encodeURIComponent(cat.slug)}`}
                aria-current={selectedCategory === cat.slug ? 'true' : undefined}
                className={`flex min-h-[44px] shrink-0 snap-start items-center whitespace-nowrap rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${selectedCategory === cat.slug ? 'border-brand-forest bg-brand-forest text-white' : 'border-brand-forest/10 bg-white text-brand-fg-primary hover:border-brand-forest/30'}`}
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
            <PublicEmptyState
              title={siteText(copy, 'gallery.empty.title')}
              description={siteText(copy, 'gallery.empty.body')}
              action={{ label: 'Back to home', href: '/' }}
            />
          )}
          <Pagination
            currentPage={safePage}
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
  const requestedPage = Number(params.page || '1');
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  if (isPublicPreviewEnabled()) {
    return (
      <>
        <Header />
        <NewGallery selectedCategory={selectedCategory} page={page} />
        <Footer />
      </>
    );
  }

  const [images, gallery, copy] = await Promise.all([
    getPublicManagedImages(),
    getCachedGalleryImages(selectedCategory),
    getCachedSiteContent(),
  ]);

  return (
    <>
      <Header />
      <LegacyGallery selectedCategory={selectedCategory} images={images} gallery={gallery} copy={copy} />
      <Footer />
    </>
  );
}
