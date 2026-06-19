'use client';

import { useEffect, useState } from 'react';
import { getAdminToken } from '@/components/AdminGuard';

const emptyEvent = {
  title: '',
  description: '',
  date: '',
  endDate: '',
  location: '',
  imageUrl: '',
  imageAlt: '',
  capacity: '',
  registrationDeadline: '',
  category: 'hosted',
  published: false,
};

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/events/crud', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyEvent);
    setModalOpen(true);
  };

  const openEdit = (event: any) => {
    setEditing(event);
    setForm({
      title: event.title,
      description: event.description,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      location: event.location,
      imageUrl: event.imageUrl || '',
      imageAlt: event.imageAlt || '',
      capacity: event.capacity || '',
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
      category: event.category || 'hosted',
      published: event.published,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const token = getAdminToken();

    const payload = {
      ...form,
      capacity: form.capacity ? Number(form.capacity) : undefined,
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

      if (res.ok) {
        await fetchEvents();
        setModalOpen(false);
        setMessage(editing ? 'Event updated' : 'Event created');
      } else {
        setMessage('Save failed');
      }
    } catch (error) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/events/crud?id=${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        await fetchEvents();
        setMessage('Event deleted');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-brand-fg-primary">Events</h1>
        <div className="flex items-center gap-4">
          {message && <span className="text-sm font-medium text-green-600">{message}</span>}
          <button
            onClick={openCreate}
            className="px-6 py-2 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted"
          >
            + New Event
          </button>
        </div>
      </div>

      <div className="bg-brand-bg-elevated rounded-xl shadow-sm border border-brand-border-subtle overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-bg-subtle border-b border-brand-border-subtle">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-brand-fg-muted">
                  No events yet. Click &quot;+ New Event&quot; to create one.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b border-brand-border-subtle hover:bg-brand-bg-soft">
                  <td className="px-6 py-4 text-brand-fg-primary font-medium">{event.title}</td>
                  <td className="px-6 py-4 text-brand-fg-secondary">
                    {event.date ? new Date(event.date).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-brand-fg-secondary">{event.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${event.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {event.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(event)}
                        className="px-3 py-1 rounded-lg bg-brand-forest text-white text-sm hover:bg-brand-forest-muted"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-brand-bg-elevated rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-brand-fg-primary mb-6">
              {editing ? 'Edit Event' : 'Create Event'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-fg-primary mb-1">End Date *</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Location *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Image Alt Text *</label>
                <input
                  type="text"
                  value={form.imageAlt}
                  onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Capacity</label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    value={form.registrationDeadline}
                    onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-fg-primary mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary"
                  >
                    <option value="hosted">Hosted by ASCA</option>
                    <option value="attending">ASCA Will Be There</option>
                    <option value="sponsored">Sponsored by ASCA</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-brand-fg-primary font-medium">Published</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 rounded-lg border border-brand-border-subtle text-brand-fg-primary hover:bg-brand-bg-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted disabled:opacity-50"
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
