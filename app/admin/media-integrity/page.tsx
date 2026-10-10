'use client';

import { useEffect, useMemo, useState } from 'react';

import { getAdminToken, logout } from '@/components/AdminGuard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

interface OrphanDetail {
  mediaAssetId: string;
  bytes: number;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Report {
  totalAssets: number;
  totalReferenced: number;
  uniqueReferenced: number;
  orphanCandidates: string[];
  orphanDetails?: OrphanDetail[];
  missingReferences: Array<{ mediaAssetId: string; location: string; contextId?: string | number }>;
  multiReferenced: Array<{ mediaAssetId: string; count: number; locations: string[] }>;
  byLocation: Record<string, number>;
  approximateBytes: number;
}

const STALE_ORPHAN_MS = 24 * 60 * 60 * 1000;

const LOCATION_LABELS: Record<string, string> = {
  gallery_images: 'Legacy Gallery photos',
  album_cover: 'Gallery album covers',
  album_media: 'Gallery album photos',
  horse_primary: 'Horse primary photos',
  horse_media: 'Horse profile photos',
  event_image: 'Event photos',
  member_photo: 'Internal member-record photos',
  blog_image: 'Blog photos',
  managed_page_image: 'Page images',
  theme_logo: 'ASCA logo',
  theme_favicon: 'Site icon',
};

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function friendlyLocation(location: string) {
  return LOCATION_LABELS[location] || location.replace(/_/g, ' ');
}

function ageLabel(value: string | null) {
  if (!value) return 'Age unknown';
  const elapsed = Date.now() - new Date(value).getTime();
  if (elapsed < 60 * 60 * 1000) return 'Uploaded less than an hour ago';
  const hours = Math.floor(elapsed / (60 * 60 * 1000));
  if (hours < 24) return `Uploaded ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Uploaded ${days}d ago`;
}

export default function MediaIntegrityPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    void fetchReport();
  }, []);

  const fetchReport = async () => {
    const token = getAdminToken();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/gallery/media-integrity', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      if (res.status === 401) { logout(); return; }
      if (!res.ok) throw new Error('Failed to load report');
      const data = await res.json();
      setReport(data);
    } catch {
      setError('Unable to load media health report.');
    } finally {
      setLoading(false);
    }
  };

  const orphanDetails = useMemo(() => {
    if (!report) return [];
    if (Array.isArray(report.orphanDetails)) return report.orphanDetails;
    return report.orphanCandidates.map((mediaAssetId) => ({ mediaAssetId, bytes: 0, createdAt: null, updatedAt: null }));
  }, [report]);

  const staleOrphans = orphanDetails.filter((item) => {
    if (!item.createdAt) return false;
    return Date.now() - new Date(item.createdAt).getTime() >= STALE_ORPHAN_MS;
  });

  const removeUnusedAsset = async (asset: OrphanDetail) => {
    if (!asset.createdAt || Date.now() - new Date(asset.createdAt).getTime() < STALE_ORPHAN_MS) return;
    if (!confirm('Permanently remove this unused upload? ASCA will re-check that the image is not referenced anywhere before deletion.')) return;

    const token = getAdminToken();
    setDeleting(asset.mediaAssetId);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/gallery/media?id=${encodeURIComponent(asset.mediaAssetId)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { logout(); return; }
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Unable to remove the unused upload.');
        return;
      }
      setMessage('Unused upload removed safely.');
      await fetchReport();
    } catch {
      setError('Unable to remove the unused upload.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Media Health"
        subtitle="Confirms that uploaded images are actually connected to the ASCA website or an internal record, and identifies safe cleanup candidates."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-950">
          <p className="font-bold">Referenced means protected.</p>
          <p className="mt-1">
            This check follows Page Images, Gallery albums, horse photos, event photos, member-record photos, legacy Gallery media, and ASCA brand assets such as the logo before anything can be considered unused.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <p className="font-bold">Unused does not mean delete immediately.</p>
          <p className="mt-1">
            A newly chosen Page Image or logo can exist briefly before you click Save. Cleanup is therefore available only after an upload has remained unreferenced for at least 24 hours, and the server checks usage again before deleting it.
          </p>
        </div>
      </div>

      {loading && <p className="text-admin-fg-muted">Checking every known image reference…</p>}
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</p>}

      {report && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <p className="text-sm text-admin-fg-secondary">Stored images</p>
              <p className="text-2xl font-bold">{report.totalAssets}</p>
            </div>
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <p className="text-sm text-admin-fg-secondary">Images in use</p>
              <p className="text-2xl font-bold">{report.uniqueReferenced}</p>
            </div>
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <p className="text-sm text-admin-fg-secondary">Unused uploads</p>
              <p className="text-2xl font-bold">{orphanDetails.length}</p>
              <p className="mt-1 text-xs text-admin-fg-muted">{staleOrphans.length} eligible for safe cleanup</p>
            </div>
            <div className="rounded-lg border border-admin-border-subtle bg-admin-surface p-4">
              <p className="text-sm text-admin-fg-secondary">Approximate storage</p>
              <p className="text-2xl font-bold">{formatBytes(report.approximateBytes)}</p>
            </div>
          </div>

          {report.missingReferences.length > 0 ? (
            <section className="rounded-xl border border-red-300 bg-red-50 p-5">
              <h2 className="text-base font-bold text-red-900">Needs repair: {report.missingReferences.length} missing image reference{report.missingReferences.length === 1 ? '' : 's'}</h2>
              <p className="mt-1 text-sm text-red-800">A website or admin record points to an image that no longer exists. These should be repaired before considering media healthy.</p>
              <ul className="mt-4 space-y-2 text-sm text-red-800">
                {report.missingReferences.map((ref, idx) => (
                  <li key={`${ref.mediaAssetId}-${idx}`} className="rounded-lg bg-white/70 p-3">
                    <strong>{friendlyLocation(ref.location)}</strong>
                    {ref.contextId !== undefined ? ` · record ${ref.contextId}` : ''}<br />
                    <span className="font-mono text-xs">{ref.mediaAssetId}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              <strong>No broken image references detected.</strong> Every tracked public/internal image reference resolves to a stored asset.
            </div>
          )}

          <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-admin-fg-primary">Unused uploads</h2>
                <p className="mt-1 text-sm text-admin-fg-secondary">
                  Images stored by an admin action but not currently assigned to any tracked ASCA destination.
                </p>
              </div>
              <button type="button" onClick={() => void fetchReport()} className="btn-admin-secondary">Run check again</button>
            </div>

            {orphanDetails.length === 0 ? (
              <p className="mt-4 rounded-lg bg-admin-bg-subtle p-4 text-sm text-admin-fg-muted">No unused uploads detected.</p>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {orphanDetails.map((asset) => {
                  const isStale = Boolean(asset.createdAt && Date.now() - new Date(asset.createdAt).getTime() >= STALE_ORPHAN_MS);
                  return (
                    <article key={asset.mediaAssetId} className="overflow-hidden rounded-xl border border-admin-border-subtle bg-admin-bg-body">
                      <div className="aspect-[4/3] bg-admin-bg-subtle">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/media/asset/${encodeURIComponent(asset.mediaAssetId)}`}
                          alt="Unused uploaded media preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="truncate font-mono text-xs text-admin-fg-muted">{asset.mediaAssetId}</p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-admin-fg-secondary">
                          <span>{formatBytes(asset.bytes)}</span>
                          <span>{ageLabel(asset.createdAt)}</span>
                        </div>
                        {isStale ? (
                          <button
                            type="button"
                            disabled={deleting === asset.mediaAssetId}
                            onClick={() => void removeUnusedAsset(asset)}
                            className="mt-4 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting === asset.mediaAssetId ? 'Checking & removing…' : 'Remove unused upload'}
                          </button>
                        ) : (
                          <p className="mt-4 text-xs leading-5 text-admin-fg-muted">Protected from cleanup for 24 hours in case another admin is still assigning it.</p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
            <h2 className="text-base font-bold text-admin-fg-primary">Where uploaded images are being used</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(report.byLocation).length === 0 ? (
                <p className="text-sm text-admin-fg-muted">No stored-asset references found.</p>
              ) : Object.entries(report.byLocation).map(([location, count]) => (
                <div key={location} className="flex items-center justify-between rounded-lg bg-admin-bg-subtle px-3 py-2 text-sm">
                  <span>{friendlyLocation(location)}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </section>

          {report.multiReferenced.length > 0 && (
            <details className="rounded-xl border border-admin-border-subtle bg-admin-surface p-5">
              <summary className="cursor-pointer text-sm font-bold text-admin-fg-primary">Images intentionally reused in more than one place ({report.multiReferenced.length})</summary>
              <p className="mt-2 text-sm text-admin-fg-secondary">Re-use is not an error. This is shown only so advanced maintenance can see shared dependencies before replacing or removing an asset.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {report.multiReferenced.map((item) => (
                  <li key={item.mediaAssetId} className="rounded-lg bg-admin-bg-subtle p-3">
                    <span className="font-mono text-xs">{item.mediaAssetId}</span>
                    <span className="ml-2 text-admin-fg-secondary">{item.count} references · {item.locations.map(friendlyLocation).join(', ')}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </>
  );
}
