'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';

interface Album {
  id: number;
  title: string;
  slug: string;
  category: { id: number; name: string; slug: string } | null;
  status: 'draft' | 'published' | 'archived';
  privacyReviewStatus: string;
  featured: boolean;
  mediaCount: number;
  coverUrl: string | null;
  sortOrder: number;
}

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAlbums();
  }, [statusFilter]);

  const fetchAlbums = async () => {
    setLoading(true);
    setError('');
    const token = getAdminToken();
    try {
      const url = statusFilter ? `/api/gallery/albums?status=${statusFilter}` : '/api/gallery/albums';
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Failed to load albums');
      const data = await res.json();
      setAlbums(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Unable to load albums.');
    } finally {
      setLoading(false);
    }
  };

  const action = async (id: number, actionName: string, extra?: any) => {
    const token = getAdminToken();
    const body: any = { id, action: actionName };
    if (extra) Object.assign(body, extra);
    const res = await fetch('/api/gallery/albums', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Action failed');
      return;
    }
    fetchAlbums();
  };

  return (
    <AdminShell pageTitle="Albums" primaryAction={<Link href="/admin/albums/new" className="btn-admin-primary">Create album</Link>}>
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-admin-fg-secondary">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-admin-border-subtle bg-admin-surface px-3 py-2 text-sm text-admin-fg-primary"
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading && <p className="text-admin-fg-muted">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-admin-border-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-bg-subtle text-admin-fg-secondary">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Privacy</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Media</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-subtle">
              {albums.map((album) => (
                <tr key={album.id} className="hover:bg-admin-bg-subtle/50">
                  <td className="px-4 py-3 font-medium text-admin-fg-primary">
                    <Link href={`/admin/albums/${album.id}`} className="hover:underline">
                      {album.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{album.category?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize">{album.status}</td>
                  <td className="px-4 py-3 capitalize">{album.privacyReviewStatus}</td>
                  <td className="px-4 py-3">{album.featured ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{album.mediaCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {album.status !== 'published' && (
                        <button onClick={() => action(album.id, 'publish')} className="text-xs font-medium text-green-700 hover:underline">Publish</button>
                      )}
                      {album.status !== 'archived' && (
                        <button onClick={() => action(album.id, 'archive')} className="text-xs font-medium text-red-700 hover:underline">Archive</button>
                      )}
                      {album.featured ? (
                        <button onClick={() => action(album.id, 'unfeature')} className="text-xs font-medium text-admin-fg-muted hover:underline">Unfeature</button>
                      ) : (
                        <button onClick={() => action(album.id, 'feature')} className="text-xs font-medium text-blue-700 hover:underline">Feature</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {albums.length === 0 && <p className="p-8 text-center text-admin-fg-muted">No albums found.</p>}
        </div>
      )}
    </AdminShell>
  );
}
