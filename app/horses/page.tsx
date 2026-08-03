import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Pagination from '@/components/gallery/Pagination';
import { countPublicHorses, getPublicHorses } from '@/lib/gallery/services/horses';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/gallery/Breadcrumbs';
import PublicEmptyState from '@/components/gallery/PublicEmptyState';

interface HorsesPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
  title: 'Our Horses | ASCA',
  description: 'Meet the horses of the Atlanta Saddle Club Association.',
};

export default async function HorsesPage({ searchParams }: HorsesPageProps) {
  if (!isPublicPreviewEnabled()) {
    notFound();
  }

  const params = await searchParams ?? {};
  const page = Math.max(1, Number(params.page || '1'));
  const pageSize = 12;

  const [horses, total] = await Promise.all([
    getPublicHorses(pageSize, (page - 1) * pageSize),
    countPublicHorses(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <Header />
      <main>
        <Hero
          image="/api/media/site/gallery.hero"
          imageAlt="ASCA horses"
          title="Our Horses"
          subtitle="Meet the heart of ASCA"
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
                title="No horse profiles yet"
                description="Check back soon to meet the horses at the heart of ASCA."
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
