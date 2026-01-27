import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminNav = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Events', href: '/admin/events' },
    { label: 'Members', href: '/admin/members' },
    { label: 'Blog', href: '/admin/blog' },
    { label: 'Gallery', href: '/admin/gallery' },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Theme', href: '/admin/theme' },
    { label: 'Forms', href: '/admin/forms' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-neutral shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold">ASCA Admin</h2>
          <p className="text-sm text-neutral/60">Management Panel</p>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-secondary">
          <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors text-sm">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
