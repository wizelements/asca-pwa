import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getHorseDetailBySlug, isHorsePubliclyEligible } from '@/lib/gallery/services/horses';
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

  if (!isPublicPreviewEnabled() || !horse) {
    notFound();
  }

  const eligibility = isHorsePubliclyEligible(horse);
  if (!eligibility.eligible) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="bg-brand-bg-subtle min-h-screen py-16">
        <div className="container">
          <div className="mb-8">
            <Link href="/horses" className="text-sm text-brand-forest hover:underline">← Back to Our Horses</Link>
            <p className="section-label mt-4">Meet the Horses</p>
            <h1 className="section-title">{horse.name}</h1>
            {horse.description && <p className="mt-4 max-w-2xl text-brand-fg-secondary">{horse.description}</p>}
          </div>

          {horse.primaryUrl && (
            <figure className="mb-8 overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm">
              <Image
                src={horse.primaryUrl}
                alt={horse.name}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
                priority
                unoptimized
              />
            </figure>
          )}

          {horse.media.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {horse.media.map((item) => (
                <figure key={item.mediaAssetId} className="overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm">
                  <Image
                    src={item.url}
                    alt={item.altText}
                    width={600}
                    height={450}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                    unoptimized
                  />
                  {item.caption && <figcaption className="p-3 text-sm text-brand-fg-secondary">{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-brand-fg-muted">No additional photos for this horse.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
