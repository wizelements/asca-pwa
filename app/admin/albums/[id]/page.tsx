'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { logout, useAuth } from '@/components/AdminGuard';
import MediaManager, { type ManagedMediaItem } from '@/components/gallery/MediaManager';
import { useToast } from '@/components/admin/ToastProvider';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { slugify } from '@/lib/gallery/slug';
import { isGenericAltText } from '@/lib/gallery/validation';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface EventOption {
  id: number;
  title: string;
}

interface PendingMedia {
  key: string;
  name: string;
  dataUrl: string;
  altText: string;
  caption: string;
}

function savedPhotoSignature(items: ManagedMediaItem[], cover: string | null): string {
  return JSON.stringify({
    cover,
    items: items.map((item) => ({
      id: item.mediaAssetId,
      altText: item.altText,
      caption: item.caption ?? null,
      sortOrder: item.sortOrder,
    })),
  });
}

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_OUTPUT_DIMENSION = 1800;
const JPEG_QUALITY = 0.84;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The browser could not open this image. It may be damaged or unsupported; try exporting it as JPG or PNG.'));
    image.src = src;
  });
}

async function optimizeImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('This file is not a JPG, PNG or WebP photo. Convert it to a supported format and try again.');
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error('The original photo exceeds 8 MB. Reduce its file size and select it again.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to optimize images in this browser.');
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function AdminAlbumEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const idParam = params.id as string;
  const isNew = idParam === 'new';
  const albumId = isNew ? null : Number(idParam);
  const isAdmin = user?.role === 'admin';

  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [eventId, setEventId] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [privacyReviewStatus, setPrivacyReviewStatus] = useState('pending');
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [media, setMedia] = useState<ManagedMediaItem[]>([]);
  const [originalMediaIds, setOriginalMediaIds] = useState<string[]>([]);
  const [savedMediaSignature, setSavedMediaSignature] = useState('');
  const [newMedia, setNewMedia] = useState<PendingMedia[]>([]);
  const [preparingImages, setPreparingImages] = useState(false);
  const [describing, setDescribing] = useState(false);
  const [descriptionProgress, setDescriptionProgress] = useState('');
  const [photoIssues, setPhotoIssues] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');

  const pageTitle = isNew ? 'Create gallery album' : 'Edit gallery album';
  const missingDescriptionCount = newMedia.filter((item) => isGenericAltText(item.altText)).length +
    media.filter((item) => isGenericAltText(item.altText)).length;
  const removedMediaIds = useMemo(
    () => originalMediaIds.filter((mediaAssetId) => !media.some((item) => item.mediaAssetId === mediaAssetId)),
    [originalMediaIds, media]
  );
  const hasUnsavedPhotoChanges = newMedia.length > 0 || savedPhotoSignature(media, coverId) !== savedMediaSignature;
  const publicationBlockers = useMemo(() => {
    const reasons: string[] = [];
    if (status === 'archived') reasons.push('Restore this album to draft before publishing.');
    if (privacyReviewStatus === 'pending') reasons.push('Privacy review is pending. An administrator must review permissions and approve this album.');
    if (privacyReviewStatus === 'restricted') reasons.push('This album is restricted. Confirm permission before changing its privacy status.');
    if (!media.length) reasons.push('Add at least one photo and save the album.');
    if (!coverId || !media.some((item) => item.mediaAssetId === coverId)) reasons.push('Choose an attached cover photo, then save.');
    if (media.some((item) => isGenericAltText(item.altText))) reasons.push('Some photos need specific descriptions. Use Generate missing descriptions or edit their alt text and save.');
    if (!categories.some((item) => String(item.id) === categoryId)) reasons.push('Choose an active album category and save.');
    if (hasUnsavedPhotoChanges) reasons.push('Save the current photo edits before publishing.');
    return reasons;
  }, [status, privacyReviewStatus, media, coverId, categories, categoryId, hasUnsavedPhotoChanges]);

  useEffect(() => {
    void fetchCategories();
    void fetchEvents();
    if (!isNew) void fetchAlbum();
  }, [idParam]);

  const request = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, {
      credentials: 'same-origin',
      ...init,
      headers: {
        ...(init?.headers ?? {}),
      },
    });
    if (response.status === 401) {
      await logout();
      throw new Error('Your session expired.');
    }
    return response;
  };

  const fetchCategories = async () => {
    try {
      const res = await request('/api/gallery/categories');
      if (!res.ok) return;
      const data = await res.json();
      setCategories(Array.isArray(data) ? data.filter((category) => category.active !== false) : []);
    } catch {
      // The form can still show its main load error independently.
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await request('/api/events');
      if (!res.ok) return;
      const data = await res.json();
      setEvents(Array.isArray(data) ? data.map((event: any) => ({ id: event.id, title: event.title })) : []);
    } catch {
      setEvents([]);
    }
  };

  const applyAlbum = (data: any) => {
    const nextMedia: ManagedMediaItem[] = Array.isArray(data.media)
      ? data.media.map((item: any, index: number) => ({
          mediaAssetId: item.mediaAssetId,
          url: item.url,
          altText: item.altText || '',
          caption: item.caption ?? null,
          sortOrder: item.sortOrder ?? index * 10,
        }))
      : [];

    setTitle(data.title || '');
    setSlug(data.slug || '');
    setSlugTouched(true);
    setCategoryId(String(data.categoryId || ''));
    setEventId(data.eventId ? String(data.eventId) : '');
    setActivityDate(data.activityDate ? new Date(data.activityDate).toISOString().split('T')[0] : '');
    setLocation(data.location || '');
    setSummary(data.summary || '');
    setFeatured(Boolean(data.featured));
    setStatus(data.status || 'draft');
    setPrivacyReviewStatus(data.privacyReviewStatus || 'pending');
    setSortOrder(data.sortOrder ?? 0);
    setCoverId(data.coverMediaAssetId || nextMedia[0]?.mediaAssetId || null);
    setMedia(nextMedia);
    setOriginalMediaIds(nextMedia.map((item) => item.mediaAssetId));
    setSavedMediaSignature(savedPhotoSignature(nextMedia, data.coverMediaAssetId || nextMedia[0]?.mediaAssetId || null));
  };

  const fetchAlbum = async () => {
    if (!albumId || Number.isNaN(albumId)) {
      setError('Invalid album address.');
      setLoading(false);
      return;
    }
    try {
      setError('');
      const res = await request('/api/gallery/albums?id=' + albumId);
      if (!res.ok) throw new Error('Album not found');
      applyAlbum(await res.json());
    } catch {
      setError('Unable to load this album.');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (isNew && !slugTouched) setSlug(slugify(value));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setPreparingImages(true);
    setPhotoIssues([]);
    try {
      const outcomes = await Promise.allSettled(
        Array.from(files).map(async (file, index) => ({
          key: file.name + '-' + file.lastModified + '-' + index + '-' + Date.now(),
          name: file.name,
          dataUrl: await optimizeImage(file),
          altText: '',
          caption: '',
        }))
      );
      const prepared: PendingMedia[] = [];
      const issues: string[] = [];
      outcomes.forEach((outcome, index) => {
        if (outcome.status === 'fulfilled') prepared.push(outcome.value);
        else issues.push(files[index].name + ': ' + (outcome.reason instanceof Error ? outcome.reason.message : 'The photo could not be read.'));
      });
      if (prepared.length) {
        setNewMedia((current) => [...current, ...prepared]);
        toast.success(prepared.length + ' photo(s) prepared locally. Generate or enter descriptions, then select Save to upload.');
      }
      if (issues.length) {
        setPhotoIssues(issues);
        toast.error(issues.length + ' photo(s) could not be prepared. See details below.');
      }
    } catch {
      setPhotoIssues(['The browser could not prepare these photos. Try selecting fewer photos or smaller JPG, PNG or WebP files.']);
    } finally {
      setPreparingImages(false);
    }
  };

  const generateMissingDescriptions = async () => {
    if (describing || preparingImages || saving) return;
    const targets = [
      ...media.filter((item) => isGenericAltText(item.altText)).map((item, index) => ({
        kind: 'saved' as const, id: item.mediaAssetId, label: 'Saved photo ' + (index + 1),
      })),
      ...newMedia.filter((item) => isGenericAltText(item.altText)).map((item) => ({
        kind: 'new' as const, id: item.key, label: item.name, dataUrl: item.dataUrl,
      })),
    ];
    if (!targets.length) {
      toast.success('Every photo already has a description. Review the text for accuracy before publishing.');
      return;
    }
    if (!title.trim()) {
      setPhotoIssues(['Enter the album title first so AI descriptions can use the right context.']);
      return;
    }
    setDescribing(true);
    setPhotoIssues([]);
    const issues: string[] = [];
    let completed = 0;
    try {
      // Limit a single bulk action: keeps provider costs and timeouts bounded.
      const selected = targets.slice(0, 20);
      for (const [index, item] of selected.entries()) {
        setDescriptionProgress('Describing photo ' + (index + 1) + ' of ' + selected.length + '…');
        try {
          const response = await request('/api/gallery/describe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...(item.kind === 'new' ? { dataUrl: item.dataUrl } : { albumId, mediaAssetId: item.id }),
              context: { title: title.trim(), category: categories.find((category) => String(category.id) === categoryId)?.name, summary: summary.trim().slice(0, 500) },
            }),
          });
          const body = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'AI was unable to describe this photo.');
          if (typeof body.description !== 'string' || isGenericAltText(body.description)) {
            throw new Error('AI did not return a useful description. Add one manually.');
          }
          if (item.kind === 'new') {
            setNewMedia((current) => current.map((entry) => entry.key === item.id && isGenericAltText(entry.altText)
              ? { ...entry, altText: body.description } : entry));
          } else {
            setMedia((current) => current.map((entry) => entry.mediaAssetId === item.id && isGenericAltText(entry.altText)
              ? { ...entry, altText: body.description } : entry));
          }
          completed++;
        } catch (error) {
          const detail = error instanceof Error ? error.message : 'Unable to generate a description.';
          issues.push(item.label + ': ' + detail);
          // Stop after a configuration or authorization failure; repeating cannot help.
          if (/not connected|OPEE needs|session expired|cannot edit/i.test(detail)) break;
        }
      }
      if (targets.length > selected.length) issues.push('Only 20 photos are processed at a time. Use the button again to describe the remaining photos.');
      if (completed) toast.success(completed + ' AI description(s) suggested. Check accuracy and save the album.');
      if (issues.length) {
        setPhotoIssues(issues);
        toast.error('Some descriptions need attention. See the specific reasons below.');
      }
    } finally {
      setDescribing(false);
      setDescriptionProgress('');
    }
  };

  const deleteUnattachedAsset = async (assetId: string) => {
    await request('/api/gallery/media?id=' + encodeURIComponent(assetId), { method: 'DELETE' }).catch(() => undefined);
  };

  const uploadNewMedia = async (): Promise<ManagedMediaItem[]> => {
    if (!newMedia.length) return [];
    const missingAlt = newMedia.find((item) => isGenericAltText(item.altText));
    if (missingAlt) throw new Error('"' + missingAlt.name + '" needs a meaningful photo description. Select Generate missing descriptions with OPEE or type what is visible.');

    const results = await Promise.allSettled(
      newMedia.map(async (item, index) => {
        const res = await request('/api/gallery/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: item.dataUrl }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          const cause = typeof body.error === 'string' ? body.error : '';
          const advice = res.status === 413 ? 'Try a smaller photo.'
            : res.status === 429 ? 'Too many uploads. Retry in a few minutes.'
            : res.status === 401 ? 'Sign in again, then retry.'
            : res.status === 403 ? 'Your account needs gallery editor permission.'
            : res.status >= 500 ? 'The site could not save this photo. Try again shortly.'
            : cause || 'The site rejected this image.';
          throw new Error('Photo ' + (index + 1) + ' (' + item.name + '): ' + advice);
        }
        return {
          mediaAssetId: body.id,
          url: body.url,
          altText: item.altText.trim(),
          caption: item.caption.trim() || null,
          sortOrder: 0,
        } satisfies ManagedMediaItem;
      })
    );

    const uploaded: ManagedMediaItem[] = [];
    const errors: string[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') uploaded.push(result.value);
      else errors.push(result.reason?.message || 'Upload failed');
    }

    if (errors.length) {
      await Promise.all(uploaded.map((item) => deleteUnattachedAsset(item.mediaAssetId)));
      throw new Error('The upload was not completed. ' + errors.join(' ') + ' Your selected photos remain in the editor. Check the album before trying again.');
    }
    return uploaded;
  };

  const buildBasePayload = () => ({
    title: title.trim(),
    slug: slug.trim(),
    categoryId: Number(categoryId),
    eventId: eventId ? Number(eventId) : null,
    activityDate: activityDate || null,
    location: location.trim() || null,
    summary: summary.trim() || null,
    sortOrder: Number(sortOrder) || 0,
  });

  const saveAlbum = async (): Promise<any> => {
    if (!title.trim()) throw new Error('Add an album title before saving.');
    if (!slug.trim()) throw new Error('Add an album page address. Normally this is created from the album title.');
    if (!categoryId) throw new Error('Choose a category for this album before saving.');
    if (media.some((item) => isGenericAltText(item.altText))) {
      throw new Error('Some saved photos have missing or vague descriptions. Select Generate missing descriptions with OPEE or describe what is visible in each photo.');
    }
    if (newMedia.some((item) => isGenericAltText(item.altText))) {
      throw new Error('Some new photos need descriptions before upload. Select Generate missing descriptions or add them manually. Photos have not been uploaded yet.');
    }

    const uploaded = await uploadNewMedia();
    const allMedia = [...media, ...uploaded].map((item, index) => ({ ...item, sortOrder: index * 10 }));
    const nextCover = coverId && allMedia.some((item) => item.mediaAssetId === coverId)
      ? coverId
      : allMedia[0]?.mediaAssetId ?? null;

    const payload: any = {
      ...buildBasePayload(),
      coverMediaAssetId: nextCover,
    };

    if (isNew) {
      payload.media = allMedia.map((item) => ({
        mediaAssetId: item.mediaAssetId,
        altText: item.altText.trim(),
        caption: item.caption || null,
        sortOrder: item.sortOrder,
      }));
    } else {
      payload.id = albumId;
      payload.mediaUpdates = {
        add: uploaded.map((item) => ({
          mediaAssetId: item.mediaAssetId,
          altText: item.altText.trim(),
          caption: item.caption || null,
          sortOrder: item.sortOrder,
        })),
        remove: removedMediaIds,
        reorder: allMedia.map((item) => ({
          mediaAssetId: item.mediaAssetId,
          sortOrder: item.sortOrder,
        })),
        metadata: media.map((item) => ({
          mediaAssetId: item.mediaAssetId,
          altText: item.altText.trim(),
          caption: item.caption || null,
        })),
      };
    }

    const res = await request('/api/gallery/albums', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (uploaded.length) await Promise.all(uploaded.map((item) => deleteUnattachedAsset(item.mediaAssetId)));
      const details = result.error && typeof result.error === 'object' ? result.error : null;
      const validationText = details ? [ ...(Array.isArray(details.formErrors) ? details.formErrors : []), ...Object.values(details.fieldErrors || {}).flat().filter((value): value is string => typeof value === 'string') ].join(' ') : '';
      const message = typeof result.error === 'string' ? result.error : validationText || (res.status === 413 ? 'Too many photos or too much data at once. Save fewer photos at a time.' : res.status === 403 ? 'Your account cannot save albums. Ask an ASCA administrator to check your permissions.' : res.status >= 500 ? 'The site could not confirm this save. Check the album list before retrying to avoid duplicates.' : 'Unable to save this album. Check the form and try again.');
      throw new Error(message);
    }

    setNewMedia([]);
    if (!isNew) {
      const refreshed = await request('/api/gallery/albums?id=' + albumId);
      if (refreshed.ok) applyAlbum(await refreshed.json());
    }
    return result;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setPhotoIssues([]);
    try {
      const result = await saveAlbum();
      toast.success(isNew ? 'Album and photos saved as a private draft. An administrator must review privacy and publish it.' : 'Photo and album changes saved. Publishing is a separate approval step.');
      if (isNew) router.replace('/admin/albums/' + result.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save album.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const performAction = async (action: string, extra: Record<string, unknown> = {}) => {
    if (!albumId) return;
    setSaving(true);
    setError('');
    try {
      const res = await request('/api/gallery/albums', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: albumId, action, ...extra }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof result.error === 'string' ? result.error : 'Action failed');
      applyAlbum({ ...result, media });
      toast.success(
        action === 'publish' ? 'Album published' :
        action === 'archive' ? 'Album archived' :
        action === 'restore' ? 'Album restored to draft' :
        action === 'feature' ? 'Album featured on the homepage' :
        action === 'unfeature' ? 'Album removed from homepage features' :
        action === 'setPrivacy' ? 'Privacy status updated' :
        'Album updated'
      );
      await fetchAlbum();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title={pageTitle} subtitle="Loading the album editor…" />
        <p className="text-admin-fg-muted">Loading album…</p>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={pageTitle}
        subtitle={isNew ? 'Create a draft album, add photos, then review and publish when it is ready.' : 'Edit album details and photos. Publication and privacy controls remain separate from content editing.'}
      />
      <div className="max-w-4xl space-y-6">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            <p>Album not saved: {error}</p>
            <p className="mt-2 font-normal">You can correct the issue here without starting over. Review existing albums before uploading the same photos again.</p>
          </div>
        )}
        {photoIssues.length > 0 && (
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">Photos needing attention</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {photoIssues.map((issue, index) => <li key={index}>{issue}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
            <h2 className="text-lg font-bold text-admin-fg-primary">Album details</h2>
            <p className="mt-1 text-sm text-admin-fg-secondary">Describe the activity so visitors understand what they are seeing.</p>

            <div className="mt-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-admin-fg-secondary">Album title</label>
                <input className="form-input mt-1" value={title} onChange={(event) => handleTitleChange(event.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-fg-secondary">Page URL</label>
                <div className="mt-1 flex items-center rounded-md border border-admin-border-subtle bg-admin-bg-body px-3">
                  <span className="shrink-0 text-sm text-admin-fg-muted">/gallery/</span>
                  <input
                    className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-sm text-admin-fg-primary outline-none"
                    value={slug}
                    onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)); }}
                    aria-label="Gallery page URL"
                  />
                </div>
                <p className="mt-1 text-xs text-admin-fg-muted">Generated from the title. Change it only when you need a different web address.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-admin-fg-secondary">Category</label>
                  <select className="form-input mt-1" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
                    <option value="">Choose a category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-admin-fg-secondary">Activity date</label>
                  <input type="date" className="form-input mt-1" value={activityDate} onChange={(event) => setActivityDate(event.target.value)} />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-admin-fg-secondary">Location</label>
                  <input className="form-input mt-1" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-admin-fg-secondary">Related event</label>
                  <select className="form-input mt-1" value={eventId} onChange={(event) => setEventId(event.target.value)}>
                    <option value="">None</option>
                    {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-admin-fg-secondary">Short description</label>
                <textarea className="form-input mt-1" rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="What happened, who participated, or why the activity mattered." />
              </div>

              <details>
                <summary className="cursor-pointer text-sm font-semibold text-admin-fg-secondary">Advanced display options</summary>
                <div className="mt-3 max-w-xs">
                  <label className="block text-sm font-semibold text-admin-fg-secondary">Display priority</label>
                  <input type="number" className="form-input mt-1" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} />
                  <p className="mt-1 text-xs text-admin-fg-muted">Lower numbers appear first when other sorting rules are equal.</p>
                </div>
              </details>
            </div>
          </section>

          {!isNew && (
            <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
              <h2 className="text-lg font-bold text-admin-fg-primary">Current photos</h2>
              <p className="mt-1 text-sm text-admin-fg-secondary">Reorder photos, choose the cover, improve alt text and captions, or remove photos. Changes take effect when you save.</p>
              <div className="mt-5">
                {media.length ? (
                  <MediaManager media={media} coverId={coverId} onChange={setMedia} onCoverChange={setCoverId} />
                ) : (
                  <p className="rounded-lg bg-admin-bg-subtle p-4 text-sm text-admin-fg-muted">No photos are attached yet.</p>
                )}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-admin-fg-primary">Add photos</h2>
                <p className="mt-1 text-sm text-admin-fg-secondary">Choose JPG, PNG or WebP files, up to 8 MB each. They are prepared on this device first; no photos are uploaded until you save the album. Add descriptions before saving.</p>
              </div>
              <label className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-lg border border-admin-border-subtle px-4 text-sm font-semibold text-admin-fg-primary hover:bg-admin-bg-subtle">
                {preparingImages ? 'Preparing…' : 'Choose photos'}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={preparingImages || saving}
                  onChange={(event) => {
                    void handleFiles(event.target.files);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            {newMedia.length > 0 && <p id="album-photo-description-help" className="mt-3 text-sm text-admin-fg-secondary">Every photo needs a meaningful description before it can be uploaded. Generate missing descriptions with OPEE or describe the image yourself.</p>}
            {(newMedia.length > 0 || media.some((item) => isGenericAltText(item.altText))) && (
              <div className="mt-4 rounded-lg border border-admin-border-subtle bg-admin-bg-subtle p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" className="btn-admin-secondary" disabled={describing || saving || preparingImages || missingDescriptionCount === 0} onClick={() => void generateMissingDescriptions()}>
                    {describing ? 'Generating descriptions…' : 'Generate missing descriptions with OPEE (' + missingDescriptionCount + ')'}
                  </button>
                  {describing && <span role="status" className="text-sm text-admin-fg-secondary">{descriptionProgress}</span>}
                </div>
                <p className="mt-2 text-xs leading-5 text-admin-fg-secondary">
                  ASCA's OPEE assistant processes only photos needing descriptions together with the album title, category and summary. Use only when you have permission to process these photos. Suggestions are editable, may be inaccurate, and must be checked before saving and publishing. Existing descriptions are never replaced.
                </p>
              </div>
            )}
            {newMedia.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {newMedia.map((item, index) => (
                  <article key={item.key} className="rounded-xl border border-admin-border-subtle bg-admin-bg-body p-4">
                    <div className="aspect-[4/3] overflow-hidden rounded-lg bg-admin-bg-subtle">
                      <img src={item.dataUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 truncate text-xs text-admin-fg-muted">{item.name}</p>
                    <label className="mt-3 block text-sm font-semibold text-admin-fg-secondary">
                      Alt text *
                      <input
                        className="form-input mt-1"
                        value={item.altText}
                        onChange={(event) => setNewMedia((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, altText: event.target.value } : entry))}
                        placeholder="Describe what is visible in this photo"
                        aria-describedby="album-photo-description-help"
                      />
                    </label>
                    <label className="mt-3 block text-sm font-semibold text-admin-fg-secondary">
                      Caption
                      <input
                        className="form-input mt-1"
                        value={item.caption}
                        onChange={(event) => setNewMedia((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, caption: event.target.value } : entry))}
                        placeholder="Optional public caption"
                      />
                    </label>
                    <button
                      type="button"
                      className="mt-3 text-sm font-semibold text-red-700 hover:underline"
                      onClick={() => setNewMedia((current) => current.filter((_, entryIndex) => entryIndex !== index))}
                    >
                      Remove from upload
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving || preparingImages || describing} className="btn-admin-primary">
              {saving ? 'Uploading and saving…' : isNew ? 'Create draft & upload photos' : 'Save photos and changes'}
            </button>
            <button type="button" className="btn-admin-secondary" onClick={() => router.push('/admin/albums')}>Back to albums</button>
          </div>
        </form>

        {!isNew && !isAdmin && privacyReviewStatus === 'pending' && (
          <p role="status" className="rounded-xl border border-admin-border-subtle bg-admin-bg-subtle p-4 text-sm text-admin-fg-secondary">
            Your album may be saved as a draft. Only an administrator can approve the privacy review and publish it.
            Save your photo descriptions, then ask an ASCA administrator to review the album.
          </p>
        )}

        {!isNew && isAdmin && (
          <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
            <h2 className="text-lg font-bold text-admin-fg-primary">Review & publication</h2>
            <p className="mt-1 text-sm text-admin-fg-secondary">Publishing is intentionally separate from editing so content and privacy can be reviewed first.</p>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-lg bg-admin-bg-subtle p-3">
                <dt className="text-admin-fg-muted">Status</dt>
                <dd className="mt-1 font-bold capitalize text-admin-fg-primary">{status}</dd>
              </div>
              <div className="rounded-lg bg-admin-bg-subtle p-3">
                <dt className="text-admin-fg-muted">Privacy</dt>
                <dd className="mt-1 font-bold capitalize text-admin-fg-primary">{privacyReviewStatus.replace('_', ' ')}</dd>
              </div>
              <div className="rounded-lg bg-admin-bg-subtle p-3">
                <dt className="text-admin-fg-muted">Homepage feature</dt>
                <dd className="mt-1 font-bold text-admin-fg-primary">{featured ? 'Yes' : 'No'}</dd>
              </div>
            </dl>

            {publicationBlockers.length > 0 ? (
              <div role="status" className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-semibold">Before this album can be published:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {publicationBlockers.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
            ) : (
              <p role="status" className="mt-5 text-sm font-semibold text-admin-fg-primary">
                Privacy and photo requirements are satisfied. This saved album is ready to publish.
              </p>
            )}

            <p className="mt-5 text-sm text-admin-fg-secondary">
              Review consent and permissions before approving privacy. Save photo edits first; privacy actions reload the saved album.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" disabled={saving || hasUnsavedPhotoChanges} className="btn-admin-secondary" onClick={() => performAction('setPrivacy', { privacyReviewStatus: 'approved' })}>Approve privacy</button>
              <button type="button" disabled={saving || hasUnsavedPhotoChanges} className="btn-admin-secondary" onClick={() => performAction('setPrivacy', { privacyReviewStatus: 'not_required' })}>No privacy review needed</button>
              <button type="button" disabled={saving || hasUnsavedPhotoChanges} className="btn-admin-secondary" onClick={() => performAction('setPrivacy', { privacyReviewStatus: 'restricted' })}>Restrict</button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {status !== 'published' && status !== 'archived' && (
                <button type="button" disabled={saving || publicationBlockers.length > 0} className="btn-admin-primary" onClick={() => performAction('publish')}>Publish album</button>
              )}
              {status === 'archived' ? (
                <button type="button" disabled={saving} className="btn-admin-secondary" onClick={() => performAction('restore')}>Restore to draft</button>
              ) : (
                <button type="button" disabled={saving} className="btn-admin-secondary" onClick={() => performAction('archive')}>Archive album</button>
              )}
              {status === 'published' && (
                featured ? (
                  <button type="button" disabled={saving} className="btn-admin-secondary" onClick={() => performAction('unfeature')}>Remove homepage feature</button>
                ) : (
                  <button type="button" disabled={saving} className="btn-admin-secondary" onClick={() => performAction('feature')}>Feature on homepage</button>
                )
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
