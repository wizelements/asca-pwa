'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  token: string;
}

const ROLES = ['viewer', 'editor', 'admin'];

export function useAuth(): { user: AuthUser | null; isLoading: boolean; logout: () => void } {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('asca_admin_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('asca_admin_user');
    window.location.href = '/';
  };

  return { user, isLoading, logout };
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('asca_admin_user');
    if (!stored) return null;
    const user = JSON.parse(stored) as AuthUser;
    return user.token || null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('asca_admin_user');
  window.location.href = '/';
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
    if (userIndex < requiredIndex) {
      router.replace('/unauthorized');
    }
  }, [isLoading, user, router, requiredRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg-body">
        <div className="text-center">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-brand-forest border-t-brand-accent rounded-full"></div>
          <p className="mt-4 text-brand-fg-primary font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
