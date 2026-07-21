'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';

interface Horse {
  id: number;
  name: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  mediaCount: number;
  primaryUrl: string | null;
  sortOrder: number;
}

export default function AdminHorsesPage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchHorses();
  }, [statusFilter]);

  const fetchHorses = async () => {
    setLoading(true);
    setError('');
    const token = getAdminToken();
    try {
      const url = statusFilter ? `/api/gallery/horses?status=${statusFilter}` : '/api/gallery/horses';
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load horses');
      const data = await res.json();
      setHorses(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load horse profiles.');
    } finally {
      setLoading(false);
    }
  };

  const action = async (id: number, actionName: string) => {
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
      alert(err.error || 'Action failed');
      return;
    }
    fetchHorses();
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

      {loading && <p className="text-admin-fg-muted">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-admin-border-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-bg-subtle text-admin-fg-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Media</th>
                <th className="px-4 py-3">Actions</th>
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
                        <button onClick={() => action(horse.id, 'publish')} className="text-xs font-medium text-green-700 hover:underline">Publish</button>
                      )}
                      {horse.status !== 'archived' && (
                        <button onClick={() => action(horse.id, 'archive')} className="text-xs font-medium text-red-700 hover:underline">Archive</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {horses.length === 0 && <p className="p-8 text-center text-admin-fg-muted">No horse profiles found.</p>}
        </div>
      )}
    </AdminShell>
  );
}
