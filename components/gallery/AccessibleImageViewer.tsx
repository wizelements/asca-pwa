'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ViewerImage {
  url: string;
  altText: string;
  caption?: string | null;
}

interface AccessibleImageViewerProps {
  images: ViewerImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function AccessibleImageViewer({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: AccessibleImageViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const current = images[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
      }
    },
    [isOpen, onClose, onNext, onPrev]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-full w-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close image viewer"
          className="absolute right-0 top-0 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          ✕
        </button>

        <div className="flex w-full items-center justify-between gap-2">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            aria-label="Previous image"
            className="rounded-full bg-white/10 p-3 text-white hover:bg-white/20 disabled:opacity-30"
          >
            ←
          </button>

          <figure className="flex flex-1 flex-col items-center">
            <img
              src={current.url}
              alt={current.altText}
              className="max-h-[75vh] max-w-full rounded-md object-contain"
            />
            {current.caption && <figcaption className="mt-2 max-w-xl text-center text-sm text-white/90">{current.caption}</figcaption>}
            <p className="mt-1 text-xs text-white/70">{currentIndex + 1} / {images.length}</p>
          </figure>

          <button
            onClick={onNext}
            disabled={currentIndex === images.length - 1}
            aria-label="Next image"
            className="rounded-full bg-white/10 p-3 text-white hover:bg-white/20 disabled:opacity-30"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
