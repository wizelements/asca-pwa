'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';
import AdminImageField from '@/components/AdminImageField';
import MediaManager, { type ManagedMediaItem } from '@/components/gallery/MediaManager';
import { useToast } from '@/components/admin/ToastProvider';

export default function AdminHorseEditPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [media, setMedia] = useState<ManagedMediaItem[]>([]);
  const [newMedia, setNewMedia] = useState<Array<{ dataUrl: string; altText: string; caption: string }>>([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) fetchHorse();
  }, [id]);

  const token = () => getAdminToken() || '';

  const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

  const fetchHorse = async () => {
    try {
      const res = await fetch(`/api/gallery/horses?id=${id}`, { headers: authHeaders() });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Horse not found');
      const data = await res.json();
      setName(data.name || '');
      setSlug(data.slug || '');
      setDescription(data.description || '');
      setSortOrder(data.sortOrder ?? 0);
      setPrimaryId(data.primaryMediaAssetId || (data.media?.[0]?.mediaAssetId ?? null));
      setMedia(
        Array.isArray(data.media)
          ? data.media.map((m: any, idx: number) => ({
              mediaAssetId: m.mediaAssetId,
              url: m.url,
              altText: m.altText || '',
              caption: m.caption ?? null,
              sortOrder: m.sortOrder ?? idx * 10,
            }))
          : []
      );
    } catch {
      setError('Unable to load horse profile.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMediaAsset = async (assetId: string) => {
    await fetch(`/api/gallery/media?id=${assetId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
  };

  const uploadNewMedia = async (): Promise<ManagedMediaItem[]> => {
    const entries = newMedia.filter((item) => item.dataUrl);
    if (entries.length === 0) return [];

    const results = await Promise.allSettled(
      entries.map(async (item, idx) => {
        const res = await fetch('/api/gallery/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ dataUrl: item.dataUrl }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(`Image ${idx + 1}: ${body.error || res.statusText}`);
        }
        const asset = await res.json();
        return {
          mediaAssetId: asset.id,
          url: asset.url,
          altText: item.altText,
          caption: item.caption || null,
          sortOrder: 0,
        };
      })
    );

    const uploaded: ManagedMediaItem[] = [];
    const errors: string[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') uploaded.push(result.value);
      else errors.push(result.reason?.message || 'Upload failed');
    }

    if (errors.length > 0) {
      await Promise.all(uploaded.map((m) => deleteMediaAsset(m.mediaAssetId)));
      throw new Error(
        `Image upload failed: ${errors.join('; ')}${uploaded.length > 0 ? ' Successful parallel uploads were rolled back.' : ''}`
      );
    }

    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const uploaded = await uploadNewMedia();
      const allMedia = [...media, ...uploaded].map((m, i) => ({ ...m, sortOrder: i * 10 }));

      const payload: any = {
        name,
        slug,
        description: description || null,
        sortOrder: Number(sortOrder),
        primaryMediaAssetId: primaryId,
      };

      if (isNew) {
        payload.media = allMedia.map((m) => ({
          mediaAssetId: m.mediaAssetId,
          altText: m.altText,
          caption: m.caption,
          sortOrder: m.sortOrder,
        }));
      } else {
        payload.id = Number(id);
        payload.mediaUpdates = {
          reorder: allMedia.map((m) => ({ mediaAssetId: m.mediaAssetId, sortOrder: m.sortOrder })),
        };
      }

      const res = await fetch('/api/gallery/horses', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Save failed');

      if (publish && !isNew) {
        const pubRes = await fetch('/api/gallery/horses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ id: result.id, action: 'publish' }),
        });
        const pubResult = await pubRes.json();
        if (!pubRes.ok) throw new Error(pubResult.error || 'Publish failed');
        toast.success(uploaded.length > 0
          ? `Horse profile saved and published with ${uploaded.length} new ${uploaded.length === 1 ? 'image' : 'images'}.`
          : 'Horse profile saved and published.');
      } else {
        toast.success(uploaded.length > 0
          ? `Horse profile saved with ${uploaded.length} new ${uploaded.length === 1 ? 'image' : 'images'}.`
          : isNew ? 'Horse profile created.' : 'Horse profile saved.');
      }

      if (isNew) router.push(`/admin/horses/${result.id}`);
      else {
        setNewMedia([]);
        setMedia(allMedia);
      }
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminShell pageTitle="Edit Horse"><p>Loading...</p></AdminShell>;

  return (
    <AdminShell pageTitle={isNew ? 'Create Horse Profile' : 'Edit Horse Profile'}>
      {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-red-800">{error}</p>}
      <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-3xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Name</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Slug</label>
          <input className="form-input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Description</label>
          <textarea className="form-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Sort order</label>
          <input type="number" className="form-input" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>

        {!isNew && (
          <div className="rounded-md border border-admin-border-subtle p-4">
            <h3 className="mb-2 text-sm font-semibold text-admin-fg-primary">Media</h3>
            <MediaManager media={media} coverId={primaryId} onChange={setMedia} onCoverChange={setPrimaryId} coverLabel="Primary" />
          </div>
        )}

        <div className="rounded-md border border-admin-border-subtle p-4">
          <h3 className="mb-2 text-sm font-semibold text-admin-fg-primary">Add new images</h3>
          {newMedia.map((item, idx) => (
            <div key={idx} className="mb-3 space-y-2">
              <AdminImageField
                label="Image"
                value={item.dataUrl}
                onChange={(url) => {
                  const next = [...newMedia];
                  next[idx].dataUrl = url;
                  setNewMedia(next);
                }}
              />
              <input placeholder="Alt text" className="form-input" value={item.altText} onChange={(e) => {
                const next = [...newMedia]; next[idx].altText = e.target.value; setNewMedia(next);
              }} />
              <input placeholder="Caption" className="form-input" value={item.caption} onChange={(e) => {
                const next = [...newMedia]; next[idx].caption = e.target.value; setNewMedia(next);
              }} />
            </div>
          ))}
          <button type="button" className="text-sm text-blue-700 hover:underline" onClick={() => setNewMedia([...newMedia, { dataUrl: '', altText: '', caption: '' }])}>+ Add another image</button>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-admin-primary">{saving ? 'Saving...' : 'Save draft'}</button>
          {!isNew && (
            <button type="button" disabled={saving} onClick={(e) => handleSubmit(e as any, true)} className="btn-admin-secondary">
              {saving ? 'Saving...' : 'Save & publish'}
            </button>
          )}
        </div>
      </form>
    </AdminShell>
  );
}
