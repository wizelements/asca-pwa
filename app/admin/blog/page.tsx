import Link from 'next/link';

export default function AdminBlog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-brand-fg-primary">Blog Disabled</h1>
        <p className="mt-2 max-w-2xl text-brand-fg-secondary">
          Blog publishing is not part of the approved ASCA website scope. Use Events for the public schedule and Gallery for
          activity updates and photos.
        </p>
      </div>

      <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-fg-primary">Available content workflows</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/events" className="rounded-lg bg-brand-forest px-4 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted">
            Manage Events
          </Link>
          <Link href="/admin/gallery" className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-accent-muted">
            Manage Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
