'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const hasToken = Boolean(token);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to send reset link');
        return;
      }
      setMessage(data.message || 'If that admin account can be reset, a link has been sent.');
    } catch {
      setError('Unable to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unable to reset password');
        return;
      }
      setPassword('');
      setConfirmPassword('');
      setMessage('Password reset successfully. You can now sign in.');
    } catch {
      setError('Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg-body px-4">
      <div className="max-w-md w-full bg-brand-bg-elevated rounded-xl shadow-lg border border-brand-border-subtle p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-fg-primary">Reset Admin Password</h1>
          <p className="mt-2 text-brand-fg-secondary">
            {hasToken ? 'Set a new password for the admin account.' : 'Request a reset link for the admin account.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            {message}
          </div>
        )}

        {hasToken ? (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-fg-primary mb-1">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                placeholder="At least 12 characters"
                minLength={12}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-fg-primary mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                minLength={12}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequest} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-fg-primary mb-1">Admin email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
                placeholder="admin@atlantasaddleclub.com"
                required
              />
              <p className="mt-2 text-xs text-brand-fg-muted">
                Reset links are sent only to approved recovery email recipients.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/admin/login" className="text-sm font-medium text-brand-forest hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminResetPassword() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-brand-bg-body">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
