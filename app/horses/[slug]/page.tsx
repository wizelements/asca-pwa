import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getHorseDetailBySlug, isHorsePubliclyEligible } from '@/lib/gallery/services/horses';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import HorseDetailClient from './HorseDetailClient';
import Breadcrumbs from '@/components/gallery/Breadcrumbs';

interface HorseDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ photo?: string }>;
}

export async function generateMetadata({ params }: HorseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const horse = await getHorseDetailBySlug(slug);
  return {
    title: horse ? `${horse.name} | ASCA Horses` : 'Horse | ASCA',
    description: horse?.description || 'Meet an ASCA horse',
  };
}

export default async function HorseDetailPage({ params, searchParams }: HorseDetailPageProps) {
  const { slug } = await params;
  const { photo } = await searchParams ?? {};
  const horse = await getHorseDetailBySlug(slug);

  if (!isPublicPreviewEnabled() || !horse) {
    notFound();
  }

  const eligibility = isHorsePubliclyEligible(horse);
  if (!eligibility.eligible) {
    notFound();
  }
  const mediaCount = horse.media.length + (horse.primaryUrl ? 1 : 0);
  const photoNumber = Number(photo);
  const initialPhotoIndex = Number.isInteger(photoNumber) && photoNumber >= 1 && photoNumber <= mediaCount ? photoNumber - 1 : null;

  return (
    <>
      <Header />
      <HorseDetailClient
        horse={horse}
        initialPhotoIndex={initialPhotoIndex}
        breadcrumbs={<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Horses', href: '/horses' }, { label: horse.name }]} />}
      />
      <Footer />
    </>
  );
}
