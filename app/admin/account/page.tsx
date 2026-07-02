'use client';

import { useState } from 'react';

import { getAdminToken, logout } from '@/components/AdminGuard';

export default function AdminAccount() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);
    const token = getAdminToken();
    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Unable to update password.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage(data.message || 'Password updated.');
    } catch {
      setError('Unable to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-fg-primary">Account Security</h1>
        <p className="mt-2 max-w-2xl text-brand-fg-secondary">
          Change your password after handoff and any time it has been shared outside a password manager.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-brand-fg-primary">Change Password</h2>
        <p className="mt-2 text-sm text-brand-fg-secondary">
          Use at least 12 characters. After changing the password, sign out and sign back in with the new one.
        </p>

        {message && <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</div>}
        {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
              minLength={12}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-fg-primary">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-brand-fg-primary"
              minLength={12}
              required
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-forest px-6 py-2 font-semibold text-white hover:bg-brand-forest-muted disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Password'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-brand-border-subtle px-6 py-2 font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
