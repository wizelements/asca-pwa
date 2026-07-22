'use client';

import { useState, useCallback } from 'react';

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

  const updateItem = useCallback(
    (id: string, patch: Partial<ManagedMediaItem>) => {
      onChange(media.map((m) => (m.mediaAssetId === id ? { ...m, ...patch } : m)));
    },
    [media, onChange]
  );

  const move = useCallback(
    (index: number, direction: -1 | 1) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= media.length) return;
      const next = [...media];
      const [moved] = next.splice(index, 1);
      next.splice(newIndex, 0, moved);
      onChange(next.map((m, i) => ({ ...m, sortOrder: i * 10 })));
    },
    [media, onChange]
  );

  const remove = useCallback(
    (id: string) => {
      if (!confirm('Remove this image from the collection? The uploaded file will be preserved.')) return;
      const next = media.filter((m) => m.mediaAssetId !== id);
      onChange(next.map((m, i) => ({ ...m, sortOrder: i * 10 })));
      if (coverId === id && onCoverChange) {
        onCoverChange(next[0]?.mediaAssetId ?? null);
      }
    },
    [media, coverId, onChange, onCoverChange]
  );

  return (
    <div className="space-y-4">
      {maxItems && media.length >= maxItems && (
        <p className="text-sm text-admin-fg-muted">Maximum {maxItems} images reached.</p>
      )}
      <ul className="divide-y divide-admin-border-subtle rounded-lg border border-admin-border-subtle bg-admin-surface">
        {media.map((item, index) => (
          <li
            key={item.mediaAssetId}
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
            onDragEnd={() => setDraggingId(null)}
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
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded-md bg-admin-bg-subtle px-3 py-1.5 text-xs font-medium text-admin-fg-secondary hover:bg-admin-border-subtle disabled:opacity-40"
                aria-label={`Move image ${index + 1} up`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === media.length - 1}
                className="rounded-md bg-admin-bg-subtle px-3 py-1.5 text-xs font-medium text-admin-fg-secondary hover:bg-admin-border-subtle disabled:opacity-40"
                aria-label={`Move image ${index + 1} down`}
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(item.mediaAssetId)}
                className="ml-auto rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      {media.length === 0 && <p className="text-sm text-admin-fg-muted">No images yet. Upload images below to add them.</p>}
    </div>
  );
}
