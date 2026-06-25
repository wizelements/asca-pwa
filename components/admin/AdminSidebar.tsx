import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: '📊' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Events', href: '/admin/events', icon: '📅' },
      { label: 'Gallery', href: '/admin/gallery', icon: '🖼️' },
      { label: 'Media', href: '/admin/media', icon: '📁' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Members', href: '/admin/members', icon: '👥' },
      { label: 'Forms', href: '/admin/forms', icon: '📝' },
    ],
  },
  {
    label: 'Site',
    items: [
      { label: 'Theme', href: '/admin/theme', icon: '🎨' },
      { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-admin-border-subtle bg-admin-surface lg:flex">
      <div className="flex h-16 items-center border-b border-admin-border-subtle px-6">
        <span className="text-lg font-bold text-admin-fg-primary">ASCA Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-admin-fg-muted">{group.label}</p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-admin-fg-secondary hover:bg-admin-bg-subtle hover:text-admin-fg-primary"
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
