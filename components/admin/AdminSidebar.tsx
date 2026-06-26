import { cn } from "@/lib/utils";

export interface NavGroup {
  label: string;
  items: { label: string; href: string; icon: string }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: "📊" }],
  },
  {
    label: "Relationships",
    items: [
      { label: "Contacts", href: "/admin/contacts", icon: "🤝" },
      { label: "Members", href: "/admin/members", icon: "👥" },
      { label: "Volunteers", href: "/admin/volunteers", icon: "🙌" },
      { label: "Organizations", href: "/admin/organizations", icon: "🏢" },
    ],
  },
  {
    label: "Communications",
    items: [
      { label: "Messages", href: "/admin/forms", icon: "📬" },
      { label: "Templates", href: "/admin/templates", icon: "📄" },
      { label: "Campaigns", href: "/admin/campaigns", icon: "📢" },
    ],
  },
  {
    label: "Events",
    items: [
      { label: "Events", href: "/admin/events", icon: "📅" },
      { label: "Attendance", href: "/admin/attendance", icon: "✅" },
      { label: "Follow-ups", href: "/admin/follow-ups", icon: "🔄" },
    ],
  },
  {
    label: "Tasks",
    items: [
      { label: "Tasks", href: "/admin/tasks", icon: "☑️" },
      { label: "AI Assistant", href: "/admin/ai-assistant", icon: "🤖" },
    ],
  },
  {
    label: "Site",
    items: [
      { label: "Media", href: "/admin/media", icon: "📁" },
      { label: "Gallery", href: "/admin/gallery", icon: "🖼️" },
      { label: "Theme", href: "/admin/theme", icon: "🎨" },
      { label: "Website", href: "/admin/website", icon: "🌐" },
      { label: "Settings", href: "/admin/settings", icon: "⚙️" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Account", href: "/admin/account", icon: "🔐" },
      { label: "Help", href: "/admin/help", icon: "❔" },
    ],
  },
];

export interface AdminSidebarProps {
  activeHref?: string;
}

export default function AdminSidebar({ activeHref }: AdminSidebarProps) {
  return (
    <aside className="hidden w-64 flex-col border-r border-admin-border-subtle bg-admin-surface lg:flex">
      <div className="flex h-16 items-center border-b border-admin-border-subtle px-6">
        <span className="text-lg font-bold text-admin-fg-primary">ASCA Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-admin-fg-muted">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-admin-bg-subtle text-admin-fg-primary"
                          : "text-admin-fg-secondary hover:bg-admin-bg-subtle hover:text-admin-fg-primary"
                      )}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </a>
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
