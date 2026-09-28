'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { logout, useAuth } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { useToast } from '@/components/admin/ToastProvider';

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
  deletedAt?: string | null;
}

const PAGE_SIZE = 20;

export default function AdminAlbumsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    void fetchAlbums(page, statusFilter);
  }, [page, statusFilter]);

  const fetchAlbums = async (currentPage: number, status: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(currentPage), pageSize: String(PAGE_SIZE) });
      if (status) params.set('status', status);
      const res = await fetch('/api/gallery/albums?' + params.toString(), {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (res.status === 401) {
        await logout();
        return;
      }
      if (!res.ok) throw new Error('Unable to load albums');
      const data = await res.json();
      const total = Number(res.headers.get('X-Total-Count') || (Array.isArray(data) ? data.length : 0));
      setAlbums(Array.isArray(data) ? data : []);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch {
      setError('Unable to load albums.');
    } finally {
      setLoading(false);
    }
  };

  const action = async (id: number, actionName: string) => {
    try {
      const res = await fetch('/api/gallery/albums', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: actionName }),
      });
      if (res.status === 401) {
        await logout();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(typeof data.error === 'string' ? data.error : 'Action failed');
        return;
      }

      const labels: Record<string, string> = {
        publish: 'Album published',
        archive: 'Album archived',
        restore: 'Album restored to draft',
        restoreTrash: 'Album restored from trash',
        feature: 'Album featured',
        unfeature: 'Album unfeatured',
      };
      toast.success(labels[actionName] || 'Album updated');
      await fetchAlbums(page, statusFilter);
    } catch {
      toast.error('Action failed');
    }
  };

  const moveToTrash = async (album: Album) => {
    if (!confirm('Move "' + album.title + '" to trash? It can be restored later.')) return;
    try {
      const res = await fetch('/api/gallery/albums?id=' + album.id, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (res.status === 401) {
        await logout();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(typeof data.error === 'string' ? data.error : 'Unable to move album to trash');
        return;
      }
      toast.success('Album moved to trash');
      await fetchAlbums(page, statusFilter);
    } catch {
      toast.error('Unable to move album to trash');
    }
  };

  const changeFilter = (value: string) => {
    setPage(1);
    setStatusFilter(value);
  };

  const viewingTrash = statusFilter === 'trash';

  return (
    <AdminShell
      pageTitle="Gallery albums"
      primaryAction={<Link href="/admin/albums/new" className="btn-admin-primary">Create album</Link>}
    >
      <div className="mb-5 max-w-3xl">
        <p className="text-sm leading-6 text-admin-fg-secondary">
          Organize activity photos into albums. Editors can prepare content; administrators review privacy, publish, feature, archive, and restore.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="album-status-filter" className="text-sm font-medium text-admin-fg-secondary">Show:</label>
        <select
          id="album-status-filter"
          value={statusFilter}
          onChange={(event) => changeFilter(event.target.value)}
          className="rounded-md border border-admin-border-subtle bg-admin-surface px-3 py-2 text-sm text-admin-fg-primary"
        >
          <option value="">All active albums</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
          {isAdmin && <option value="trash">Trash</option>}
        </select>
      </div>

      {loading && (
        <div className="space-y-2" role="status" aria-label="Loading albums">
          {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-md bg-admin-bg-subtle" />)}
        </div>
      )}
      {error && <div role="alert" className="mb-4 rounded-md bg-red-100 p-3 text-red-800">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-admin-border-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-bg-subtle text-admin-fg-secondary">
              <tr>
                <th scope="col" className="px-4 py-3">Album</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Privacy</th>
                <th scope="col" className="px-4 py-3">Photos</th>
                <th scope="col" className="px-4 py-3">Homepage</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-subtle">
              {albums.map((album) => (
                <tr key={album.id} className="hover:bg-admin-bg-subtle/50">
                  <td className="px-4 py-3 font-medium text-admin-fg-primary">
                    {viewingTrash ? album.title : (
                      <Link href={'/admin/albums/' + album.id} className="hover:underline">{album.title}</Link>
                    )}
                  </td>
                  <td className="px-4 py-3">{album.category?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize">{viewingTrash ? 'trashed' : album.status}</td>
                  <td className="px-4 py-3 capitalize">{album.privacyReviewStatus.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{album.mediaCount}</td>
                  <td className="px-4 py-3">{album.featured ? 'Featured' : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {viewingTrash ? (
                        isAdmin && (
                          <button onClick={() => action(album.id, 'restoreTrash')} className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200">
                            Restore
                          </button>
                        )
                      ) : (
                        <>
                          <Link href={'/admin/albums/' + album.id} className="rounded-md bg-admin-bg-subtle px-2.5 py-1 text-xs font-medium text-admin-fg-primary hover:bg-admin-border-subtle">
                            Edit
                          </Link>
                          {isAdmin && album.status === 'archived' && (
                            <button onClick={() => action(album.id, 'restore')} className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-200">
                              Restore draft
                            </button>
                          )}
                          {isAdmin && album.status === 'draft' && (
                            <button onClick={() => action(album.id, 'publish')} className="rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-900 hover:bg-green-200">
                              Publish
                            </button>
                          )}
                          {isAdmin && album.status !== 'archived' && (
                            <button onClick={() => action(album.id, 'archive')} className="rounded-md bg-admin-bg-subtle px-2.5 py-1 text-xs font-medium text-admin-fg-secondary hover:bg-admin-border-subtle">
                              Archive
                            </button>
                          )}
                          {isAdmin && album.status === 'published' && (
                            album.featured ? (
                              <button onClick={() => action(album.id, 'unfeature')} className="rounded-md bg-admin-bg-subtle px-2.5 py-1 text-xs font-medium text-admin-fg-secondary hover:bg-admin-border-subtle">
                                Unfeature
                              </button>
                            ) : (
                              <button onClick={() => action(album.id, 'feature')} className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-900 hover:bg-blue-200">
                                Feature
                              </button>
                            )
                          )}
                          {isAdmin && album.status === 'archived' && (
                            <button onClick={() => void moveToTrash(album)} className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-900 hover:bg-red-200">
                              Move to trash
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {albums.length === 0 && (
            statusFilter ? (
              <AdminEmptyState
                illustration="search"
                title={viewingTrash ? 'Trash is empty' : 'No albums match this filter'}
                description={viewingTrash ? 'Deleted albums will appear here until they are restored or purged through maintenance tooling.' : 'Try viewing albums with a different status.'}
                secondaryAction={{ label: 'Show active albums', onClick: () => changeFilter('') }}
              />
            ) : (
              <AdminEmptyState
                illustration="albums"
                title="No albums yet"
                description="Create the first album, add photos, review privacy, and publish when it is ready."
                action={{ label: 'Create album', href: '/admin/albums/new' }}
              />
            )
          )}
        </div>
      )}

      <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminShell>
  );
}
