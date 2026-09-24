'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Sign in failed. Check your email and password.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('We could not sign you in. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-admin-bg-body px-4 py-10">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-admin-border-subtle bg-admin-surface shadow-xl">
        <div className="border-b border-admin-border-subtle bg-admin-primary px-8 py-7 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Atlanta Saddle Club</p>
          <h1 className="mt-2 text-3xl font-bold">ASCA Admin</h1>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Manage events, members, messages, photos, and site content from one workspace.
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-admin-fg-primary">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                inputMode="email"
                className="min-h-[48px] w-full rounded-xl border border-admin-border-subtle bg-white px-4 text-admin-fg-primary outline-none transition focus:border-admin-primary focus:ring-4 focus:ring-admin-primary/10"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="admin-password" className="text-sm font-semibold text-admin-fg-primary">
                  Password
                </label>
                <Link href="/admin/reset-password" className="text-sm font-medium text-admin-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="min-h-[48px] w-full rounded-xl border border-admin-border-subtle bg-white px-4 text-admin-fg-primary outline-none transition focus:border-admin-primary focus:ring-4 focus:ring-admin-primary/10"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-admin-primary px-5 font-semibold text-white transition hover:bg-admin-primary-dark focus:outline-none focus:ring-4 focus:ring-admin-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-admin-fg-muted">
            Your session is stored securely in this browser and is not exposed to page scripts.
          </p>
        </div>
      </section>
    </main>
  );
}
