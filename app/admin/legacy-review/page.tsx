'use client';

import { useEffect, useState } from 'react';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';

interface ReviewRecord {
  id: number;
  legacyGalleryImageId: number;
  legacyTitle: string;
  legacyCategory: string;
  proposedDestinationType: string;
  proposedCategorySlug: string | null;
  migrationConfidence: string;
  reviewReason: string;
  reviewStatus: string;
  privacyReviewStatus: string;
}

export default function AdminLegacyReviewPage() {
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const token = () => getAdminToken() || '';

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gallery/legacy-review?status=pending', { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load records');
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load legacy review queue.');
    } finally {
      setLoading(false);
    }
  };

  const action = async (id: number, actionName: string, extra?: any) => {
    const body: any = { id, action: actionName };
    if (extra) Object.assign(body, extra);
    const res = await fetch('/api/gallery/legacy-review', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || 'Action failed');
      return;
    }
    fetchRecords();
  };

  return (
    <AdminShell pageTitle="Legacy Review Queue">
      {loading && <p className="text-admin-fg-muted">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="space-y-4">
          {records.length === 0 && <p className="text-admin-fg-muted">No pending review records.</p>}
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-admin-fg-primary">{record.legacyTitle}</h3>
                  <p className="text-sm text-admin-fg-muted">Legacy category: {record.legacyCategory}</p>
                  <p className="text-sm text-admin-fg-muted">Proposed: {record.proposedDestinationType} {record.proposedCategorySlug ? `(${record.proposedCategorySlug})` : ''}</p>
                  <p className="text-sm text-admin-fg-muted">Confidence: {record.migrationConfidence}</p>
                  <p className="text-sm text-admin-fg-secondary">{record.reviewReason}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => action(record.id, 'setPrivacy', { privacyReviewStatus: 'approved' })} className="btn-admin-secondary text-xs">Approve privacy</button>
                  <button onClick={() => action(record.id, 'setPrivacy', { privacyReviewStatus: 'restricted' })} className="btn-admin-secondary text-xs">Restrict</button>
                  <button onClick={() => action(record.id, 'skip')} className="btn-admin-secondary text-xs">Skip</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
