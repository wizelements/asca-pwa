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
import { getCachedSiteContent, siteText } from '@/lib/site-content';

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

  const [horses, total, copy] = await Promise.all([
    getPublicHorses(pageSize, (page - 1) * pageSize),
    countPublicHorses(),
    getCachedSiteContent(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <Header />
      <main>
        <Hero
          image="/api/media/site/gallery.hero"
          imageAlt="ASCA horses"
          title={siteText(copy, 'horses.hero.title')}
          subtitle={siteText(copy, 'horses.hero.subtitle')}
        />
        <section className="quiet-luxe py-24 md:py-28">
          <div className="container">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Horses' }]} />
            {horses.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {horses.map((horse) => (
                  <Link
                    key={horse.id}
                    href={`/horses/${horse.slug}`}
                    className="media-luxe group block overflow-hidden bg-brand-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2"
                  >
                    {horse.primaryUrl ? (
                      <Image
                        src={horse.primaryUrl}
                        alt={horse.name}
                        width={600}
                        height={450}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none"
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-brand-bg-subtle" />
                    )}
                    <div className="border-t border-brand-forest/10 p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-forest">ASCA Horse</p>
                      <h3 className="mt-2 font-serif text-2xl font-medium text-brand-fg-primary">{horse.name}</h3>
                      {horse.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-brand-fg-secondary">{horse.description}</p>}
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
