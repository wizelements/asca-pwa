'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { getAdminToken, logout, useAuth } from '@/components/AdminGuard';
import AdminImageField from '@/components/AdminImageField';
import MediaManager, { type ManagedMediaItem } from '@/components/gallery/MediaManager';
import { useToast } from '@/components/admin/ToastProvider';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { slugify } from '@/lib/gallery/slug';

export default function AdminHorseEditPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';
  const isAdmin = user?.role === 'admin';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [media, setMedia] = useState<ManagedMediaItem[]>([]);
  const [originalMediaIds, setOriginalMediaIds] = useState<string[]>([]);
  const [newMedia, setNewMedia] = useState<Array<{ dataUrl: string; altText: string; caption: string }>>([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');

  const removedMediaIds = useMemo(
    () => originalMediaIds.filter((mediaAssetId) => !media.some((item) => item.mediaAssetId === mediaAssetId)),
    [originalMediaIds, media]
  );

  useEffect(() => {
    if (!isNew) void fetchHorse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const token = () => getAdminToken() || '';
  const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

  const fetchHorse = async () => {
    try {
      setError('');
      const res = await fetch(`/api/gallery/horses?id=${id}`, { headers: authHeaders() });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Horse not found');
      const data = await res.json();
      const nextMedia: ManagedMediaItem[] = Array.isArray(data.media)
        ? data.media.map((m: any, idx: number) => ({
            mediaAssetId: m.mediaAssetId,
            url: m.url,
            altText: m.altText || '',
            caption: m.caption ?? null,
            sortOrder: m.sortOrder ?? idx * 10,
          }))
        : [];

      setName(data.name || '');
      setSlug(data.slug || '');
      setSlugTouched(true);
      setDescription(data.description || '');
      setSortOrder(data.sortOrder ?? 0);
      setStatus(data.status || 'draft');
      setPrimaryId(data.primaryMediaAssetId || nextMedia[0]?.mediaAssetId || null);
      setMedia(nextMedia);
      setOriginalMediaIds(nextMedia.map((item) => item.mediaAssetId));
    } catch {
      setError('Unable to load horse profile.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMediaAsset = async (assetId: string) => {
    await fetch(`/api/gallery/media?id=${encodeURIComponent(assetId)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).catch(() => undefined);
  };

  const uploadNewMedia = async (): Promise<ManagedMediaItem[]> => {
    const entries = newMedia.filter((item) => item.dataUrl);
    if (entries.length === 0) return [];

    const missingAlt = entries.find((item) => !item.altText.trim());
    if (missingAlt) throw new Error('Add descriptive alt text for every new horse image before saving.');

    const results = await Promise.allSettled(
      entries.map(async (item, idx) => {
        const res = await fetch('/api/gallery/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ dataUrl: item.dataUrl }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`Image ${idx + 1}: ${body.error || res.statusText}`);
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

    if (errors.length > 0) {
      await Promise.all(uploaded.map((item) => deleteMediaAsset(item.mediaAssetId)));
      throw new Error(`Image upload failed: ${errors.join('; ')}`);
    }

    return uploaded;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (isNew && !slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    if (publish && !isAdmin) return;

    setSaving(true);
    setError('');

    let uploaded: ManagedMediaItem[] = [];
    try {
      if (!name.trim()) throw new Error('Horse name is required.');
      if (!slug.trim()) throw new Error('Page URL is required.');
      if (media.some((item) => !item.altText.trim())) {
        throw new Error('Every existing horse image needs descriptive alt text before saving.');
      }

      uploaded = await uploadNewMedia();
      const allMedia = [...media, ...uploaded].map((item, index) => ({ ...item, sortOrder: index * 10 }));
      const nextPrimary = primaryId && allMedia.some((item) => item.mediaAssetId === primaryId)
        ? primaryId
        : allMedia[0]?.mediaAssetId ?? null;

      const payload: any = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        sortOrder: Number(sortOrder) || 0,
        primaryMediaAssetId: nextPrimary,
      };

      if (isNew) {
        payload.media = allMedia.map((item) => ({
          mediaAssetId: item.mediaAssetId,
          altText: item.altText.trim(),
          caption: item.caption || null,
          sortOrder: item.sortOrder,
        }));
      } else {
        payload.id = Number(id);
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

      const res = await fetch('/api/gallery/horses', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (uploaded.length) await Promise.all(uploaded.map((item) => deleteMediaAsset(item.mediaAssetId)));
        throw new Error(typeof result.error === 'string' ? result.error : 'Unable to save horse profile.');
      }

      if (publish && !isNew) {
        const pubRes = await fetch('/api/gallery/horses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ id: result.id, action: 'publish' }),
        });
        const pubResult = await pubRes.json().catch(() => ({}));
        if (!pubRes.ok) throw new Error(typeof pubResult.error === 'string' ? pubResult.error : 'Publish failed');
        toast.success('Horse profile saved and published. It is now visible on the public Our Horses page.');
      } else if (status === 'published') {
        toast.success('Horse profile saved. Because this profile is already published, the public page now uses these changes.');
      } else {
        toast.success(isNew ? 'Horse profile created as a draft.' : 'Horse profile changes saved as a draft.');
      }

      if (isNew) {
        router.push(`/admin/horses/${result.id}`);
      } else {
        setNewMedia([]);
        await fetchHorse();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader
          title={isNew ? 'Create horse profile' : 'Edit horse profile'}
          subtitle="Loading horse profile…"
        />
        <p className="text-admin-fg-muted">Loading...</p>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={isNew ? 'Create horse profile' : 'Edit horse profile'}
        subtitle={isNew
          ? 'Create the horse page as a draft first. Add photography and alt text, then publish only when the public profile is ready.'
          : 'Everything here controls the public horse profile. Drafts and archived profiles stay off the public site.'}
        primaryAction={!isNew && status === 'published' && slug ? (
          <Link
            href={`/horses/${slug}`}
            target="_blank"
            className="btn-admin-secondary"
          >
            View public horse page
          </Link>
        ) : undefined}
      />

      <div className="max-w-4xl space-y-5">
        {!isNew && (
          <div className={`rounded-xl border p-4 text-sm ${
            status === 'published'
              ? 'border-green-200 bg-green-50 text-green-900'
              : status === 'archived'
                ? 'border-gray-200 bg-gray-50 text-gray-800'
                : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}>
            <strong>Website visibility:</strong>{' '}
            {status === 'published'
              ? 'Public now. Saving changes updates the live horse profile.'
              : status === 'archived'
                ? 'Hidden from the public website until restored and published.'
                : 'Draft only. Visitors cannot see this horse profile yet.'}
          </div>
        )}

        {error && <p className="rounded-md bg-red-100 p-3 text-red-800">{error}</p>}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
            <h2 className="text-lg font-bold text-admin-fg-primary">Public profile details</h2>
            <p className="mt-1 text-sm text-admin-fg-secondary">Name, description, and photography are shown to visitors once the profile is published.</p>

            <div className="mt-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-admin-fg-secondary">Horse name</label>
                <input className="form-input mt-1" value={name} onChange={(e) => handleNameChange(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-fg-secondary">Public page address</label>
                <div className="mt-1 flex items-center rounded-md border border-admin-border-subtle bg-admin-bg-body px-3">
                  <span className="shrink-0 text-sm text-admin-fg-muted">/horses/</span>
                  <input
                    className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-sm text-admin-fg-primary outline-none"
                    value={slug}
                    onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                    required
                    aria-label="Horse public page address"
                  />
                </div>
                <p className="mt-1 text-xs text-admin-fg-muted">Generated from the horse name for new profiles. Change it only when the web address needs to be different.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-admin-fg-secondary">Description</label>
                <textarea className="form-input mt-1" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Introduce this horse to visitors." />
              </div>

              <details>
                <summary className="cursor-pointer text-sm font-semibold text-admin-fg-secondary">Advanced display order</summary>
                <div className="mt-3 max-w-xs">
                  <label className="block text-sm font-medium text-admin-fg-secondary">Display priority</label>
                  <input type="number" className="form-input mt-1" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
                  <p className="mt-1 text-xs text-admin-fg-muted">Lower numbers appear earlier on the public Our Horses page.</p>
                </div>
              </details>
            </div>
          </section>

          {!isNew && (
            <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
              <h2 className="text-lg font-bold text-admin-fg-primary">Current public photography</h2>
              <p className="mt-1 text-sm text-admin-fg-secondary">
                Reorder images, update captions and alt text, select the primary image, or remove images. Changes take effect after Save.
              </p>
              <div className="mt-5">
                <MediaManager media={media} coverId={primaryId} onChange={setMedia} onCoverChange={setPrimaryId} coverLabel="Primary" />
              </div>
            </section>
          )}

          <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
            <h2 className="text-lg font-bold text-admin-fg-primary">Add horse photography</h2>
            <p className="mt-1 text-sm text-admin-fg-secondary">
              Images are prepared locally first and are not added to the website until you save this horse profile. JPG, PNG, and WebP are supported.
            </p>

            <div className="mt-5 space-y-4">
              {newMedia.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-admin-border-subtle bg-admin-bg-body p-4">
                  <AdminImageField
                    label={`New image ${idx + 1}`}
                    value={item.dataUrl}
                    storageMode="inline"
                    showUrlInput={false}
                    helper="Choose the image here. It will be uploaded and attached to this horse only when you save."
                    onChange={(dataUrl) => {
                      const next = [...newMedia];
                      next[idx] = { ...next[idx], dataUrl };
                      setNewMedia(next);
                    }}
                    allowClear={Boolean(item.dataUrl)}
                    clearLabel="Remove selected image"
                  />
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-admin-fg-secondary">
                      Alt text *
                      <input
                        placeholder="Describe what is visible"
                        className="form-input mt-1"
                        value={item.altText}
                        onChange={(e) => {
                          const next = [...newMedia];
                          next[idx] = { ...next[idx], altText: e.target.value };
                          setNewMedia(next);
                        }}
                        required={Boolean(item.dataUrl)}
                      />
                    </label>
                    <label className="text-sm font-semibold text-admin-fg-secondary">
                      Public caption
                      <input
                        placeholder="Optional"
                        className="form-input mt-1"
                        value={item.caption}
                        onChange={(e) => {
                          const next = [...newMedia];
                          next[idx] = { ...next[idx], caption: e.target.value };
                          setNewMedia(next);
                        }}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-red-700 hover:underline"
                    onClick={() => setNewMedia((current) => current.filter((_, index) => index !== idx))}
                  >
                    Remove this upload
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setNewMedia((current) => [...current, { dataUrl: '', altText: '', caption: '' }])}
              >
                + Add image
              </button>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-admin-primary">
              {saving ? 'Saving…' : status === 'published' ? 'Save public changes' : 'Save draft'}
            </button>
            {!isNew && isAdmin && status !== 'published' && status !== 'archived' && (
              <button
                type="button"
                disabled={saving}
                onClick={(e) => void handleSubmit(e as any, true)}
                className="btn-admin-secondary"
              >
                {saving ? 'Saving…' : 'Save & publish'}
              </button>
            )}
            <button type="button" className="btn-admin-secondary" onClick={() => router.push('/admin/horses')}>
              Back to horses
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
