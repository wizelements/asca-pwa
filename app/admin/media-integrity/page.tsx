'use client';

import { useEffect, useState } from 'react';
import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminShell from '@/components/admin/AdminShell';

interface Report {
  totalAssets: number;
  totalReferenced: number;
  uniqueReferenced: number;
  orphanCandidates: string[];
  missingReferences: Array<{ mediaAssetId: string; location: string; contextId?: string | number }>;
  multiReferenced: Array<{ mediaAssetId: string; count: number; locations: string[] }>;
  byLocation: Record<string, number>;
  approximateBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export default function MediaIntegrityPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/gallery/media-integrity', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load report');
      const data = await res.json();
      setReport(data);
    } catch {
      setError('Unable to load media integrity report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell pageTitle="Media Integrity">
      {loading && <p className="text-admin-fg-muted">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <p className="text-sm text-admin-fg-secondary">Total assets</p>
              <p className="text-2xl font-bold">{report.totalAssets}</p>
            </div>
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <p className="text-sm text-admin-fg-secondary">Unique referenced</p>
              <p className="text-2xl font-bold">{report.uniqueReferenced}</p>
            </div>
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <p className="text-sm text-admin-fg-secondary">Orphan candidates</p>
              <p className="text-2xl font-bold">{report.orphanCandidates.length}</p>
            </div>
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <p className="text-sm text-admin-fg-secondary">Approximate storage</p>
              <p className="text-2xl font-bold">{formatBytes(report.approximateBytes)}</p>
            </div>
          </div>

          <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
            <h3 className="mb-2 text-sm font-semibold">References by location</h3>
            <ul className="space-y-1 text-sm">
              {Object.entries(report.byLocation).map(([location, count]) => (
                <li key={location}>
                  <span className="font-medium">{location}:</span> {count}
                </li>
              ))}
            </ul>
          </div>

          {report.missingReferences.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-red-800">Missing references ({report.missingReferences.length})</h3>
              <ul className="space-y-1 text-sm text-red-700">
                {report.missingReferences.map((ref, idx) => (
                  <li key={idx}>{ref.mediaAssetId} in {ref.location} {ref.contextId !== undefined ? `(id: ${ref.contextId})` : ''}</li>
                ))}
              </ul>
            </div>
          )}

          {report.multiReferenced.length > 0 && (
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <h3 className="mb-2 text-sm font-semibold">Multiply referenced assets</h3>
              <ul className="space-y-1 text-sm">
                {report.multiReferenced.map((item) => (
                  <li key={item.mediaAssetId}>
                    {item.mediaAssetId}: {item.count} references ({item.locations.join(', ')})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
