'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from './AdminSidebar';

export interface MobileAdminNavProps {
  activeHref?: string;
  open: boolean;
  onClose: () => void;
}

function isCurrent(activeHref: string | undefined, href: string) {
  if (!activeHref) return false;
  if (href === '/admin') return activeHref === href;
  return activeHref === href || activeHref.startsWith(`${href}/`);
}

export default function MobileAdminNav({ activeHref, open, onClose }: MobileAdminNavProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(82vw,19rem)] transform bg-admin-surface shadow-2xl transition-transform duration-200 lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!open}
      >
        <div className="flex h-16 items-center justify-between border-b border-admin-border-subtle px-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-primary">ASCA</p>
            <p className="text-sm font-bold text-admin-fg-primary">Client Workspace</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-admin-fg-primary hover:bg-admin-bg-subtle"
            aria-label="Close navigation"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <nav className="h-[calc(100dvh-4rem)] overflow-y-auto px-3 py-5" aria-label="Admin">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-admin-fg-muted">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isCurrent(activeHref, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium transition',
                          active
                            ? 'bg-admin-bg-subtle text-admin-primary'
                            : 'text-admin-fg-secondary hover:bg-admin-bg-subtle hover:text-admin-fg-primary'
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
