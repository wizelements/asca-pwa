'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AdminGuardProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

export default function AdminGuard({ children, requiredRole = 'admin' }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      const roles = ['admin', 'editor', 'viewer'];
      const requiredIndex = roles.indexOf(requiredRole);
      const userIndex = roles.indexOf(userRole);

      if (userIndex < requiredIndex) {
        router.push('/unauthorized');
      }
    }
  }, [status, session, router, requiredRole]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg-body">
        <div className="text-center">
          <div className="animate-spin inline-block w-12 h-12 border-4 border-brand-forest border-t-brand-accent rounded-full"></div>
          <p className="mt-4 text-brand-fg-primary font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Redirect in effect
  }

  const userRole = (session?.user as any)?.role;
  const roles = ['admin', 'editor', 'viewer'];
  const requiredIndex = roles.indexOf(requiredRole);
  const userIndex = roles.indexOf(userRole);

  if (userIndex < requiredIndex) {
    return null; // Redirect in effect
  }

  return <>{children}</>;
}
