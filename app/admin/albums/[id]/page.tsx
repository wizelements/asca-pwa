'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';
import AdminImageField from '@/components/AdminImageField';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Album {
  id: number;
  title: string;
  slug: string;
  categoryId: number;
  eventId: number | null;
  activityDate: string | null;
  location: string | null;
  summary: string | null;
  coverMediaAssetId: string | null;
  featured: boolean;
  status: string;
  privacyReviewStatus: string;
  sortOrder: number;
  media: Array<{ mediaAssetId: string; sortOrder: number; caption: string | null; altText: string; url: string }>;
}

export default function AdminAlbumEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [categories, setCategories] = useState<Category[]>([]);
  const [album, setAlbum] = useState<Partial<Album>>({
    title: '', slug: '', categoryId: 0, location: '', summary: '', featured: false,
    status: 'draft', privacyReviewStatus: 'not_required', sortOrder: 0,
  });
  const [newMedia, setNewMedia] = useState<Array<{ dataUrl: string; altText: string; caption: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCategories();
    if (!isNew) fetchAlbum();
  }, [id]);

  const token = () => getAdminToken() || '';

  const fetchCategories = async () => {
    const res = await fetch('/api/gallery/categories', { headers: { Authorization: `Bearer ${token()}` } });
    if (res.status === 401) { logout(); return; }
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  const fetchAlbum = async () => {
    try {
      const res = await fetch(`/api/gallery/albums?slug=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Album not found');
      const data = await res.json();
      setAlbum({
        ...data,
        activityDate: data.activityDate ? new Date(data.activityDate).toISOString().split('T')[0] : '',
      });
    } catch {
      setError('Unable to load album.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      // Upload any new media first.
      const uploaded = [];
      for (const item of newMedia) {
        if (!item.dataUrl) continue;
        const res = await fetch('/api/gallery/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({ dataUrl: item.dataUrl }),
        });
        if (!res.ok) throw new Error('Media upload failed');
        const asset = await res.json();
        uploaded.push({ mediaAssetId: asset.id, altText: item.altText, caption: item.caption || null });
      }

      const payload = {
        ...album,
        categoryId: Number(album.categoryId),
        sortOrder: Number(album.sortOrder ?? 0),
        featured: Boolean(album.featured),
        media: uploaded,
      };

      const res = await fetch('/api/gallery/albums', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Save failed');
      setMessage('Album saved.');
      if (isNew) router.push(`/admin/albums/${result.slug}`);
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
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Title</label>
          <input className="form-input" value={album.title || ''} onChange={(e) => setAlbum({ ...album, title: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Slug</label>
          <input className="form-input" value={album.slug || ''} onChange={(e) => setAlbum({ ...album, slug: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Category</label>
          <select className="form-input" value={album.categoryId || ''} onChange={(e) => setAlbum({ ...album, categoryId: Number(e.target.value) })} required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Location</label>
          <input className="form-input" value={album.location || ''} onChange={(e) => setAlbum({ ...album, location: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Activity date</label>
          <input type="date" className="form-input" value={album.activityDate || ''} onChange={(e) => setAlbum({ ...album, activityDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Summary</label>
          <textarea className="form-input" rows={3} value={album.summary || ''} onChange={(e) => setAlbum({ ...album, summary: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Sort order</label>
          <input type="number" className="form-input" value={album.sortOrder ?? 0} onChange={(e) => setAlbum({ ...album, sortOrder: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-3">
          <input id="featured" type="checkbox" checked={!!album.featured} onChange={(e) => setAlbum({ ...album, featured: e.target.checked })} />
          <label htmlFor="featured" className="text-sm font-medium text-admin-fg-secondary">Featured on homepage</label>
        </div>

        {!isNew && (
          <div className="rounded-md border border-admin-border-subtle p-4">
            <h3 className="mb-2 text-sm font-semibold text-admin-fg-primary">Add media</h3>
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
        )}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-admin-primary">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </AdminShell>
  );
}
