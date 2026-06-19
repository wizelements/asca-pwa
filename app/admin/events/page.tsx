'use client';

import { useEffect, useMemo, useState } from 'react';

import { getAdminToken, logout } from '@/components/AdminGuard';
import { EVENT_CATEGORIES, EVENT_MONTH_ORDER, type EventCategory } from '@/lib/content/events';

interface AdminEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  category: EventCategory;
  month?: string;
  dateLabel?: string;
  sortOrder?: number;
  registrationRequired: boolean;
  published: boolean;
}

interface EventFormState {
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  category: EventCategory;
  month: string;
  dateLabel: string;
  sortOrder: string;
  registrationRequired: boolean;
  published: boolean;
}

const CATEGORY_OPTIONS = Object.entries(EVENT_CATEGORIES) as Array<[
  EventCategory,
  (typeof EVENT_CATEGORIES)[EventCategory],
]>;

const emptyEvent: EventFormState = {
  title: '',
  description: '',
  date: '',
  endDate: '',
  location: '',
  category: 'hosted',
  month: 'June',
  dateLabel: '',
  sortOrder: '',
  registrationRequired: false,
  published: true,
};

function toDateInput(value?: string) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function formatApiError(data: any, fallback: string) {
  return typeof data?.error === 'string' ? data.error : fallback;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState<EventFormState>(emptyEvent);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const publishedCount = useMemo(() => events.filter((event) => event.published).length, [events]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/events/crud', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError('Unable to load events.');
        return;
      }
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load events.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyEvent);
    setError('');
    setMessage('');
    setModalOpen(true);
  };

  const openEdit = (event: AdminEvent) => {
    setEditing(event);
    setForm({
      title: event.title || '',
      description: event.description || '',
      date: toDateInput(event.date),
      endDate: toDateInput(event.endDate || event.date),
      location: event.location || '',
      category: event.category || 'hosted',
      month: event.month || new Date(event.date).toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' }),
      dateLabel: event.dateLabel || '',
      sortOrder: event.sortOrder !== undefined ? String(event.sortOrder) : '',
      registrationRequired: Boolean(event.registrationRequired),
      published: Boolean(event.published),
    });
    setError('');
    setMessage('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const token = getAdminToken();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      endDate: form.endDate || form.date,
      location: form.location.trim(),
      category: form.category,
      month: form.month,
      dateLabel: form.dateLabel.trim(),
      sortOrder: form.sortOrder ? Number(form.sortOrder) : 0,
      registrationRequired: form.registrationRequired,
      published: form.published,
    };

    try {
      const res = await fetch('/api/events/crud', {
        method: editing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError(formatApiError(data, 'Unable to save event.'));
        return;
      }
      await fetchEvents();
      setModalOpen(false);
      setMessage(editing ? 'Event updated.' : 'Event created.');
    } catch {
      setError('Unable to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event: AdminEvent) => {
    if (!confirm(`Delete ${event.title}?`)) return;
    const token = getAdminToken();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/events/crud?id=${event.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError('Unable to delete event.');
        return;
      }
      await fetchEvents();
      setMessage('Event deleted.');
    } catch {
      setError('Unable to delete event.');
    }
  };

  if (loading) return <div className="p-8">Loading events...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Events</h1>
          <p className="mt-1 text-sm text-brand-fg-secondary">
            Manage the public Where to Find Us schedule. {publishedCount} of {events.length} events are published.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-brand-forest px-6 py-2 font-semibold text-white hover:bg-brand-forest-muted"
        >
          + New Event
        </button>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-brand-border-subtle bg-brand-bg-elevated shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead className="border-b border-brand-border-subtle bg-brand-bg-subtle">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Event</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Month</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Date Label</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-brand-fg-muted">
                    No events yet. Add events from the approved ASCA schedule.
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const category = EVENT_CATEGORIES[event.category] || EVENT_CATEGORIES.hosted;
                  return (
                    <tr key={event.id} className="border-b border-brand-border-subtle last:border-0 hover:bg-brand-bg-soft">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-brand-fg-primary">{event.title}</p>
                        {event.registrationRequired && (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-forest">Registration required</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-fg-secondary">{category.label}</td>
                      <td className="px-6 py-4 text-sm text-brand-fg-secondary">{event.month || '-'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-brand-forest">{event.dateLabel || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${event.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {event.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(event)}
                            className="rounded-lg bg-brand-forest px-3 py-1 text-sm text-white hover:bg-brand-forest-muted"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-brand-bg-elevated p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-brand-fg-primary">
              {editing ? 'Edit Event' : 'Create Event'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                  >
                    {CATEGORY_OPTIONS.map(([value, category]) => (
                      <option key={value} value={value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Month *</label>
                  <select
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                  >
                    {EVENT_MONTH_ORDER.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Sort Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value, endDate: form.endDate || e.target.value })}
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                    required
                  />
                  <p className="mt-1 text-xs text-brand-fg-muted">Used for ordering, including Date TBA events.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Public Date Label *</label>
                  <input
                    type="text"
                    value={form.dateLabel}
                    onChange={(e) => setForm({ ...form, dateLabel: e.target.value })}
                    placeholder="7/8 or Date TBA"
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-brand-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm font-medium text-brand-fg-primary">
                  <input
                    type="checkbox"
                    checked={form.registrationRequired}
                    onChange={(e) => setForm({ ...form, registrationRequired: e.target.checked })}
                    className="h-4 w-4"
                  />
                  Registration Required
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-brand-fg-primary">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="h-4 w-4"
                  />
                  Published
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-brand-border-subtle px-6 py-2 text-brand-fg-primary hover:bg-brand-bg-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand-forest px-6 py-2 font-semibold text-white hover:bg-brand-forest-muted disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
