'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AccessibleImageViewer from '@/components/gallery/AccessibleImageViewer';
import type { HorseProfileDetail } from '@/lib/gallery/services/horses';

interface HorseDetailClientProps {
  horse: NonNullable<HorseProfileDetail>;
}

export default function HorseDetailClient({ horse }: HorseDetailClientProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const allImages = horse.primaryUrl
    ? [{ url: horse.primaryUrl, altText: horse.name, caption: null }, ...horse.media.map((m) => ({ url: m.url, altText: m.altText, caption: m.caption }))]
    : horse.media.map((m) => ({ url: m.url, altText: m.altText, caption: m.caption }));

  return (
    <>
      <main className="bg-brand-bg-subtle min-h-screen py-16">
        <div className="container">
          <div className="mb-8">
            <Link href="/horses" className="text-sm text-brand-forest hover:underline">← Back to Our Horses</Link>
            <p className="section-label mt-4">Meet the Horses</p>
            <h1 className="section-title">{horse.name}</h1>
            {horse.description && <p className="mt-4 max-w-2xl text-brand-fg-secondary">{horse.description}</p>}
          </div>

          {horse.primaryUrl && (
            <figure
              className="mb-8 cursor-pointer overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-md"
              onClick={() => { setViewerIndex(0); setViewerOpen(true); }}
              role="button"
              tabIndex={0}
              aria-label="Open primary image"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewerIndex(0); setViewerOpen(true); } }}
            >
              <Image
                src={horse.primaryUrl}
                alt={horse.name}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </figure>
          )}

          {horse.media.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {horse.media.map((item, idx) => {
                const figureIndex = horse.primaryUrl ? idx + 1 : idx;
                return (
                  <figure
                    key={item.mediaAssetId}
                    className="cursor-pointer overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-md"
                    onClick={() => { setViewerIndex(figureIndex); setViewerOpen(true); }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open image ${figureIndex + 1} of ${allImages.length}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewerIndex(figureIndex); setViewerOpen(true); } }}
                  >
                    <Image
                      src={item.url}
                      alt={item.altText}
                      width={600}
                      height={450}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {item.caption && <figcaption className="p-3 text-sm text-brand-fg-secondary">{item.caption}</figcaption>}
                  </figure>
                );
              })}
            </div>
          ) : (
            <p className="text-brand-fg-muted">No additional photos for this horse.</p>
          )}
        </div>
      </main>
      <AccessibleImageViewer
        images={allImages}
        currentIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onNext={() => setViewerIndex((i) => Math.min(i + 1, allImages.length - 1))}
        onPrev={() => setViewerIndex((i) => Math.max(i - 1, 0))}
      />
    </>
  );
}
