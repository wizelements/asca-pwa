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
  type SiteImageSlot,
} from '@/lib/media';

const RETIRED_CLIENT_SLOTS = new Set<SiteImageSlot>([
  'home.galleryPreview.1',
  'home.galleryPreview.2',
  'home.galleryPreview.3',
  'home.galleryPreview.4',
  'home.galleryPreview.5',
  'home.galleryPreview.6',
]);

interface SlotDestination {
  href: string;
  page: string;
  location: string;
  visibility: 'always' | 'fallback';
  explanation: string;
}

function destinationFor(slot: SiteImageSlot): SlotDestination {
  if (slot === 'home.hero') {
    return { href: '/', page: 'Homepage', location: 'Top hero image', visibility: 'always', explanation: 'Visitors see this at the top of the homepage.' };
  }
  if (slot.startsWith('home.activity.')) {
    return {
      href: '/',
      page: 'Homepage',
      location: 'Latest Activities fallback card',
      visibility: 'fallback',
      explanation: 'This is only used when there are no featured Gallery albums. Featured albums currently take priority when they exist.',
    };
  }
  if (slot === 'about.hero') {
    return { href: '/about', page: 'About', location: 'Top hero image', visibility: 'always', explanation: 'Visitors see this at the top of the About page.' };
  }
  if (slot === 'about.history') {
    return { href: '/about', page: 'About', location: 'History section image', visibility: 'always', explanation: 'Shown inside the About page history/story section.' };
  }
  if (slot === 'members.hero') {
    return { href: '/members', page: 'Meet ASCA', location: 'Top hero image', visibility: 'always', explanation: 'Visitors see this at the top of the Meet ASCA page.' };
  }
  if (slot.startsWith('members.community.')) {
    return { href: '/members', page: 'Meet ASCA', location: 'Community photo pair', visibility: 'always', explanation: 'Shown in the “A Place to Belong” section on the Meet ASCA page.' };
  }
  if (slot === 'getInvolved.hero') {
    return { href: '/get-involved', page: 'Get Involved', location: 'Top hero image', visibility: 'always', explanation: 'Visitors see this at the top of Get Involved.' };
  }
  if (slot === 'support.hero') {
    return { href: '/support-asca', page: 'Support ASCA', location: 'Top hero image', visibility: 'always', explanation: 'Visitors see this at the top of Support ASCA.' };
  }
  if (slot === 'gallery.hero') {
    return { href: '/gallery', page: 'Gallery', location: 'Top hero image', visibility: 'always', explanation: 'Visitors see this at the top of the Gallery page.' };
  }
  if (slot.startsWith('gallery.fallback.')) {
    return {
      href: '/gallery',
      page: 'Gallery',
      location: 'Legacy/empty-gallery fallback',
      visibility: 'fallback',
      explanation: 'Used only by the fallback gallery experience. Published Gallery albums take priority in the current gallery.',
    };
  }
  return { href: '/', page: 'Website', location: 'Managed image', visibility: 'fallback', explanation: 'This is a managed fallback image.' };
}

function defaultFor(slot: SiteImageSlot) {
  return DEFAULT_MANAGED_IMAGES.find((image) => image.slot === slot);
}

export default function AdminMediaLibrary() {
  const [images, setImages] = useState<ManagedImage[]>(DEFAULT_MANAGED_IMAGES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clientImages = useMemo(
    () => images.filter((image) => !RETIRED_CLIENT_SLOTS.has(image.slot)),
    [images]
  );
  const groupedImages = useMemo(() => getManagedImagesByCategory(clientImages), [clientImages]);

  useEffect(() => {
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) {
        setError('Unable to load page images.');
        return;
      }
      const settings = await res.json();
      setImages(getManagedImagesFromRecord(settings.heroes));
    } catch {
      setError('Unable to load page images.');
    } finally {
      setLoading(false);
    }
  };

  const updateImage = (slot: SiteImageSlot, patch: Partial<ManagedImage>) => {
    setImages((current) => current.map((image) => (
      image.slot === slot ? { ...image, ...patch, published: true } : image
    )));
  };

  const restoreSlot = (slot: SiteImageSlot) => {
    const fallback = defaultFor(slot);
    if (!fallback) return;
    setImages((current) => current.map((image) => (
      image.slot === slot ? { ...fallback, published: true } : image
    )));
    setMessage('Default restored in the editor. Save Page Images to publish it.');
    setError('');
  };

  const resetDefaults = () => {
    setImages(DEFAULT_MANAGED_IMAGES.map((image) => ({ ...image, published: true })));
    setMessage('All default page images restored in the editor. Save Page Images to publish them.');
    setError('');
  };

  const handleSave = async () => {
    const missingImage = clientImages.find((image) => !image.src.trim());
    if (missingImage) {
      setError(`Choose an image for ${missingImage.title || missingImage.slot}.`);
      return;
    }
    const missingAlt = clientImages.find((image) => !image.alt.trim());
    if (missingAlt) {
      setError(`Alt text is required for ${missingAlt.title || missingAlt.slot}.`);
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');
    const token = getAdminToken();
    try {
      const normalized = images.map((image) => ({ ...image, published: true }));
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ heroes: managedImagesToRecord(normalized) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Unable to save page images.');
        return;
      }
      setImages(getManagedImagesFromRecord(data.heroes));
      setMessage('Page images saved. Open the affected public page from any image card to verify the result.');
    } catch {
      setError('Unable to save page images.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading page images...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Page Images</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-fg-secondary">
            Change photography used in specific public website positions. Every card below tells you exactly where the image appears and whether it is always visible or only a fallback.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/albums" className="rounded-lg border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle">
            Gallery Albums
          </Link>
          <button type="button" onClick={resetDefaults} className="rounded-lg border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle">
            Restore All Defaults
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-brand-forest px-5 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Page Images'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          <p className="font-semibold">What happens when you choose an image?</p>
          <p className="mt-1">
            ASCA prepares and stores the image so you can preview it, but the public page is not reassigned until you click <strong>Save Page Images</strong>. If you abandon an upload, Media Integrity can identify it later as unused.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <p className="font-semibold">Fallback does not mean broken.</p>
          <p className="mt-1">
            Homepage activity and legacy Gallery fallback images can be correctly saved yet remain unseen while featured Gallery albums are supplying that section. Those cards are labeled below.
          </p>
        </div>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      {Object.entries(groupedImages).map(([category, categoryImages]) => (
        <section key={category} className="space-y-4" aria-labelledby={`media-${category.replace(/\W+/g, '-').toLowerCase()}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-forest">Public website photography</p>
            <h2 id={`media-${category.replace(/\W+/g, '-').toLowerCase()}`} className="text-2xl font-bold text-brand-fg-primary">{category}</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {categoryImages.map((image) => {
              const destination = destinationFor(image.slot);
              const fallback = defaultFor(image.slot);
              const isDefault = Boolean(fallback && image.src === fallback.src && image.alt === fallback.alt);

              return (
                <article key={image.slot} className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-brand-fg-primary">{image.title || destination.location}</h3>
                        <p className="mt-1 text-sm font-semibold text-brand-forest">{destination.page} · {destination.location}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        destination.visibility === 'always'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {destination.visibility === 'always' ? 'Visible on page' : 'Fallback only'}
                      </span>
                    </div>

                    <div className="rounded-lg bg-brand-bg-subtle p-3 text-sm leading-5 text-brand-fg-secondary">
                      {destination.explanation}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={destination.href}
                        target="_blank"
                        className="rounded-lg border border-brand-forest px-3 py-2 text-sm font-semibold text-brand-forest hover:bg-brand-bg-soft"
                      >
                        View affected page ↗
                      </Link>
                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => restoreSlot(image.slot)}
                          className="rounded-lg border border-brand-border-subtle px-3 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle"
                        >
                          Restore default image
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <AdminImageField
                      label="Image"
                      value={image.src}
                      onChange={(src) => updateImage(image.slot, { src })}
                      required
                      allowClear={false}
                      helper="Choose a JPG, PNG, or WebP, or paste an existing image URL/path. Save Page Images to assign it to this website position."
                      previewAlt={image.alt || image.title || image.slot}
                    />
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Alt text *</label>
                      <input
                        type="text"
                        value={image.alt}
                        onChange={(e) => updateImage(image.slot, { alt: e.target.value })}
                        className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                        required
                      />
                      <p className="mt-1 text-xs text-brand-fg-muted">Describe what is actually visible in the photo for screen-reader users and when the image cannot load.</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <details className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-5">
        <summary className="cursor-pointer text-sm font-bold text-brand-fg-primary">Why some old image slots are not shown here</summary>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-fg-secondary">
          Older homepage gallery-preview slots remain in stored settings for compatibility, but the current public homepage does not render them. They are intentionally hidden from the client editor so ASCA cannot upload into a control with no visible website destination.
        </p>
      </details>
    </div>
  );
}
