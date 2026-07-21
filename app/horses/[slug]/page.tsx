import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getHorseDetailBySlug } from '@/lib/gallery/services/horses';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';

interface HorseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: HorseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const horse = await getHorseDetailBySlug(slug);
  return {
    title: horse ? `${horse.name} | ASCA Horses` : 'Horse | ASCA',
    description: horse?.description || 'Meet an ASCA horse',
  };
}

export default async function HorseDetailPage({ params }: HorseDetailPageProps) {
  const { slug } = await params;
  const horse = await getHorseDetailBySlug(slug);

  if (!isPublicPreviewEnabled() || !horse || horse.status !== 'published') {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="bg-brand-bg-subtle min-h-screen py-16">
        <div className="container">
          <div className="mb-8">
            <p className="section-label">Meet the Horses</p>
            <h1 className="section-title">{horse.name}</h1>
            {horse.description && <p className="mt-4 max-w-2xl text-brand-fg-secondary">{horse.description}</p>}
          </div>

          {horse.media.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {horse.media.map((item) => (
                <figure key={item.mediaAssetId} className="overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm">
                  <img src={item.url} alt={item.altText} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  {item.caption && <figcaption className="p-3 text-sm text-brand-fg-secondary">{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-brand-fg-muted">No photos for this horse yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
