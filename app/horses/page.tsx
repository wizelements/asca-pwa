import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import { getPublicHorses } from '@/lib/gallery/services/horses';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Our Horses | ASCA',
  description: 'Meet the horses of the Atlanta Saddle Club Association.',
};

export default async function HorsesPage() {
  if (!isPublicPreviewEnabled()) {
    notFound();
  }

  const horses = await getPublicHorses();

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
            {horses.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {horses.map((horse) => (
                  <a
                    key={horse.id}
                    href={`/horses/${horse.slug}`}
                    className="group block overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-md"
                  >
                    {horse.primaryUrl ? (
                      <img
                        src={horse.primaryUrl}
                        alt={horse.name}
                        className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full bg-brand-bg-subtle" />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-brand-fg-primary">{horse.name}</h3>
                      {horse.description && <p className="mt-1 line-clamp-2 text-sm text-brand-fg-secondary">{horse.description}</p>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-8 text-center text-brand-fg-muted">
                No horse profiles published yet.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
