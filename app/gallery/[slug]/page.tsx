import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAlbumDetailBySlug } from '@/lib/gallery/services/albums';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import { isAlbumPubliclyEligible } from '@/lib/gallery/services/albums';

interface AlbumDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumDetailBySlug(slug);
  return {
    title: album ? `${album.title} | ASCA Gallery` : 'Album | ASCA Gallery',
    description: album?.summary || 'ASCA gallery album',
  };
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { slug } = await params;
  const album = await getAlbumDetailBySlug(slug);

  if (!isPublicPreviewEnabled() || !album) {
    notFound();
  }

  const eligibility = isAlbumPubliclyEligible(album);
  if (!eligibility.eligible) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="bg-brand-bg-subtle min-h-screen py-16">
        <div className="container">
          <div className="mb-8">
            <Link href="/gallery" className="text-sm text-brand-forest hover:underline">← Back to Gallery</Link>
            <p className="section-label mt-4">{album.category?.name || 'Gallery'}</p>
            <h1 className="section-title">{album.title}</h1>
            {album.location && <p className="text-brand-fg-muted">{album.location}</p>}
            {album.activityDate && <p className="text-brand-fg-muted">{album.activityDate.toLocaleDateString()}</p>}
            {album.summary && <p className="mt-4 max-w-2xl text-brand-fg-secondary">{album.summary}</p>}
            {album.relatedEvent && (
              <Link href={`/where-to-find-us`} className="mt-4 inline-block text-brand-forest hover:underline">
                Related: {album.relatedEvent.title}
              </Link>
            )}
          </div>

          {album.media.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {album.media.map((item) => (
                <figure key={item.mediaAssetId} className="overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm"
                >
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
            <p className="text-brand-fg-muted">No images in this album yet.</p>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <Link href="/where-to-find-us" className="btn-primary">Attend a meeting</Link>
            <Link href="/support-asca" className="btn-secondary">Support ASCA</Link>
            <Link href="/get-involved" className="btn-secondary">Join ASCA</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
