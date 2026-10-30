import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Pagination from '@/components/gallery/Pagination';
import { countPublicHorses, getPublicHorses } from '@/lib/gallery/services/horses';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import Breadcrumbs from '@/components/gallery/Breadcrumbs';
import PublicEmptyState from '@/components/gallery/PublicEmptyState';
import { getCachedSiteContent, siteText } from '@/lib/site-content';
import { getPublicManagedImages } from '@/lib/public-content';
import { getManagedImage } from '@/lib/media';

interface HorsesPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: 'Our Horses | ASCA',
  description: 'Meet the horses of the Atlanta Saddle Club Association.',
};

export default async function HorsesPage({ searchParams }: HorsesPageProps) {
  if (!isPublicPreviewEnabled()) {
    // The primary navigation links to Our Horses even while the new gallery
    // system is being rolled out. Never send visitors to a broken 404 here,
    // and never expose draft or restricted horse profiles as a fallback.
    return (
      <>
        <Header />
        <main>
          <section className="bg-brand-bg-subtle py-20">
            <div className="container max-w-3xl">
              <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Horses' }]} />
              <h1 className="mt-8 font-display text-4xl font-bold text-brand-fg-primary">Our Horses</h1>
              <p className="mt-5 text-lg text-brand-fg-secondary">
                Individual horse profiles are not available on the website right now. We look forward to introducing more of the horses in our club.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/gallery" className="inline-flex min-h-11 items-center rounded-full bg-brand-forest px-6 py-3 font-semibold text-white transition hover:bg-brand-forest-muted">See club photos</Link>
                <Link href="/get-involved" className="inline-flex min-h-11 items-center rounded-full border border-brand-border-subtle bg-brand-bg-elevated px-6 py-3 font-semibold text-brand-fg-primary transition hover:bg-brand-bg-soft">Get involved with ASCA</Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const params = await searchParams ?? {};
  const page = Math.max(1, Number(params.page || '1'));
  const pageSize = 12;

  const [horses, total, copy, siteImages] = await Promise.all([
    getPublicHorses(pageSize, (page - 1) * pageSize),
    countPublicHorses(),
    getCachedSiteContent(),
    getPublicManagedImages(),
  ]);
  const heroImage = getManagedImage(siteImages, 'gallery.hero');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <Header />
      <main>
        <Hero
          image={heroImage.src}
          imageAlt={heroImage.alt}
          title={siteText(copy, 'horses.hero.title')}
          subtitle={siteText(copy, 'horses.hero.subtitle')}
        />
        <section className="bg-brand-bg-subtle py-20">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Horses' }]} />
            {horses.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {horses.map((horse) => (
                  <Link
                    key={horse.id}
                    href={`/horses/${horse.slug}`}
                    className="group block overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2 motion-reduce:transition-none"
                  >
                    {horse.primaryUrl ? (
                      <Image
                        src={horse.primaryUrl}
                        alt={horse.name}
                        width={600}
                        height={450}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-brand-bg-subtle" />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-brand-fg-primary">{horse.name}</h3>
                      {horse.description && <p className="mt-1 line-clamp-2 text-sm text-brand-fg-secondary">{horse.description}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <PublicEmptyState
                title={siteText(copy, 'horses.empty.title')}
                description={siteText(copy, 'horses.empty.body')}
                action={{ label: 'Back to home', href: '/' }}
              />
            )}
            <Pagination currentPage={page} totalPages={totalPages} baseUrl="/horses" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
