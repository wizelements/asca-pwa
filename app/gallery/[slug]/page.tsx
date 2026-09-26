import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAlbumDetailBySlug, isAlbumPubliclyEligible } from '@/lib/gallery/services/albums';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import { getSiteUrl } from '@/lib/site-url';
import AlbumDetailClient from './AlbumDetailClient';
import Breadcrumbs from '@/components/gallery/Breadcrumbs';

interface AlbumDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ photo?: string }>;
}

export async function generateMetadata({ params }: AlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumDetailBySlug(slug);
  if (!album || !isAlbumPubliclyEligible(album).eligible) {
    return {
      title: 'Album | ASCA Gallery',
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = siteUrl + '/gallery/' + album.slug;
  const description = album.summary || 'Photos from ' + album.title + ' with the Atlanta Saddle Club Association.';
  const socialImage = album.coverUrl
    ? new URL(album.coverUrl, siteUrl).toString()
    : siteUrl + '/images/asca/logo.png';

  return {
    title: album.title + ' | ASCA Gallery',
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: album.title + ' | ASCA Gallery',
      description,
      images: [{ url: socialImage, alt: album.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: album.title + ' | ASCA Gallery',
      description,
      images: [socialImage],
    },
  };
}

export default async function AlbumDetailPage({ params, searchParams }: AlbumDetailPageProps) {
  const { slug } = await params;
  const { photo } = await searchParams ?? {};
  const album = await getAlbumDetailBySlug(slug);

  if (!isPublicPreviewEnabled() || !album || !isAlbumPubliclyEligible(album).eligible) {
    notFound();
  }

  const photoNumber = Number(photo);
  const initialPhotoIndex =
    Number.isInteger(photoNumber) && photoNumber >= 1 && photoNumber <= album.media.length
      ? photoNumber - 1
      : null;

  const siteUrl = getSiteUrl();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: album.title,
    description: album.summary || undefined,
    url: siteUrl + '/gallery/' + album.slug,
    datePublished: album.activityDate?.toISOString(),
    contentLocation: album.location || undefined,
    image: album.media.map((item) => ({
      '@type': 'ImageObject',
      contentUrl: new URL(item.url, siteUrl).toString(),
      caption: item.caption || undefined,
      description: item.altText,
    })),
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <AlbumDetailClient
        album={album}
        initialPhotoIndex={initialPhotoIndex}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Gallery', href: '/gallery' },
              { label: album.title },
            ]}
          />
        }
      />
      <Footer />
    </>
  );
}
