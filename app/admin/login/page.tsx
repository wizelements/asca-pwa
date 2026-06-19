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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('asca_admin_user', JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        token: data.token,
      }));

      router.push('/admin');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg-body px-4">
      <div className="max-w-md w-full bg-brand-bg-elevated rounded-xl shadow-lg border border-brand-border-subtle p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-fg-primary">ASCA Admin</h1>
          <p className="mt-2 text-brand-fg-secondary">Sign in to manage your site</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-fg-primary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              placeholder="admin@atlantasaddleclub.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-fg-primary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-brand-border-subtle rounded-lg bg-brand-bg-body text-brand-fg-primary focus:outline-none focus:ring-2 focus:ring-brand-forest"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-brand-forest text-white font-semibold hover:bg-brand-forest-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/admin/reset-password" className="text-sm font-medium text-brand-forest hover:underline">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
