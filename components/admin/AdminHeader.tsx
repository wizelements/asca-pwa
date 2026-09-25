'use client';

export interface AdminHeaderProps {
  pageTitle?: string;
  primaryAction?: React.ReactNode;
  onMenuOpen?: () => void;
  onStartTour?: () => void;
}

export default function AdminHeader({
  pageTitle,
  primaryAction,
  onMenuOpen,
  onStartTour,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-admin-border-subtle bg-admin-surface/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-admin-fg-primary transition hover:bg-admin-bg-subtle lg:hidden"
          aria-label="Open navigation"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        {pageTitle ? (
          <h1 className="truncate text-base font-bold text-admin-fg-primary md:text-lg">{pageTitle}</h1>
        ) : (
          <p className="truncate text-sm font-semibold text-admin-fg-secondary">ASCA Administration</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStartTour}
          className="hidden min-h-[40px] rounded-lg px-3 text-sm font-semibold text-admin-fg-secondary transition hover:bg-admin-bg-subtle hover:text-admin-fg-primary sm:inline-flex sm:items-center"
        >
          Walkthrough
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[40px] items-center rounded-lg border border-admin-border-subtle px-3 text-sm font-semibold text-admin-fg-primary transition hover:bg-admin-bg-subtle"
        >
          View site
          <span className="ml-1.5" aria-hidden="true">↗</span>
        </a>
        {primaryAction}
      </div>
    </header>
  );
}
