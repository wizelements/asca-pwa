'use client';

import { useState, type ReactNode, type UIEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AccessibleImageViewer from '@/components/gallery/AccessibleImageViewer';
import { useViewerHistory } from '@/components/gallery/useViewerHistory';
import type { AlbumDetail } from '@/lib/gallery/services/albums';

interface Props { album: NonNullable<AlbumDetail>; breadcrumbs: ReactNode; initialPhotoIndex?: number | null }

export default function AlbumDetailClient({ album, breadcrumbs, initialPhotoIndex }: Props) {
  const [mobileIndex, setMobileIndex] = useState(0);
  const images = album.media.map((m) => ({ url: m.url, altText: m.altText, caption: m.caption }));
  const { viewerOpen, viewerIndex, openViewer, moveViewer, closeViewer } = useViewerHistory(images.length, initialPhotoIndex);
  const mosaic = images.length >= 5;
  const gridIcon = <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z" /></svg>;
  return <><main className="bg-brand-bg-subtle min-h-screen py-16"><div className="container">
    <div className="mb-8">{breadcrumbs}<p className="section-label mt-4">{album.category?.name || 'Gallery'}</p><h1 className="section-title">{album.title}</h1>{album.location && <p className="text-brand-fg-muted">{album.location}</p>}{album.activityDate && <p className="text-brand-fg-muted">{album.activityDate.toLocaleDateString()}</p>}{album.summary && <p className="mt-4 max-w-2xl text-brand-fg-secondary">{album.summary}</p>}</div>
    {mosaic && <section className="relative mb-10" aria-label="Featured photos">
      <div className="hidden h-[32rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl md:grid">{images.slice(0, 5).map((image, idx) => <button key={image.url} onClick={() => openViewer(idx)} className={`group relative overflow-hidden focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-inset ${idx === 0 ? 'col-span-2 row-span-2' : ''}`} aria-label={`Open photo ${idx + 1} of ${images.length}`}><Image src={image.url} alt={image.altText} fill priority={idx === 0} sizes={idx === 0 ? '(max-width: 768px) 100vw, 50vw' : '25vw'} className="object-cover" /><span className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none" /></button>)}</div>
      <div className="relative md:hidden"><div className="flex snap-x snap-mandatory overflow-x-auto" style={{ scrollbarWidth: 'none' }} onScroll={(e: UIEvent<HTMLDivElement>) => setMobileIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>{images.map((image, idx) => <button key={image.url} onClick={() => openViewer(idx)} className="relative aspect-[4/3] min-w-full snap-center"><Image src={image.url} alt={image.altText} fill priority={idx === 0} sizes="100vw" className="object-cover" /></button>)}</div><span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white">{mobileIndex + 1} / {images.length}</span></div>
      <button onClick={() => openViewer(0)} className="absolute bottom-4 right-4 hidden min-h-[44px] items-center gap-2 rounded-lg border border-brand-border-subtle bg-white px-4 font-semibold text-brand-fg-primary shadow md:flex">{gridIcon} Show all photos</button>
    </section>}
    {images.length ? <section>{mosaic && <h2 className="mb-6 text-2xl font-bold text-brand-fg-primary">All photos</h2>}<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{album.media.map((item, idx) => <figure key={item.mediaAssetId} className="group overflow-hidden rounded-xl bg-brand-bg-elevated shadow-sm transition hover:shadow-lg motion-reduce:transition-none"><button className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-forest" onClick={() => openViewer(idx)} aria-label={`Open image ${idx + 1} of ${images.length}`}><div className="relative overflow-hidden"><Image src={item.url} alt={item.altText} width={600} height={450} className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" loading={idx < 3 ? 'eager' : 'lazy'} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" /></div>{item.caption && <span className="block p-3 text-sm text-brand-fg-secondary">{item.caption}</span>}</button></figure>)}</div></section> : <p className="text-brand-fg-muted">No images in this album yet.</p>}
    <div className="mt-12 flex flex-wrap gap-4"><Link href="/where-to-find-us" className="btn-primary">Attend a meeting</Link><Link href="/support-asca" className="btn-secondary">Support ASCA</Link><Link href="/get-involved" className="btn-secondary">Join ASCA</Link></div>
  </div></main><AccessibleImageViewer images={images} currentIndex={viewerIndex} isOpen={viewerOpen} onClose={closeViewer} onNext={() => moveViewer(Math.min(viewerIndex + 1, images.length - 1))} onPrev={() => moveViewer(Math.max(viewerIndex - 1, 0))} /></>;
}
