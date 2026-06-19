'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminGuard, { logout } from '@/components/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <LayoutInner>{children}</LayoutInner>
    </AdminGuard>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const adminNav = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Events', href: '/admin/events', icon: '📅' },
    { label: 'Members', href: '/admin/members', icon: '👥' },
    { label: 'Blog', href: '/admin/blog', icon: '📝' },
    { label: 'Gallery', href: '/admin/gallery', icon: '🖼️' },
    { label: 'Forms', href: '/admin/forms', icon: '📋' },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
    { label: 'Theme', href: '/admin/theme', icon: '🎨' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-brand-bg-body overflow-hidden">
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-brand-forest text-white shadow-xl transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-brand-forest-muted">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="text-xl font-bold">ASCA</h2>
                <p className="text-xs text-brand-accent opacity-75">Admin Panel</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-brand-forest-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
        </div>

        <nav className="flex-1 mt-8 px-3 space-y-2 overflow-y-auto">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-brand-accent text-brand-fg-primary font-semibold'
                  : 'text-white/80 hover:text-white hover:bg-brand-forest-muted'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-forest-muted">
          <button
            onClick={logout}
            className={`w-full text-left px-4 py-2 rounded-lg hover:bg-brand-forest-muted transition-colors text-sm font-medium ${
              sidebarOpen ? '' : 'text-center'
            }`}
            title="Logout"
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col bg-brand-bg-body">
        <div className="h-16 bg-brand-bg-elevated border-b border-brand-border-subtle flex items-center justify-between px-8 shadow-sm">
          <div>
            <p className="text-sm text-brand-fg-muted">Welcome back</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
              Online
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
