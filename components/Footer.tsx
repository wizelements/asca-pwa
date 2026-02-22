/**
 * Footer Component - ASCA PWA
 */

export default function Footer() {
  return (
    <footer className="border-t border-brand-border-subtle bg-brand-bg-body">
      <div className="container py-10">
        <div className="flex flex-col gap-6 text-sm text-brand-fg-muted md:flex-row md:items-center md:justify-between">
          <p className="uppercase tracking-[0.24em]">(c) {new Date().getFullYear()} Atlanta Saddle Club Association</p>
          <p className="text-xs uppercase tracking-[0.24em] text-brand-fg-secondary">
            Built by{' '}
            <a
              href="https://www.cod3blackagency.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-forest hover:text-brand-forest-muted"
            >
              Cod3 Black Agency
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
