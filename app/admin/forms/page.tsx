'use client';

import { useEffect, useMemo, useState } from 'react';

import { getAdminToken, logout } from '@/components/AdminGuard';

type FormStatus = 'new' | 'replied' | 'resolved';

interface FormSubmission {
  id: number;
  type: string;
  data: Record<string, string>;
  status: FormStatus;
  submittedAt?: string;
}

const STATUS_OPTIONS: Array<{ value: '' | FormStatus; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'resolved', label: 'Resolved' },
];

export default function AdminForms() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | FormStatus>('');
  const [selected, setSelected] = useState<FormSubmission | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formTypes = useMemo(
    () => Array.from(new Set(submissions.map((submission) => submission.type))).sort(),
    [submissions]
  );

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  const fetchSubmissions = async () => {
    const token = getAdminToken();
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res = await fetch(`/api/forms?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError('Unable to load form submissions.');
        return;
      }
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load form submissions.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (submission: FormSubmission, status: FormStatus) => {
    const token = getAdminToken();
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/forms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: submission.id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Unable to update submission status.');
        return;
      }
      setMessage('Submission status updated.');
      setSelected((current) => (current?.id === data.id ? data : current));
      await fetchSubmissions();
    } catch {
      setError('Unable to update submission status.');
    }
  };

  if (loading) return <div className="p-8">Loading form submissions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Form Submissions</h1>
          <p className="mt-1 text-sm text-brand-fg-secondary">Review contact and event-update submissions from the public site.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
          >
            <option value="">All forms</option>
            {formTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | FormStatus)}
            className="rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value || 'all'} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-brand-border-subtle bg-brand-bg-elevated shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-brand-border-subtle bg-brand-bg-subtle">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Submitted By</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Submitted</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-brand-fg-muted">
                    No form submissions match the current filters.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-brand-border-subtle last:border-0 hover:bg-brand-bg-soft">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-fg-primary">{submission.data.name || 'Website visitor'}</p>
                      <p className="text-sm text-brand-fg-secondary">{submission.data.email || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-fg-secondary">{submission.type}</td>
                    <td className="px-6 py-4 text-sm text-brand-fg-secondary">
                      {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={submission.status}
                        onChange={(e) => updateStatus(submission, e.target.value as FormStatus)}
                        className="rounded-lg border border-brand-border-subtle bg-brand-bg-body px-3 py-1 text-sm text-brand-fg-primary"
                      >
                        <option value="new">New</option>
                        <option value="replied">Replied</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelected(submission)} className="rounded-lg bg-brand-forest px-3 py-1 text-sm text-white hover:bg-brand-forest-muted">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-brand-bg-elevated p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-fg-primary">Submission Details</h2>
                <p className="mt-1 text-sm text-brand-fg-secondary">{selected.type} · {selected.status}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg border border-brand-border-subtle px-3 py-1 text-sm text-brand-fg-primary hover:bg-brand-bg-subtle">
                Close
              </button>
            </div>

            <dl className="mt-6 divide-y divide-brand-border-subtle rounded-lg border border-brand-border-subtle">
              {Object.entries(selected.data).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-3">
                  <dt className="text-sm font-semibold capitalize text-brand-fg-primary">{key.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="text-sm text-brand-fg-secondary sm:col-span-2 whitespace-pre-wrap">{String(value || '-')}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => updateStatus(selected, 'replied')} className="rounded-lg bg-brand-forest px-4 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted">Mark Replied</button>
              <button onClick={() => updateStatus(selected, 'resolved')} className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-accent-muted">Mark Resolved</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
