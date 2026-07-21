'use client';

import { useEffect, useState } from 'react';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const token = () => getAdminToken() || '';

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gallery/categories', { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: number, active: boolean) => {
    const res = await fetch('/api/gallery/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ id, active }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Update failed');
      return;
    }
    fetchCategories();
  };

  return (
    <AdminShell pageTitle="Categories">
      {loading && <p className="text-admin-fg-muted">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-admin-border-subtle">
          <table className="w-full text-left text-sm">
            <thead className="bg-admin-bg-subtle text-admin-fg-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-subtle">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-admin-bg-subtle/50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-admin-fg-muted">{cat.slug}</td>
                  <td className="px-4 py-3">{cat.sortOrder}</td>
                  <td className="px-4 py-3">{cat.active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(cat.id, !cat.active)}
                      className="text-xs font-medium text-blue-700 hover:underline"
                    >
                      {cat.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
