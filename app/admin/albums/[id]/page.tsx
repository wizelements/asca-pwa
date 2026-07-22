'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';
import AdminImageField from '@/components/AdminImageField';
import MediaManager, { type ManagedMediaItem } from '@/components/gallery/MediaManager';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface EventOption {
  id: number;
  title: string;
}

export default function AdminAlbumEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [eventId, setEventId] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('draft');
  const [sortOrder, setSortOrder] = useState(0);
  const [coverId, setCoverId] = useState<string | null>(null);
  const [media, setMedia] = useState<ManagedMediaItem[]>([]);
  const [newMedia, setNewMedia] = useState<Array<{ dataUrl: string; altText: string; caption: string }>>([]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchEvents();
    if (!isNew) fetchAlbum();
  }, [id]);

  const token = () => getAdminToken() || '';

  const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

  const fetchCategories = async () => {
    const res = await fetch('/api/gallery/categories', { headers: authHeaders() });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events', { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setEvents(Array.isArray(data) ? data.map((e: any) => ({ id: e.id, title: e.title })) : []);
    } catch {
      setEvents([]);
    }
  };

  const fetchAlbum = async () => {
    try {
      const res = await fetch(`/api/gallery/albums?slug=${encodeURIComponent(id)}`, { headers: authHeaders() });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Album not found');
      const data = await res.json();
      setTitle(data.title || '');
      setSlug(data.slug || '');
      setCategoryId(String(data.categoryId || ''));
      setEventId(data.eventId ? String(data.eventId) : '');
      setActivityDate(data.activityDate ? new Date(data.activityDate).toISOString().split('T')[0] : '');
      setLocation(data.location || '');
      setSummary(data.summary || '');
      setFeatured(Boolean(data.featured));
      setStatus(data.status || 'draft');
      setSortOrder(data.sortOrder ?? 0);
      setCoverId(data.coverMediaAssetId || (data.media?.[0]?.mediaAssetId ?? null));
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
      setError('Unable to load album.');
    } finally {
      setLoading(false);
    }
  };

  const uploadNewMedia = async (): Promise<ManagedMediaItem[]> => {
    const uploaded: ManagedMediaItem[] = [];
    for (const item of newMedia) {
      if (!item.dataUrl) continue;
      const res = await fetch('/api/gallery/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ dataUrl: item.dataUrl }),
      });
      if (!res.ok) throw new Error(`Media upload failed: ${(await res.json()).error || res.statusText}`);
      const asset = await res.json();
      uploaded.push({
        mediaAssetId: asset.id,
        url: asset.url,
        altText: item.altText,
        caption: item.caption || null,
        sortOrder: 0,
      });
    }
    return uploaded;
  };

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const uploaded = await uploadNewMedia();
      const allMedia = [...media, ...uploaded].map((m, i) => ({ ...m, sortOrder: i * 10 }));

      const payload: any = {
        title,
        slug,
        categoryId: Number(categoryId),
        eventId: eventId ? Number(eventId) : null,
        activityDate: activityDate || null,
        location: location || null,
        summary: summary || null,
        featured,
        sortOrder: Number(sortOrder),
        coverMediaAssetId: coverId,
        status,
      };

      if (isNew) {
        payload.media = allMedia.map((m) => ({
          mediaAssetId: m.mediaAssetId,
          altText: m.altText,
          caption: m.caption,
          sortOrder: m.sortOrder,
        }));
      } else {
        payload.mediaUpdates = {
          reorder: allMedia.map((m) => ({ mediaAssetId: m.mediaAssetId, sortOrder: m.sortOrder })),
        };
      }

      const res = await fetch('/api/gallery/albums', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Save failed');

      if (publish && !isNew) {
        const pubRes = await fetch('/api/gallery/albums', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ id: result.id, action: 'publish' }),
        });
        const pubResult = await pubRes.json();
        if (!pubRes.ok) throw new Error(pubResult.error || 'Publish failed');
        setStatus('published');
        setMessage('Album saved and published.');
      } else {
        setMessage('Album saved.');
      }

      if (isNew) router.push(`/admin/albums/${result.slug}`);
      else {
        setNewMedia([]);
        setMedia(allMedia);
      }
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminShell pageTitle="Edit Album"><p>Loading...</p></AdminShell>;

  return (
    <AdminShell pageTitle={isNew ? 'Create Album' : 'Edit Album'}>
      {message && <p className="mb-4 rounded-md bg-green-100 p-3 text-green-800">{message}</p>}
      {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-red-800">{error}</p>}
      <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-3xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Title</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Slug</label>
          <input className="form-input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Category</label>
          <select className="form-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Related event (optional)</label>
          <select className="form-input" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">None</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Activity date</label>
          <input type="date" className="form-input" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Location</label>
          <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Summary</label>
          <textarea className="form-input" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Sort order</label>
          <input type="number" className="form-input" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-3">
          <input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          <label htmlFor="featured" className="text-sm font-medium text-admin-fg-secondary">Featured on homepage</label>
        </div>

        {!isNew && (
          <div className="rounded-md border border-admin-border-subtle p-4">
            <h3 className="mb-2 text-sm font-semibold text-admin-fg-primary">Media</h3>
            <MediaManager media={media} coverId={coverId} onChange={setMedia} onCoverChange={setCoverId} />
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
