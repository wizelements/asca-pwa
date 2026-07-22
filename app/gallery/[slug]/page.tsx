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
  searchParams?: Promise<{ photo?: string }>;
}

export async function generateMetadata({ params }: AlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumDetailBySlug(slug);
  return {
    title: album ? `${album.title} | ASCA Gallery` : 'Album | ASCA Gallery',
    description: album?.summary || 'ASCA gallery album',
  };
}

export default async function AlbumDetailPage({ params, searchParams }: AlbumDetailPageProps) {
  const { slug } = await params;
  const { photo } = await searchParams ?? {};
  const album = await getAlbumDetailBySlug(slug);

  if (!isPublicPreviewEnabled() || !album) {
    notFound();
  }

  const eligibility = isAlbumPubliclyEligible(album);
  if (!eligibility.eligible) {
    notFound();
  }
  const photoNumber = Number(photo);
  const initialPhotoIndex = Number.isInteger(photoNumber) && photoNumber >= 1 && photoNumber <= album.media.length ? photoNumber - 1 : null;

  return (
    <>
      <Header />
      <AlbumDetailClient
        album={album}
        initialPhotoIndex={initialPhotoIndex}
        breadcrumbs={<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Gallery', href: '/gallery' }, { label: album.title }]} />}
      />
      <Footer />
    </>
  );
}
