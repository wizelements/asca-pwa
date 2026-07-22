'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface ManagedMediaItem {
  mediaAssetId: string;
  url: string;
  altText: string;
  caption?: string | null;
  sortOrder: number;
}

interface MediaManagerProps {
  media: ManagedMediaItem[];
  coverId?: string | null;
  onChange: (media: ManagedMediaItem[]) => void;
  onCoverChange?: (mediaAssetId: string | null) => void;
  coverLabel?: string;
  maxItems?: number;
}

export default function MediaManager({
  media,
  coverId,
  onChange,
  onCoverChange,
  coverLabel = 'Cover',
  maxItems,
}: MediaManagerProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<string | null>(null);

  const announce = useCallback((message: string) => {
    if (liveRef.current) {
      liveRef.current.textContent = message;
    }
  }, []);

  useEffect(() => {
    if (focusRef.current) {
      const el = document.getElementById(`media-row-${focusRef.current}`);
      el?.focus();
      focusRef.current = null;
    }
  }, [media]);

  const updateItem = useCallback(
    (id: string, patch: Partial<ManagedMediaItem>) => {
      onChange(media.map((m) => (m.mediaAssetId === id ? { ...m, ...patch } : m)));
    },
    [media, onChange]
  );

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= media.length || fromIndex === toIndex) return;
      const next = [...media];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      const reordered = next.map((m, i) => ({ ...m, sortOrder: i * 10 }));
      onChange(reordered);
      focusRef.current = moved.mediaAssetId;
      announce(`Moved image to position ${toIndex + 1} of ${reordered.length}`);
    },
    [media, onChange, announce]
  );

  const remove = useCallback(
    (id: string) => {
      const index = media.findIndex((m) => m.mediaAssetId === id);
      const next = media.filter((m) => m.mediaAssetId !== id);
      const reordered = next.map((m, i) => ({ ...m, sortOrder: i * 10 }));
      onChange(reordered);
      if (coverId === id && onCoverChange) {
        onCoverChange(next[0]?.mediaAssetId ?? null);
      }
      const focusId = reordered[index]?.mediaAssetId ?? reordered[index - 1]?.mediaAssetId ?? null;
      if (focusId) focusRef.current = focusId;
      announce('Image removed');
      setPendingDelete(null);
    },
    [media, coverId, onChange, onCoverChange, announce]
  );

  return (
    <div className="space-y-4">
      <div ref={liveRef} aria-live="polite" className="sr-only" />
      {maxItems && media.length >= maxItems && (
        <p className="text-sm text-admin-fg-muted">Maximum {maxItems} images reached.</p>
      )}
      <ul className="divide-y divide-admin-border-subtle rounded-lg border border-admin-border-subtle bg-admin-surface">
        {media.map((item, index) => (
          <li
            key={item.mediaAssetId}
            id={`media-row-${item.mediaAssetId}`}
            tabIndex={-1}
            draggable
            onDragStart={() => setDraggingId(item.mediaAssetId)}
            onDragOver={(e) => {
              e.preventDefault();
              if (draggingId && draggingId !== item.mediaAssetId) {
                const dragIndex = media.findIndex((m) => m.mediaAssetId === draggingId);
                if (dragIndex !== -1) {
                  const next = [...media];
                  const [moved] = next.splice(dragIndex, 1);
                  next.splice(index, 0, moved);
                  onChange(next.map((m, i) => ({ ...m, sortOrder: i * 10 })));
                }
              }
            }}
            onDragEnd={() => {
              setDraggingId(null);
              announce(`Image dropped at position ${index + 1}`);
            }}
            className={`flex flex-col gap-3 p-4 transition ${draggingId === item.mediaAssetId ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="flex items-start gap-4">
              <img
                src={item.url}
                alt={item.altText}
                className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={item.altText}
                  onChange={(e) => updateItem(item.mediaAssetId, { altText: e.target.value })}
                  placeholder="Descriptive alt text"
                  className="form-input w-full text-sm"
                  aria-label={`Alt text for image ${index + 1}`}
                />
                <input
                  type="text"
                  value={item.caption || ''}
                  onChange={(e) => updateItem(item.mediaAssetId, { caption: e.target.value })}
                  placeholder="Optional caption"
                  className="form-input w-full text-sm"
                  aria-label={`Caption for image ${index + 1}`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onCoverChange && (
                <button
                  type="button"
                  onClick={() => onCoverChange(item.mediaAssetId)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${coverId === item.mediaAssetId ? 'bg-brand-forest text-white' : 'bg-admin-bg-subtle text-admin-fg-secondary hover:bg-admin-border-subtle'}`}
                  aria-pressed={coverId === item.mediaAssetId}
                >
                  {coverId === item.mediaAssetId ? `${coverLabel} selected` : `Set as ${coverLabel.toLowerCase()}`}
                </button>
              )}
              <button
                type="button"
                onClick={() => reorder(index, index - 1)}
                disabled={index === 0}
                className="rounded-md bg-admin-bg-subtle px-3 py-1.5 text-xs font-medium text-admin-fg-secondary hover:bg-admin-border-subtle disabled:opacity-40"
                aria-label={`Move image ${index + 1} up`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => reorder(index, index + 1)}
                disabled={index === media.length - 1}
                className="rounded-md bg-admin-bg-subtle px-3 py-1.5 text-xs font-medium text-admin-fg-secondary hover:bg-admin-border-subtle disabled:opacity-40"
                aria-label={`Move image ${index + 1} down`}
              >
                ↓
              </button>

              {pendingDelete === item.mediaAssetId ? (
                <span className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-admin-fg-secondary">Remove?</span>
                  <button
                    type="button"
                    onClick={() => remove(item.mediaAssetId)}
                    className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="rounded-md bg-admin-bg-subtle px-3 py-1.5 text-xs font-medium text-admin-fg-secondary hover:bg-admin-border-subtle"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setPendingDelete(item.mediaAssetId)}
                  className="ml-auto rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {media.length === 0 && <p className="text-sm text-admin-fg-muted">No images yet. Upload images below to add them.</p>}
    </div>
  );
}
