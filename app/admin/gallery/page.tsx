'use client';

import { useEffect, useState } from 'react';

import AdminImageField from '@/components/AdminImageField';
import { getAdminToken, logout } from '@/components/AdminGuard';

interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  category: string;
  image: string;
  alt: string;
  uploadedAt?: string;
}

interface GalleryFormState {
  title: string;
  description: string;
  category: string;
  image: string;
  alt: string;
}

const emptyGalleryItem: GalleryFormState = {
  title: '',
  description: '',
  category: 'Gallery',
  image: '',
  alt: '',
};

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<GalleryFormState>(emptyGalleryItem);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/gallery/crud', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError('Unable to load gallery images.');
        return;
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load gallery images.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyGalleryItem);
    setMessage('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'Gallery',
      image: item.image || '',
      alt: item.alt || '',
    });
    setMessage('');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const token = getAdminToken();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim() || 'Gallery',
      image: form.image.trim(),
      alt: form.alt.trim(),
    };

    try {
      const res = await fetch('/api/gallery/crud', {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Unable to save gallery image.');
        return;
      }
      await fetchGallery();
      setModalOpen(false);
      setMessage(editing ? 'Gallery image updated.' : 'Gallery image added.');
    } catch {
      setError('Unable to save gallery image.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Delete ${item.title}?`)) return;
    const token = getAdminToken();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/gallery/crud?id=${item.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError('Unable to delete gallery image.');
        return;
      }
      await fetchGallery();
      setMessage('Gallery image deleted.');
    } catch {
      setError('Unable to delete gallery image.');
    }
  };

  if (loading) return <div className="p-8">Loading gallery...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Gallery</h1>
          <p className="mt-1 text-sm text-brand-fg-secondary">Manage public gallery images by path or URL. Alt text is required.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-brand-forest px-6 py-2 font-semibold text-white hover:bg-brand-forest-muted">
          + Add Image
        </button>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      {items.length === 0 ? (
        <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-10 text-center text-brand-fg-muted">
          No gallery images in the database yet. The public gallery will use static fallback images until items are added here.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="card overflow-hidden p-0">
              <div className="relative aspect-[4/3] bg-brand-bg-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.alt} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-forest">{item.category}</p>
                <h2 className="mt-2 text-lg font-bold text-brand-fg-primary">{item.title}</h2>
                {item.description && <p className="mt-2 line-clamp-2 text-sm text-brand-fg-secondary">{item.description}</p>}
                <p className="mt-3 text-xs text-brand-fg-muted">Alt: {item.alt}</p>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => openEdit(item)} className="rounded-lg bg-brand-forest px-3 py-1 text-sm text-white hover:bg-brand-forest-muted">Edit</button>
                  <button onClick={() => handleDelete(item)} className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-brand-bg-elevated p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-brand-fg-primary">{editing ? 'Edit Gallery Image' : 'Add Gallery Image'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" required />
              </div>
              <div>
                <AdminImageField
                  label="Image path, URL, or upload"
                  value={form.image}
                  onChange={(image) => setForm({ ...form, image })}
                  required
                  previewAlt={form.alt || 'Gallery image preview'}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Alt Text *</label>
                <input type="text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-brand-border-subtle px-6 py-2 text-brand-fg-primary hover:bg-brand-bg-subtle">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-brand-forest px-6 py-2 font-semibold text-white hover:bg-brand-forest-muted disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update Image' : 'Add Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
