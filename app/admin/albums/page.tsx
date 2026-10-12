'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { logout, useAuth } from '@/components/AdminGuard';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
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
  visibility?: { eligible: boolean; reasons: string[] };
}

interface InventoryCounts {
  inventory: number;
  live: number;
  trash: number;
  legacyPhotos: number;
  matching: number;
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
  const [counts, setCounts] = useState<InventoryCounts>({ inventory: 0, live: 0, trash: 0, legacyPhotos: 0, matching: 0 });
  const [galleryEnabled, setGalleryEnabled] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void fetchAlbums(page, statusFilter, searchTerm);
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const fetchAlbums = async (currentPage: number, status: string, search = '') => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(currentPage), pageSize: String(PAGE_SIZE) });
      if (status) params.set('status', status);
      if (search) params.set('search', search);
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
      setCounts({
        inventory: Number(res.headers.get('X-Inventory-Count') || total),
        live: Number(res.headers.get('X-Public-Album-Count') || 0),
        trash: Number(res.headers.get('X-Trash-Count') || 0),
        legacyPhotos: Number(res.headers.get('X-Legacy-Photo-Count') || 0),
        matching: total,
      });
      setGalleryEnabled(res.headers.get('X-Album-Gallery-Enabled') === 'true');
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
      await fetchAlbums(page, statusFilter, searchTerm);
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
      await fetchAlbums(page, statusFilter, searchTerm);
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
    <>
      <AdminPageHeader
        title="Gallery albums"
        subtitle="Organize activity photos into albums. Editors prepare content; administrators review privacy and publication."
        primaryAction={<Link href="/admin/albums/new" className="btn-admin-primary">Create album</Link>}
      />
      <div className="mb-5 max-w-4xl space-y-3">
        <p className="text-sm leading-6 text-admin-fg-secondary">
          This inventory includes draft, published and archived albums. Only published albums with cleared privacy, an active category, attached photos and an attached cover appear on the public website.
        </p>
        <div className="grid gap-3 sm:grid-cols-3" aria-label="Gallery inventory counts">
          <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-3">
            <p className="text-xs text-admin-fg-secondary">Album records {isAdmin ? '(including trash)' : '(active)'}</p>
            <p className="text-2xl font-semibold text-admin-fg-primary">{counts.inventory}</p>
          </div>
          <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-3">
            <p className="text-xs text-admin-fg-secondary">Albums eligible for public gallery</p>
            <p className="text-2xl font-semibold text-admin-fg-primary">{counts.live}</p>
          </div>
          <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-3">
            <p className="text-xs text-admin-fg-secondary">Older individual gallery photos</p>
            <p className="text-2xl font-semibold text-admin-fg-primary">{counts.legacyPhotos}</p>
          </div>
        </div>
        <p className="text-sm text-admin-fg-secondary" role="status">
          {galleryEnabled
            ? 'The public site uses albums. Records marked Not on site below show why they have not appeared.'
            : 'The public website is still using the older gallery display; eligible albums need the album gallery activated to appear.'}
          {' '}<Link href="/admin/gallery" className="font-semibold underline">Review older gallery photos</Link>.
          {isAdmin && counts.trash > 0 && <> {counts.trash} album(s) are in trash; select Every album or Trash below to find them.</>}
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
          {isAdmin && <option value="all">Every album (including trash)</option>}
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
          {isAdmin && <option value="trash">Trash</option>}
        </select>
        <label htmlFor="album-search" className="sr-only">Search album title, category, or slug</label>
        <input
          id="album-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search album title or category"
          className="min-w-[12rem] flex-1 rounded-md border border-admin-border-subtle bg-admin-surface px-3 py-2 text-sm text-admin-fg-primary sm:max-w-sm"
        />
        <button
          type="button"
          onClick={() => void fetchAlbums(page, statusFilter, searchTerm)}
          className="rounded-md border border-admin-border-subtle px-3 py-2 text-sm font-medium text-admin-fg-primary hover:bg-admin-bg-subtle"
        >Refresh</button>
        <span className="text-xs text-admin-fg-secondary" role="status">{counts.matching} matching record(s)</span>
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
                <th scope="col" className="min-w-[12rem] px-4 py-3">Public site visibility</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-subtle">
              {albums.map((album) => (
                <tr key={album.id} className="hover:bg-admin-bg-subtle/50">
                  <td className="px-4 py-3 font-medium text-admin-fg-primary">
                    {album.deletedAt ? album.title : (
                      <Link href={'/admin/albums/' + album.id} className="hover:underline">{album.title}</Link>
                    )}
                  </td>
                  <td className="px-4 py-3">{album.category?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize">{album.deletedAt ? 'trashed' : album.status}</td>
                  <td className="px-4 py-3 capitalize">{album.privacyReviewStatus.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{album.mediaCount}</td>
                  <td className="px-4 py-3">{album.featured ? 'Featured' : '—'}</td>
                  <td className="px-4 py-3">
                    {galleryEnabled && album.visibility?.eligible ? (
                      <Link href={'/gallery/' + album.slug} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-700 underline">
                        Live — view album
                      </Link>
                    ) : (
                      <div className="space-y-1">
                        <span className="font-semibold text-amber-800">Not on public site</span>
                        {!galleryEnabled && <p className="text-xs text-admin-fg-secondary">Public album gallery is disabled.</p>}
                        {!!album.visibility?.reasons.length && (
                          <ul className="list-inside list-disc text-xs text-admin-fg-secondary">
                            {album.visibility.reasons.map(reason => <li key={reason}>{reason}</li>)}
                          </ul>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {album.deletedAt ? (
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
                            <Link href={'/admin/albums/' + album.id} className="rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-900 hover:bg-green-200">
                              Review &amp; publish
                            </Link>
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
            statusFilter || searchTerm ? (
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
    </>
  );
}
