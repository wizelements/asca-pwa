'use client';

import { useEffect, useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar, { NAV_GROUPS } from './AdminSidebar';
import MobileAdminNav from './MobileAdminNav';
import AdminWalkthrough from './AdminWalkthrough';

export interface AdminShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  primaryAction?: React.ReactNode;
  activeHref?: string;
}

export default function AdminShell({
  children,
  pageTitle,
  primaryAction,
  activeHref,
}: AdminShellProps) {
  const homeItem = NAV_GROUPS[0].items[0];
  const active = activeHref || homeItem.href;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tourNonce, setTourNonce] = useState(0);

  useEffect(() => {
    setMobileOpen(false);
  }, [activeHref]);

  return (
    <div className="flex min-h-screen bg-admin-bg-body">
      <AdminSidebar activeHref={active} />
      <MobileAdminNav activeHref={active} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="min-w-0 flex flex-1 flex-col">
        <AdminHeader
          pageTitle={pageTitle}
          primaryAction={primaryAction}
          onMenuOpen={() => setMobileOpen(true)}
          onStartTour={() => setTourNonce((value) => value + 1)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>

      <AdminWalkthrough restartNonce={tourNonce} />
    </div>
  );
}
