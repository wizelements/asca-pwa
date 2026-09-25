import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface NavGroup {
  label: string;
  items: { label: string; href: string }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [{ label: 'Dashboard', href: '/admin' }],
  },
  {
    label: 'People',
    items: [
      { label: 'Contacts', href: '/admin/contacts' },
      { label: 'Members', href: '/admin/members' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Events', href: '/admin/events' },
      { label: 'Messages', href: '/admin/forms' },
      { label: 'Tasks', href: '/admin/tasks' },
    ],
  },
  {
    label: 'Website',
    items: [
      { label: 'Gallery albums', href: '/admin/albums' },
      { label: 'Horses', href: '/admin/horses' },
      { label: 'Page images', href: '/admin/media' },
      { label: 'Appearance', href: '/admin/theme' },
      { label: 'Social & donations', href: '/admin/settings' },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Help & walkthrough', href: '/admin/help' },
      { label: 'Account', href: '/admin/account' },
    ],
  },
];

export interface AdminSidebarProps {
  activeHref?: string;
}

function isCurrent(activeHref: string | undefined, href: string) {
  if (!activeHref) return false;
  if (href === '/admin') return activeHref === href;
  return activeHref === href || activeHref.startsWith(`${href}/`);
}

export default function AdminSidebar({ activeHref }: AdminSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-admin-border-subtle bg-admin-surface lg:flex">
      <div className="flex h-16 items-center border-b border-admin-border-subtle px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-primary">ASCA</p>
          <p className="text-sm font-bold text-admin-fg-primary">Client Workspace</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Admin">
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
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-[40px] items-center rounded-lg px-3 py-2 text-sm font-medium transition',
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
  );
}
