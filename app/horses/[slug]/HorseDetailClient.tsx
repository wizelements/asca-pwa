'use client';

import { useState } from 'react';
import type { ReactNode, UIEvent } from 'react';
import Image from 'next/image';
import AccessibleImageViewer from '@/components/gallery/AccessibleImageViewer';
import { useViewerHistory } from '@/components/gallery/useViewerHistory';
import type { HorseProfileDetail } from '@/lib/gallery/services/horses';

interface HorseDetailClientProps {
  horse: NonNullable<HorseProfileDetail>;
  breadcrumbs: ReactNode;
  initialPhotoIndex?: number | null;
}

export default function HorseDetailClient({ horse, breadcrumbs, initialPhotoIndex }: HorseDetailClientProps) {
  const [mobileIndex, setMobileIndex] = useState(0);

  const allImages = horse.primaryUrl
    ? [{ url: horse.primaryUrl, altText: horse.name, caption: null }, ...horse.media.map((m) => ({ url: m.url, altText: m.altText, caption: m.caption }))]
    : horse.media.map((m) => ({ url: m.url, altText: m.altText, caption: m.caption }));

  const { viewerOpen, viewerIndex, openViewer, moveViewer, closeViewer } = useViewerHistory(allImages.length, initialPhotoIndex);
  const mosaic = allImages.length >= 5;

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

          {mosaic && <section className="relative mb-10" aria-label="Featured photos">
            <div className="hidden h-[32rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl md:grid">{allImages.slice(0, 5).map((image, idx) => <button key={`${image.url}-${idx}`} onClick={() => openViewer(idx)} className={`group relative overflow-hidden focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-inset ${idx === 0 ? 'col-span-2 row-span-2' : ''}`} aria-label={`Open photo ${idx + 1} of ${allImages.length}`}><Image src={image.url} alt={image.altText} fill priority={idx === 0} sizes={idx === 0 ? '(max-width: 768px) 100vw, 50vw' : '25vw'} className="object-cover" /><span className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" /></button>)}</div>
            <div className="relative md:hidden"><div className="flex snap-x snap-mandatory overflow-x-auto" style={{ scrollbarWidth: 'none' }} onScroll={(e: UIEvent<HTMLDivElement>) => setMobileIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>{allImages.map((image, idx) => <button key={`${image.url}-${idx}`} onClick={() => openViewer(idx)} className="relative aspect-[4/3] min-w-full snap-center"><Image src={image.url} alt={image.altText} fill priority={idx === 0} sizes="100vw" className="object-cover" /></button>)}</div><span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white">{mobileIndex + 1} / {allImages.length}</span></div>
            <button onClick={() => openViewer(0)} className="absolute bottom-4 right-4 hidden min-h-[44px] items-center gap-2 rounded-lg border border-brand-border-subtle bg-white px-4 font-semibold text-brand-fg-primary shadow md:flex"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" /></svg>Show all photos</button>
          </section>}
          {mosaic && <h2 className="mb-6 text-2xl font-bold text-brand-fg-primary">All photos</h2>}

          {horse.primaryUrl && (
            <figure
              className="group mb-8 cursor-pointer overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2 motion-reduce:transition-none"
              onClick={() => openViewer(0)}
              role="button"
              tabIndex={0}
              aria-label="Open primary image"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(0); } }}
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
                    onClick={() => openViewer(figureIndex)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open image ${figureIndex + 1} of ${allImages.length}`}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(figureIndex); } }}
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
        onClose={closeViewer}
        onNext={() => moveViewer(Math.min(viewerIndex + 1, allImages.length - 1))}
        onPrev={() => moveViewer(Math.max(viewerIndex - 1, 0))}
      />
    </>
  );
}
