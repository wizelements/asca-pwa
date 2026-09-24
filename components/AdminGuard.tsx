'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

const ROLES = ['viewer', 'editor', 'admin'] as const;

export function useAuth(): { user: AuthUser | null; isLoading: boolean; logout: () => Promise<void> } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/auth', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = await response.json();
        return data.user as AuthUser;
      })
      .then((sessionUser) => setUser(sessionUser))
      .catch((error: unknown) => {
        if (!(error instanceof Error && error.name === 'AbortError')) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { user, isLoading, logout };
}

/**
 * Kept temporarily for existing admin fetch calls. Authentication now uses an
 * HttpOnly same-origin cookie, so callers should not attach bearer tokens.
 */
export function getAdminToken(): string | null {
  return null;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } finally {
    window.location.assign('/admin/login');
  }
}

interface AdminGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

export default function AdminGuard({ children, requiredRole = 'admin' }: AdminGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/admin/login');
      return;
    }

    const userIndex = ROLES.indexOf(user.role);
    const requiredIndex = ROLES.indexOf(requiredRole);
    if (userIndex < requiredIndex) router.replace('/unauthorized');
  }, [isLoading, user, router, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-admin-bg-body">
        <div className="text-center" role="status" aria-live="polite">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-admin-border-subtle border-t-admin-primary" />
          <p className="mt-4 text-sm font-medium text-admin-fg-secondary">Opening your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userIndex = ROLES.indexOf(user.role);
  const requiredIndex = ROLES.indexOf(requiredRole);
  if (userIndex < requiredIndex) return null;

  return <>{children}</>;
}
