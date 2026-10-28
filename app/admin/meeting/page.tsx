'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { logout } from '@/components/AdminGuard';
import { SITE_CONTENT_PAGES, getDefaultSiteContent } from '@/lib/content/site-content';

const fields = SITE_CONTENT_PAGES.find((page) => page.id === 'shared')!.sections.find(
  (section) => section.label === 'Monthly meeting'
)!.fields;
const fieldKeys = fields.map((field) => field.key);
type MeetingValues = Record<string, string>;

function toMeetingValues(values: Record<string, string | string[]>): MeetingValues {
  return Object.fromEntries(fieldKeys.map((key) => [key, String(values[key] ?? '')]));
}

export default function MonthlyMeetingEditor() {
  const defaults = useMemo(() => getDefaultSiteContent(), []);
  const [values, setValues] = useState<MeetingValues>(() => toMeetingValues(defaults));
  const [savedValues, setSavedValues] = useState<MeetingValues>(() => toMeetingValues(defaults));
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    setError('');
    try {
      const response = await fetch('/api/site-content', { cache: 'no-store', credentials: 'same-origin' });
      if (response.status === 401) { await logout(); return; }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to load the meeting information.');
      if (data.writable === false) throw new Error('Meeting changes cannot be saved because page-text storage has not been set up in this environment. Ask the site administrator to run the database migration.');
      const current = toMeetingValues({ ...defaults, ...(data.values || {}) });
      setValues(current);
      setSavedValues(current);
    } catch (caught) {
      setFailed(true);
      setError(caught instanceof Error ? caught.message : 'Unable to load the meeting information.');
    } finally {
      setLoading(false);
    }
  }, [defaults]);

  useEffect(() => { void load(); }, [load]);

  const dirty = fieldKeys.some((key) => values[key] !== savedValues[key]);
  const incomplete = fields.some((field) => !values[field.key]?.trim());
  const update = (key: string, value: string) => {
    setMessage('');
    setError('');
    setValues((current) => ({ ...current, [key]: value }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dirty || saving || incomplete) return;
    setSaving(true);
    setError('');
    setMessage('');
    const updates = Object.fromEntries(fieldKeys.map((key) => [key, values[key].trim()]));
    try {
      const response = await fetch('/api/site-content', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (response.status === 401) { await logout(); return; }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save the monthly meeting.');
      const updated = toMeetingValues({ ...defaults, ...(data.values || {}) });
      setValues(updated);
      setSavedValues(updated);
      setMessage('Monthly meeting saved. The homepage and About page use this information. Open both pages below to confirm the change appears correctly.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save the monthly meeting.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Monthly Meeting"
        subtitle="Change when and where ASCA meets. These details appear on the homepage and About page."
      />
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-2xl border border-admin-border-subtle bg-admin-surface p-5">
          <h2 className="text-lg font-bold text-admin-fg-primary">What would you like to update?</h2>
          <p className="mt-2 text-sm leading-6 text-admin-fg-secondary">Update the location, address, meeting schedule, or time below. There is one Save button for this meeting. You do not need to edit a separate event to change the recurring meeting callout.</p>
        </div>
        {loading ? (
          <p role="status" className="rounded-xl bg-admin-surface p-5 text-admin-fg-secondary">Loading the current monthly meeting…</p>
        ) : failed ? (
          <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
            <h2 className="font-bold">Meeting details could not be loaded</h2>
            <p className="mt-2">No changes were made. {error}</p>
            <button type="button" className="btn-admin-secondary mt-4" onClick={() => void load()}>Try again</button>
          </section>
        ) : (
          <form onSubmit={(event) => void save(event)} className="rounded-2xl border border-admin-border-subtle bg-admin-surface p-5 sm:p-6">
            <h2 className="text-xl font-bold text-admin-fg-primary">Meeting details</h2>
            <div className="mt-5 space-y-5">
              {fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="block text-sm font-semibold text-admin-fg-primary">{field.label}</span>
                  <input
                    type="text"
                    name={field.key}
                    value={values[field.key] || ''}
                    maxLength={field.maxLength}
                    required
                    onChange={(event) => update(field.key, event.target.value)}
                    className="form-input mt-2 w-full"
                  />
                  {field.key === 'shared.meeting.venue' && <span className="mt-1 block text-xs text-admin-fg-muted">The name of the restaurant, facility, or other meeting place.</span>}
                  {field.key === 'shared.meeting.address' && <span className="mt-1 block text-xs text-admin-fg-muted">Include street address, city, state, and ZIP code so visitors know where to go.</span>}
                  {field.key === 'shared.meeting.cadence' && <span className="mt-1 block text-xs text-admin-fg-muted">Example: first Wednesday of every month.</span>}
                </label>
              ))}
            </div>
            {dirty && <p role="status" className="mt-5 text-sm font-semibold text-amber-800">You have unsaved changes.</p>}
            {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p>}
            {message && <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-900">{message}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button type="submit" disabled={!dirty || incomplete || saving} className="btn-admin-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-50">
                {saving ? 'Saving meeting…' : dirty ? 'Save monthly meeting' : 'No changes to save'}
              </button>
              <Link className="btn-admin-secondary" href="/" target="_blank" rel="noopener noreferrer">Check homepage ↗</Link>
              <Link className="btn-admin-secondary" href="/about" target="_blank" rel="noopener noreferrer">Check About page ↗</Link>
            </div>
          </form>
        )}
        <p className="text-sm text-admin-fg-secondary">For a one-time event or special meeting date, use <Link href="/admin/events" className="font-semibold underline">Events</Link>. The monthly meeting editor updates the recurring meeting information only. If that meeting is also listed as an individual calendar event, update that event separately.</p>
      </div>
    </>
  );
}
