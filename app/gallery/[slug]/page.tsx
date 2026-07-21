import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAlbumDetailBySlug } from '@/lib/gallery/services/albums';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';

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

  if (!isPublicPreviewEnabled() || !album || album.status !== 'published' || album.privacyReviewStatus === 'restricted' || album.privacyReviewStatus === 'pending') {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="bg-brand-bg-subtle min-h-screen py-16">
        <div className="container">
          <div className="mb-8">
            <p className="section-label">{album.category?.name || 'Gallery'}</p>
            <h1 className="section-title">{album.title}</h1>
            {album.location && <p className="text-brand-fg-muted">{album.location}</p>}
            {album.summary && <p className="mt-4 max-w-2xl text-brand-fg-secondary">{album.summary}</p>}
          </div>

          {album.media.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {album.media.map((item) => (
                <figure key={item.mediaAssetId} className="overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm">
                  <img src={item.url} alt={item.altText} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  {item.caption && <figcaption className="p-3 text-sm text-brand-fg-secondary">{item.caption}</figcaption>}
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-brand-fg-muted">No images in this album yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
