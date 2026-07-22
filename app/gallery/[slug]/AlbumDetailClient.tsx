'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AccessibleImageViewer from '@/components/gallery/AccessibleImageViewer';
import type { AlbumDetail } from '@/lib/gallery/services/albums';

interface AlbumDetailClientProps {
  album: NonNullable<AlbumDetail>;
  breadcrumbs: ReactNode;
}

export default function AlbumDetailClient({ album, breadcrumbs }: AlbumDetailClientProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const images = album.media.map((m) => ({ url: m.url, altText: m.altText, caption: m.caption }));

  return (
    <>
      <main className="bg-brand-bg-subtle min-h-screen py-16">
        <div className="container">
          <div className="mb-8">
            {breadcrumbs}
            <p className="section-label mt-4">{album.category?.name || 'Gallery'}</p>
            <h1 className="section-title">{album.title}</h1>
            {album.location && <p className="text-brand-fg-muted">{album.location}</p>}
            {album.activityDate && <p className="text-brand-fg-muted">{album.activityDate.toLocaleDateString()}</p>}
            {album.summary && <p className="mt-4 max-w-2xl text-brand-fg-secondary">{album.summary}</p>}
          </div>

          {album.media.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {album.media.map((item, idx) => (
                <figure
                  key={item.mediaAssetId}
                  className="group cursor-pointer overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2 motion-reduce:transition-none"
                  onClick={() => { setViewerIndex(idx); setViewerOpen(true); }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open image ${idx + 1} of ${album.media.length}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewerIndex(idx); setViewerOpen(true); } }}
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={item.url}
                      alt={item.altText}
                      width={600}
                      height={450}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                      loading={idx < 3 ? 'eager' : 'lazy'}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                      <svg viewBox="0 0 24 24" className="h-10 w-10 rounded-full bg-white/90 p-2 text-brand-forest" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M11 8v6M8 11h6" /></svg>
                    </span>
                  </div>
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
      <AccessibleImageViewer
        images={images}
        currentIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        onNext={() => setViewerIndex((i) => Math.min(i + 1, images.length - 1))}
        onPrev={() => setViewerIndex((i) => Math.max(i - 1, 0))}
      />
    </>
  );
}
