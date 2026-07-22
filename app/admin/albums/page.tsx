'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';
import AdminPagination from '@/components/admin/AdminPagination';

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

const PAGE_SIZE = 20;

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1);
    fetchAlbums(1, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    fetchAlbums(page, statusFilter);
  }, [page]);

  const fetchAlbums = async (p: number, status: string) => {
    setLoading(true);
    setError('');
    const token = getAdminToken();
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
      if (status) params.set('status', status);
      const res = await fetch(`/api/gallery/albums?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Failed to load albums');
      const data = await res.json();
      const totalHeader = res.headers.get('X-Total-Count');
      const total = totalHeader ? Number(totalHeader) : data.length;
      setAlbums(Array.isArray(data) ? data : []);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
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
      setError(err.error || 'Action failed');
      return;
    }
    fetchAlbums(page, statusFilter);
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

      {loading && <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-md bg-admin-bg-subtle" />)}</div>}
      {error && <div className="mb-4 rounded-md bg-red-100 p-3 text-red-800">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-admin-border-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-bg-subtle text-admin-fg-secondary">
              <tr>
                <th scope="col" className="px-4 py-3">Title</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Privacy</th>
                <th scope="col" className="px-4 py-3">Featured</th>
                <th scope="col" className="px-4 py-3">Media</th>
                <th scope="col" className="px-4 py-3">Actions</th>
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
                        <button
                          onClick={() => action(album.id, 'publish')}
                          className="rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                        >
                          Publish
                        </button>
                      )}
                      {album.status !== 'archived' && (
                        <button
                          onClick={() => action(album.id, 'archive')}
                          className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                        >
                          Archive
                        </button>
                      )}
                      {album.featured ? (
                        <button
                          onClick={() => action(album.id, 'unfeature')}
                          className="rounded-md bg-admin-bg-subtle px-2.5 py-1 text-xs font-medium text-admin-fg-secondary hover:bg-admin-border-subtle"
                        >
                          Unfeature
                        </button>
                      ) : (
                        <button
                          onClick={() => action(album.id, 'feature')}
                          className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                        >
                          Feature
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {albums.length === 0 && (
            <div className="p-8 text-center text-admin-fg-muted">
              No albums found. <Link href="/admin/albums/new" className="text-brand-forest hover:underline">Create one</Link>.
            </div>
          )}
        </div>
      )}

      <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminShell>
  );
}
