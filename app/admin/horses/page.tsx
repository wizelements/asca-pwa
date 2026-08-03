'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { useToast } from '@/components/admin/ToastProvider';

interface Horse {
  id: number;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  mediaCount: number;
  primaryUrl: string | null;
  sortOrder: number;
}

const PAGE_SIZE = 20;

export default function AdminHorsesPage() {
  const { toast } = useToast();
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1);
    fetchHorses(1, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    fetchHorses(page, statusFilter);
  }, [page]);

  const fetchHorses = async (p: number, status: string) => {
    setLoading(true);
    setError('');
    const token = getAdminToken();
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
      if (status) params.set('status', status);
      const res = await fetch(`/api/gallery/horses?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load horses');
      const data = await res.json();
      const totalHeader = res.headers.get('X-Total-Count');
      const total = totalHeader ? Number(totalHeader) : data.length;
      setHorses(Array.isArray(data) ? data : []);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch {
      setError('Unable to load horse profiles.');
    } finally {
      setLoading(false);
    }
  };

  const action = async (id: number, actionName: string, showUndo = true): Promise<void> => {
    const token = getAdminToken();
    const res = await fetch('/api/gallery/horses', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ id, action: actionName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || 'Action failed');
      return;
    }
    await fetchHorses(page, statusFilter);
    const messages: Record<string, string> = {
      publish: 'Horse profile published.',
      archive: 'Horse profile archived.',
      restore: 'Horse profile restored.',
    };
    const reverseAction = actionName === 'archive' ? 'restore' : actionName === 'restore' ? 'archive' : null;
    toast.success(messages[actionName] || 'Horse profile updated.', reverseAction && showUndo ? {
      action: { label: 'Undo', onClick: () => void action(id, reverseAction, false) },
    } : undefined);
  };

  return (
    <AdminShell pageTitle="Horses" primaryAction={<Link href="/admin/horses/new" className="btn-admin-primary">Create horse profile</Link>}>
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
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Media</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-subtle">
              {horses.map((horse) => (
                <tr key={horse.id} className="hover:bg-admin-bg-subtle/50">
                  <td className="px-4 py-3 font-medium text-admin-fg-primary">
                    <Link href={`/admin/horses/${horse.id}`} className="hover:underline">{horse.name}</Link>
                  </td>
                  <td className="px-4 py-3 capitalize">{horse.status}</td>
                  <td className="px-4 py-3">{horse.mediaCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {horse.status !== 'published' && (
                        <button
                          onClick={() => action(horse.id, 'publish')}
                          className="rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 hover:bg-green-200"
                        >
                          Publish
                        </button>
                      )}
                      {horse.status !== 'archived' && (
                        <button
                          onClick={() => action(horse.id, 'archive')}
                          className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                        >
                          Archive
                        </button>
                      )}
                      {horse.status === 'archived' && (
                        <button
                          onClick={() => action(horse.id, 'restore')}
                          className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {horses.length === 0 && (
            statusFilter ? (
              <AdminEmptyState
                title="No horse profiles match this filter"
                description="Try another status or clear the filter to see all horse profiles."
                illustration="search"
                action={{ label: 'Clear filter', onClick: () => setStatusFilter('') }}
              />
            ) : (
              <AdminEmptyState
                title="No horse profiles yet"
                description="Create the first horse profile to get started."
                illustration="horses"
                action={{ label: 'Create horse profile', href: '/admin/horses/new' }}
              />
            )
          )}
        </div>
      )}

      <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminShell>
  );
}
