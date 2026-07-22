import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAlbumDetailBySlug, isAlbumPubliclyEligible } from '@/lib/gallery/services/albums';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import AlbumDetailClient from './AlbumDetailClient';
import Breadcrumbs from '@/components/gallery/Breadcrumbs';

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
      <AlbumDetailClient
        album={album}
        breadcrumbs={<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gallery', href: '/gallery' }, { label: album.title }]} />}
      />
      <Footer />
    </>
  );
}
