'use client';

import { useEffect, useState } from 'react';

import AdminImageField from '@/components/AdminImageField';
import { getAdminToken, logout } from '@/components/AdminGuard';

interface AdminMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  photo?: string;
  roles: string[];
  isActive: boolean;
  isVerified: boolean;
  joinDate?: string;
  linkedContactId?: number;
}

interface MemberFormState {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  photo: string;
  roles: string;
  isActive: boolean;
  isVerified: boolean;
  joinDate: string;
}

const emptyMember: MemberFormState = {
  firstName: '',
  lastName: '',
  email: '',
  bio: '',
  photo: '',
  roles: '',
  isActive: true,
  isVerified: false,
  joinDate: new Date().toISOString().slice(0, 10),
};

function toDateInput(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

function rolesFromInput(value: string) {
  return value.split(',').map((role) => role.trim()).filter(Boolean);
}

export default function AdminMembers() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMember | null>(null);
  const [form, setForm] = useState<MemberFormState>(emptyMember);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/members/crud', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError('Unable to load members.');
        return;
      }
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load members.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyMember);
    setMessage('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (member: AdminMember) => {
    setEditing(member);
    setForm({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      bio: member.bio || '',
      photo: member.photo || '',
      roles: (member.roles || []).join(', '),
      isActive: Boolean(member.isActive),
      isVerified: Boolean(member.isVerified),
      joinDate: toDateInput(member.joinDate),
    });
    setMessage('');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const token = getAdminToken();
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
      photo: form.photo.trim(),
      roles: rolesFromInput(form.roles),
      isActive: form.isActive,
      isVerified: form.isVerified,
      joinDate: form.joinDate,
    };

    try {
      const res = await fetch('/api/members/crud', {
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
        setError(data.error || 'Unable to save member.');
        return;
      }
      await fetchMembers();
      setModalOpen(false);
      setMessage(editing ? 'Member updated.' : 'Member created.');
    } catch {
      setError('Unable to save member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: AdminMember) => {
    if (!confirm(`Delete ${member.firstName} ${member.lastName}?`)) return;
    const token = getAdminToken();
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/members/crud?id=${member.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError('Unable to delete member.');
        return;
      }
      await fetchMembers();
      setMessage('Member deleted.');
    } catch {
      setError('Unable to delete member.');
    }
  };

  if (loading) return <div className="p-8">Loading members...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-brand-fg-primary">Members</h1>
          <p className="mt-1 text-sm text-brand-fg-secondary">Manage ASCA member records.</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-brand-forest px-6 py-2 font-semibold text-white hover:bg-brand-forest-muted">
          + Add Member
        </button>
      </div>

      {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="overflow-hidden rounded-xl border border-brand-border-subtle bg-brand-bg-elevated shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead className="border-b border-brand-border-subtle bg-brand-bg-subtle">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Roles</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-brand-fg-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-brand-fg-muted">
                    No members yet. Add members when the client is ready to manage records here.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b border-brand-border-subtle last:border-0 hover:bg-brand-bg-soft">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-fg-primary">{member.firstName} {member.lastName}</p>
                      {member.bio && <p className="mt-1 line-clamp-1 text-xs text-brand-fg-muted">{member.bio}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-fg-secondary">{member.email}</td>
                    <td className="px-6 py-4 text-sm text-brand-fg-secondary">{member.roles?.join(', ') || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {member.isVerified && <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">Verified</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a
                          href={member.linkedContactId ? `/admin/contacts/${member.linkedContactId}` : `/admin/contacts/new?memberId=${member.id}`}
                          className="rounded-lg border border-brand-forest px-3 py-1 text-sm font-medium text-brand-forest hover:bg-brand-bg-soft"
                        >
                          CRM profile
                        </a>
                        <button onClick={() => openEdit(member)} className="rounded-lg bg-brand-forest px-3 py-1 text-sm text-white hover:bg-brand-forest-muted">Edit</button>
                        <button onClick={() => handleDelete(member)} className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-brand-bg-elevated p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-brand-fg-primary">{editing ? 'Edit Member' : 'Add Member'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">First Name *</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Last Name *</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Join Date</label>
                  <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Roles</label>
                  <input type="text" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} placeholder="Officer, Volunteer" className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" />
                </div>
                <div className="sm:col-span-2">
                  <AdminImageField
                    label="Photo path, URL, or upload"
                    value={form.photo}
                    onChange={(photo) => setForm({ ...form, photo })}
                    placeholder="/images/members/member-1.jpg or https://..."
                    previewAlt={`${form.firstName || 'Member'} ${form.lastName || 'photo'}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary" />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border border-brand-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3 text-sm font-medium text-brand-fg-primary">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4" />
                  Active
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-brand-fg-primary">
                  <input type="checkbox" checked={form.isVerified} onChange={(e) => setForm({ ...form, isVerified: e.target.checked })} className="h-4 w-4" />
                  Verified
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-brand-border-subtle px-6 py-2 text-brand-fg-primary hover:bg-brand-bg-subtle">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-brand-forest px-6 py-2 font-semibold text-white hover:bg-brand-forest-muted disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
