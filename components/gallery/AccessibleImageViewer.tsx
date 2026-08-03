'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ViewerImage { url: string; altText: string; caption?: string | null }
interface AccessibleImageViewerProps {
  images: ViewerImage[]; currentIndex: number; isOpen: boolean;
  onClose: () => void; onNext: () => void; onPrev: () => void;
}

export default function AccessibleImageViewer({ images, currentIndex, isOpen, onClose, onNext, onPrev }: AccessibleImageViewerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const scrollY = useRef(0);
  const pointer = useRef<{ id: number; x: number; y: number; time: number } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const current = images[currentIndex];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowRight') onNext();
    else if (e.key === 'ArrowLeft') onPrev();
    else if (e.key === 'Tab') {
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? []);
      if (!focusable.length) { e.preventDefault(); dialogRef.current?.focus(); return; }
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
  }, [isOpen, onClose, onNext, onPrev]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement as HTMLElement;
    scrollY.current = window.scrollY;
    const oldOverflow = document.body.style.overflow;
    const oldPosition = document.body.style.position;
    const oldTop = document.body.style.top;
    const oldWidth = document.body.style.width;
    document.body.style.overflow = 'hidden'; document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY.current}px`; document.body.style.width = '100%';
    closeRef.current?.focus(); window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow; document.body.style.position = oldPosition;
      document.body.style.top = oldTop; document.body.style.width = oldWidth;
      window.scrollTo(0, scrollY.current); window.removeEventListener('keydown', handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen) return;
    setAnnouncement(`Photo ${currentIndex + 1} of ${images.length}`);
    [images[currentIndex + 1], images[currentIndex - 1]].forEach((image) => { if (image) new window.Image().src = image.url; });
  }, [currentIndex, images, isOpen]);

  if (!isOpen || !current) return null;
  const iconClass = 'h-6 w-6';
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Image viewer" tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 pt-[calc(1rem+env(safe-area-inset-top))] pr-[calc(1rem+env(safe-area-inset-right))] pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))]" onClick={onClose}>
      <div className="relative flex max-h-full w-full max-w-5xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} onClick={onClose} aria-label="Close image viewer" className="absolute right-0 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 motion-reduce:transition-none">
          <svg aria-hidden="true" viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="flex w-full items-center justify-between gap-2">
          <button onClick={onPrev} disabled={currentIndex === 0} aria-label="Previous image" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 motion-reduce:transition-none">
            <svg aria-hidden="true" viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <figure className="flex min-w-0 flex-1 flex-col items-center">
            <div className="w-full touch-pan-y select-none" onPointerDown={(e) => { pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, time: performance.now() }; e.currentTarget.setPointerCapture(e.pointerId); }}
              onPointerMove={(e) => { if (pointer.current?.id === e.pointerId && Math.abs(e.clientY - pointer.current.y) > Math.abs(e.clientX - pointer.current.x)) pointer.current = null; }}
              onPointerUp={(e) => { const start = pointer.current; pointer.current = null; if (!start || start.id !== e.pointerId) return; const dx = e.clientX - start.x; const dy = e.clientY - start.y; const elapsed = Math.max(performance.now() - start.time, 1); if (Math.abs(dx) > Math.abs(dy) * 1.2 && (Math.abs(dx) >= 60 || Math.abs(dx) / elapsed >= .5)) { if (dx < 0) onNext(); else onPrev(); } }}>
              <img src={current.url} alt={current.altText} draggable={false} className="max-h-[calc(100dvh-8rem)] max-w-full rounded-md object-contain" />
            </div>
            {current.caption && <figcaption className="mt-2 max-w-xl text-center text-sm text-white/90">{current.caption}</figcaption>}
            <p className="mt-1 text-xs text-white/70">{currentIndex + 1} / {images.length}</p>
          </figure>
          <button onClick={onNext} disabled={currentIndex === images.length - 1} aria-label="Next image" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30 motion-reduce:transition-none">
            <svg aria-hidden="true" viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
        <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
      </div>
    </div>
  );
}
