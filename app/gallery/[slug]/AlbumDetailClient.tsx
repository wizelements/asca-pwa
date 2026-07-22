'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AccessibleImageViewer from '@/components/gallery/AccessibleImageViewer';
import type { AlbumDetail } from '@/lib/gallery/services/albums';

interface AlbumDetailClientProps {
  album: NonNullable<AlbumDetail>;
}

export default function AlbumDetailClient({ album }: AlbumDetailClientProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const images = album.media.map((m) => ({ url: m.url, altText: m.altText, caption: m.caption }));

  return (
    <>
      <main className="bg-brand-bg-subtle min-h-screen py-16">
        <div className="container">
          <div className="mb-8">
            <Link href="/gallery" className="text-sm text-brand-forest hover:underline">← Back to Gallery</Link>
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
                  className="cursor-pointer overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-md"
                  onClick={() => { setViewerIndex(idx); setViewerOpen(true); }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open image ${idx + 1} of ${album.media.length}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewerIndex(idx); setViewerOpen(true); } }}
                >
                  <Image
                    src={item.url}
                    alt={item.altText}
                    width={600}
                    height={450}
                    className="aspect-[4/3] w-full object-cover"
                    loading={idx < 3 ? 'eager' : 'lazy'}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
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
