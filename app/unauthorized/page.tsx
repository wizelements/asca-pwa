import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg-body px-4">
      <div className="max-w-md rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-forest">Access limited</p>
        <h1 className="mt-3 text-3xl font-bold text-brand-fg-primary">You do not have permission to view this admin area.</h1>
        <p className="mt-4 text-sm leading-relaxed text-brand-fg-secondary">
          If you believe this is a mistake, ask an ASCA administrator to check your account role.
        </p>
        <Link href="/admin/login" className="mt-6 inline-flex rounded-lg bg-brand-forest px-5 py-2 text-sm font-semibold text-white hover:bg-brand-forest-muted">
          Back to admin login
        </Link>
      </div>
    </main>
  );
}
