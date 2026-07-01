'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ManagedImage from '@/components/media/ManagedImage';
import { type AscaEvent, type AscaEventCategory, EVENT_CATEGORIES } from '@/lib/content/events';
import { formatEventDateRange } from '@/lib/date';
import { createIcsDataHref } from '@/lib/ics';

interface EventDetailModalProps {
  event: AscaEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

function CategoryBadge({ category }: { category: AscaEventCategory }) {
  const config = EVENT_CATEGORIES[category];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${config.badgeClass}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}

function EventActions({ event }: { event: AscaEvent }) {
  const icsHref = createIcsDataHref(event);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleShare = async () => {
    const url = `${window.location.origin}/where-to-find-us?event=${encodeURIComponent(event.id)}`;
    const shareData = {
      title: event.title,
      text: `${event.title} — ${formatEventDateRange(event)}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopyStatus('copied');
        window.setTimeout(() => setCopyStatus('idle'), 2500);
      }
    } catch {
      // User cancelled or share failed; no-op
    }
  };

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {event.ctaHref && (
        <a
          href={event.ctaHref}
          target={event.ctaHref.startsWith('http') ? '_blank' : undefined}
          rel={event.ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="btn-primary text-xs"
        >
          {event.ctaLabel || 'Learn More'}
        </a>
      )}
      {icsHref && (
        <a
          href={icsHref}
          download={`${event.id}.ics`}
          className="rounded-full border border-brand-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-fg-primary transition-colors hover:bg-brand-bg-subtle focus-visible:ring-2 focus-visible:ring-brand-forest"
        >
          Add to Calendar
        </a>
      )}
      <button
        type="button"
        onClick={handleShare}
        className="rounded-full border border-brand-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-fg-primary transition-colors hover:bg-brand-bg-subtle focus-visible:ring-2 focus-visible:ring-brand-forest"
      >
        {copyStatus === 'copied' ? 'Link Copied' : 'Share Event'}
      </button>
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
}

export default function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';

    const handleKey = (eventKey: KeyboardEvent) => {
      if (eventKey.key === 'Escape') {
        onClose();
        return;
      }

      if (eventKey.key !== 'Tab') return;
      const focusable = getFocusableElements(panelRef.current);
      if (focusable.length === 0) {
        eventKey.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (document.activeElement === panelRef.current) {
        eventKey.preventDefault();
        (eventKey.shiftKey ? last : first).focus();
        return;
      }
      if (eventKey.shiftKey && document.activeElement === first) {
        eventKey.preventDefault();
        last.focus();
      } else if (!eventKey.shiftKey && document.activeElement === last) {
        eventKey.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    const timer = setTimeout(() => {
      panelRef.current?.focus();
    }, 50);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      clearTimeout(timer);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && event && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-heading"
          aria-describedby={event.description ? 'event-modal-description' : undefined}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative h-[100dvh] w-full overflow-y-auto bg-brand-bg-elevated p-5 shadow-2xl focus:outline-none sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-2xl text-brand-fg-muted transition-colors hover:bg-brand-bg-subtle hover:text-brand-fg-primary focus-visible:ring-2 focus-visible:ring-brand-forest"
              aria-label="Close event details"
            >
              ×
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-forest">Selected Event</p>
            <h2 id="event-modal-heading" className="mt-2 pr-10 text-2xl font-bold text-brand-fg-primary sm:text-3xl">
              {event.title}
            </h2>
            <div className="mt-4">
              <CategoryBadge category={event.category} />
            </div>

            {event.imageUrl && (
              <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-xl bg-brand-bg-elevated"
              >
                <ManagedImage
                  src={event.imageUrl}
                  alt={event.imageAlt || event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 360px"
                />
              </div>
            )}

            <dl className="mt-5 grid grid-cols-1 gap-3 text-sm text-brand-fg-secondary sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-brand-fg-primary">Date</dt>
                <dd>{formatEventDateRange(event)}</dd>
              </div>
              {event.time && (
                <div>
                  <dt className="font-semibold text-brand-fg-primary">Time</dt>
                  <dd>{event.time}</dd>
                </div>
              )}
              {event.location && (
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-brand-fg-primary">Location</dt>
                  <dd>{event.location}</dd>
                </div>
              )}
            </dl>

            {event.description && (
              <p id="event-modal-description" className="mt-4 text-sm leading-relaxed text-brand-fg-secondary">
                {event.description}
              </p>
            )}

            {event.registrationRequired && (
              <p className="mt-4 inline-flex rounded-full border border-brand-accent bg-brand-bg-elevated px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-fg-primary">
                Registration Required
              </p>
            )}

            <EventActions event={event} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
