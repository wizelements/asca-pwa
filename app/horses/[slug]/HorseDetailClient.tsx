'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import AccessibleImageViewer from '@/components/gallery/AccessibleImageViewer';
import type { HorseProfileDetail } from '@/lib/gallery/services/horses';

interface HorseDetailClientProps {
  horse: NonNullable<HorseProfileDetail>;
  breadcrumbs: ReactNode;
}

export default function HorseDetailClient({ horse, breadcrumbs }: HorseDetailClientProps) {
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
            {breadcrumbs}
            <p className="section-label mt-4">Meet the Horses</p>
            <h1 className="section-title">{horse.name}</h1>
            {horse.description && <p className="mt-4 max-w-2xl text-brand-fg-secondary">{horse.description}</p>}
          </div>

          {horse.primaryUrl && (
            <figure
              className="group mb-8 cursor-pointer overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2 motion-reduce:transition-none"
              onClick={() => { setViewerIndex(0); setViewerOpen(true); }}
              role="button"
              tabIndex={0}
              aria-label="Open primary image"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewerIndex(0); setViewerOpen(true); } }}
            >
              <div className="relative overflow-hidden">
              <Image
                src={horse.primaryUrl}
                alt={horse.name}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
              />
                <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                  <svg viewBox="0 0 24 24" className="h-10 w-10 rounded-full bg-white/90 p-2 text-brand-forest" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M11 8v6M8 11h6" /></svg>
                </span>
              </div>
            </figure>
          )}

          {horse.media.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {horse.media.map((item, idx) => {
                const figureIndex = horse.primaryUrl ? idx + 1 : idx;
                return (
                  <figure
                    key={item.mediaAssetId}
                    className="group cursor-pointer overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2 motion-reduce:transition-none"
                    onClick={() => { setViewerIndex(figureIndex); setViewerOpen(true); }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open image ${figureIndex + 1} of ${allImages.length}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewerIndex(figureIndex); setViewerOpen(true); } }}
                  >
                    <div className="relative overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.altText}
                      width={600}
                      height={450}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                        <svg viewBox="0 0 24 24" className="h-10 w-10 rounded-full bg-white/90 p-2 text-brand-forest" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M11 8v6M8 11h6" /></svg>
                      </span>
                    </div>
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
