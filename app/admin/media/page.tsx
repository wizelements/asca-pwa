'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import AdminImageField from '@/components/AdminImageField';
import { getAdminToken, logout } from '@/components/AdminGuard';
import {
  DEFAULT_MANAGED_IMAGES,
  getManagedImagesByCategory,
  getManagedImagesFromRecord,
  managedImagesToRecord,
  type ManagedImage,
} from '@/lib/media';

export default function AdminMediaLibrary() {
  const [images, setImages] = useState<ManagedImage[]>(DEFAULT_MANAGED_IMAGES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const groupedImages = useMemo(() => getManagedImagesByCategory(images), [images]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) {
        setError('Unable to load managed media settings.');
        return;
      }
      const settings = await res.json();
      setImages(getManagedImagesFromRecord(settings.heroes));
    } catch {
      setError('Unable to load managed media settings.');
    } finally {
      setLoading(false);
    }
  };

  const updateImage = (slot: string, patch: Partial<ManagedImage>) => {
    setImages((current) => current.map((image) => (
      image.slot === slot ? { ...image, ...patch, published: patch.published ?? image.published } : image
    )));
  };

  const resetDefaults = () => {
    setImages(DEFAULT_MANAGED_IMAGES);
    setMessage('Defaults restored in the editor. Click Save Media Settings to publish them.');
    setError('');
  };

  const handleSave = async () => {
    const missingAlt = images.find((image) => image.published !== false && image.src && !image.alt.trim());
    if (missingAlt) {
      setError(`Alt text is required for ${missingAlt.title || missingAlt.slot}.`);
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');
    const token = getAdminToken();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ heroes: managedImagesToRecord(images) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Unable to save media settings.');
        return;
      }
      setImages(getManagedImagesFromRecord(data.heroes));
      setMessage('Media settings saved. Public pages now use these image slots.');
    } catch {
      setError('Unable to save media settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading media library...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Media Library</h1>
          <p className="mt-2 max-w-3xl text-sm text-brand-fg-secondary">
            Manage images used by page heroes, logos, home sections, member sections, and fallback gallery areas. Gallery collection photos are managed in the Gallery tab.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/gallery" className="rounded-lg border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle">
            Manage Gallery Images
          </Link>
          <button type="button" onClick={resetDefaults} className="rounded-lg border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle">
            Reset to Defaults
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-forest px-5 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Media Settings'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">Storage note</p>
        <p className="mt-1">Uploads are optimized in the browser and saved with the site setting record. Use JPG, PNG, or WebP. For very large photo collections, keep using Gallery records or move to external storage later.</p>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      {Object.entries(groupedImages).map(([category, categoryImages]) => (
        <section key={category} className="space-y-4" aria-labelledby={`media-${category.replace(/\W+/g, '-').toLowerCase()}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-forest">Image Slots</p>
            <h2 id={`media-${category.replace(/\W+/g, '-').toLowerCase()}`} className="text-2xl font-bold text-brand-fg-primary">{category}</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {categoryImages.map((image) => (
              <article key={image.slot} className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-brand-fg-primary">{image.title || image.slot}</h3>
                    <p className="mt-1 font-mono text-xs text-brand-fg-muted">{image.slot}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-fg-primary">
                    <input
                      type="checkbox"
                      checked={image.published !== false}
                      onChange={(e) => updateImage(image.slot, { published: e.target.checked })}
                      className="h-4 w-4"
                    />
                    Published
                  </label>
                </div>

                <div className="space-y-4">
                  <AdminImageField
                    label="Image path, URL, or upload"
                    value={image.src}
                    onChange={(src) => updateImage(image.slot, { src })}
                    required={image.published !== false}
                    previewAlt={image.alt || image.title || image.slot}
                  />
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Alt text *</label>
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(e) => updateImage(image.slot, { alt: e.target.value })}
                      className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                      required={image.published !== false}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Title</label>
                      <input
                        type="text"
                        value={image.title || ''}
                        onChange={(e) => updateImage(image.slot, { title: e.target.value })}
                        className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Sort order</label>
                      <input
                        type="number"
                        value={image.sortOrder ?? 0}
                        onChange={(e) => updateImage(image.slot, { sortOrder: Number(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Caption / internal note</label>
                    <input
                      type="text"
                      value={image.caption || ''}
                      onChange={(e) => updateImage(image.slot, { caption: e.target.value })}
                      className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
