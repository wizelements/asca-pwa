import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getHorseDetailBySlug, isHorsePubliclyEligible } from '@/lib/gallery/services/horses';
import { isPublicPreviewEnabled } from '@/lib/gallery/feature-state';
import HorseDetailClient from './HorseDetailClient';

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
      <HorseDetailClient horse={horse} />
      <Footer />
    </>
  );
}
