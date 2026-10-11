'use client';

import { useState, type ReactNode, type UIEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AccessibleImageViewer from '@/components/gallery/AccessibleImageViewer';
import { useViewerHistory } from '@/components/gallery/useViewerHistory';
import type { AlbumDetail } from '@/lib/gallery/services/albums';

interface Props {
  album: NonNullable<AlbumDetail>;
  breadcrumbs: ReactNode;
  initialPhotoIndex?: number | null;
}

export default function AlbumDetailClient({ album, breadcrumbs, initialPhotoIndex }: Props) {
  const [mobileIndex, setMobileIndex] = useState(0);
  const images = album.media.map((item) => ({
    url: item.url,
    altText: item.altText,
    caption: item.caption,
  }));
  const { viewerOpen, viewerIndex, openViewer, moveViewer, closeViewer } = useViewerHistory(
    images.length,
    initialPhotoIndex
  );
  const mosaic = images.length >= 5;

  return (
    <>
      <main className="quiet-luxe min-h-screen py-12 md:py-20">
        <div className="container">
          <div className="mb-8">
            {breadcrumbs}
            <Link
              href="/gallery"
              className="mb-6 inline-flex min-h-[44px] items-center text-sm font-semibold text-brand-forest hover:text-brand-forest-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
            >
              ← Back to Gallery
            </Link>

            <p className="section-label">{album.category?.name || 'Gallery'}</p>
            <h1 className="font-serif text-5xl font-semibold tracking-tight text-brand-fg-primary md:text-6xl">{album.title}</h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-base text-brand-fg-secondary">
              {album.activityDate && <span>{album.activityDate.toLocaleDateString()}</span>}
              {album.location && <span>{album.location}</span>}
              <span>{images.length} {images.length === 1 ? 'photo' : 'photos'}</span>
            </div>

            {album.summary && (
              <p className="mt-4 max-w-3xl text-base leading-7 text-brand-fg-secondary">
                {album.summary}
              </p>
            )}
          </div>

          {album.relatedEvent && (
            <aside className="editorial-card mb-8 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-forest">Related event</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-brand-fg-primary">{album.relatedEvent.title}</h2>
              <p className="mt-1 text-sm text-brand-fg-secondary">{album.relatedEvent.date.toLocaleDateString()}</p>
              <Link href="/where-to-find-us" className="mt-3 inline-flex text-sm font-semibold text-brand-forest hover:underline">
                View event calendar →
              </Link>
            </aside>
          )}

          {mosaic && (
            <section className="relative mb-10" aria-label="Featured photos">
              <div className="hidden h-[32rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl md:grid">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => openViewer(index)}
                    className={
                      'group relative overflow-hidden focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-inset ' +
                      (index === 0 ? 'col-span-2 row-span-2' : '')
                    }
                    aria-label={'Open photo: ' + image.altText + '. Photo ' + (index + 1) + ' of ' + images.length}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText}
                      fill
                      priority={index === 0}
                      sizes={index === 0 ? '(max-width: 768px) 100vw, 50vw' : '25vw'}
                      className="object-cover"
                    />
                    <span className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" />
                  </button>
                ))}
              </div>

              <div className="relative md:hidden">
                <div
                  className="flex snap-x snap-mandatory overflow-x-auto"
                  style={{ scrollbarWidth: 'none' }}
                  onScroll={(event: UIEvent<HTMLDivElement>) =>
                    setMobileIndex(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))
                  }
                >
                  {images.map((image, index) => (
                    <button
                      key={image.url}
                      type="button"
                      onClick={() => openViewer(index)}
                      className="relative aspect-[4/3] min-w-full snap-center"
                      aria-label={'Open photo: ' + image.altText + '. Photo ' + (index + 1) + ' of ' + images.length}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                  {mobileIndex + 1} / {images.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => openViewer(0)}
                className="absolute bottom-4 right-4 hidden min-h-[44px] items-center gap-2 rounded-lg border border-brand-border-subtle bg-white px-4 font-semibold text-brand-fg-primary shadow md:flex"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" />
                </svg>
                Show all photos
              </button>
            </section>
          )}

          {images.length > 0 ? (
            <section aria-labelledby="all-photos-heading">
              <h2 id="all-photos-heading" className="mb-6 font-serif text-3xl font-semibold text-brand-fg-primary">
                {mosaic ? 'All photos' : 'Photos'}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {album.media.map((item, index) => (
                  <figure
                    key={item.mediaAssetId}
                    className="media-luxe overflow-hidden bg-brand-bg-elevated"
                  >
                    <button
                      type="button"
                      className="group block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest"
                      onClick={() => openViewer(index)}
                      aria-label={'Open photo: ' + item.altText + '. Photo ' + (index + 1) + ' of ' + images.length}
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={item.url}
                          alt={item.altText}
                          width={600}
                          height={450}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                          loading={index < 3 ? 'eager' : 'lazy'}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </button>
                    {item.caption && (
                      <figcaption className="p-4 text-base leading-7 text-brand-fg-secondary">
                        {item.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          ) : (
            <p className="editorial-card p-6 text-base text-brand-fg-secondary">No images are available in this album yet.</p>
          )}

          <div className="mt-12 flex flex-wrap gap-4 border-t border-brand-border-subtle pt-8">
            <Link href="/gallery" className="btn-secondary">More albums</Link>
            <Link href="/where-to-find-us" className="btn-primary">Attend a meeting</Link>
            <Link href="/get-involved" className="btn-secondary">Get involved</Link>
            <Link href="/support-asca" className="btn-secondary">Support ASCA</Link>
          </div>
        </div>
      </main>

      <AccessibleImageViewer
        images={images}
        currentIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={closeViewer}
        onNext={() => moveViewer(Math.min(viewerIndex + 1, images.length - 1))}
        onPrev={() => moveViewer(Math.max(viewerIndex - 1, 0))}
      />
    </>
  );
}
