'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';
import AdminImageField from '@/components/AdminImageField';

interface Horse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  primaryMediaAssetId: string | null;
  status: string;
  sortOrder: number;
  media: Array<{ mediaAssetId: string; sortOrder: number; caption: string | null; altText: string; url: string }>;
}

export default function AdminHorseEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [horse, setHorse] = useState<Partial<Horse>>({ name: '', slug: '', description: '', primaryMediaAssetId: null, status: 'draft', sortOrder: 0 });
  const [newMedia, setNewMedia] = useState<Array<{ dataUrl: string; altText: string; caption: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isNew) fetchHorse();
  }, [id]);

  const token = () => getAdminToken() || '';

  const fetchHorse = async () => {
    try {
      const res = await fetch(`/api/gallery/horses?id=${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Horse not found');
      const data = await res.json();
      setHorse(data);
    } catch {
      setError('Unable to load horse profile.');
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
        ...horse,
        sortOrder: Number(horse.sortOrder ?? 0),
        media: uploaded,
      };

      const res = await fetch('/api/gallery/horses', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Save failed');
      setMessage('Horse profile saved.');
      if (isNew) router.push(`/admin/horses/${result.id}`);
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminShell pageTitle="Edit Horse"><p>Loading...</p></AdminShell>;

  return (
    <AdminShell pageTitle={isNew ? 'Create Horse Profile' : 'Edit Horse Profile'}>
      {message && <p className="mb-4 rounded-md bg-green-100 p-3 text-green-800">{message}</p>}
      {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-red-800">{error}</p>}
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Name</label>
          <input className="form-input" value={horse.name || ''} onChange={(e) => setHorse({ ...horse, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Slug</label>
          <input className="form-input" value={horse.slug || ''} onChange={(e) => setHorse({ ...horse, slug: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Description</label>
          <textarea className="form-input" rows={4} value={horse.description || ''} onChange={(e) => setHorse({ ...horse, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-admin-fg-secondary">Sort order</label>
          <input type="number" className="form-input" value={horse.sortOrder ?? 0} onChange={(e) => setHorse({ ...horse, sortOrder: Number(e.target.value) })} />
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
