import { cn } from '@/lib/utils';

export interface AdminHeaderProps {
  pageTitle?: string;
  primaryAction?: React.ReactNode;
}

export default function AdminHeader({ pageTitle, primaryAction }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-admin-border-subtle bg-admin-surface px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-admin-fg-primary hover:bg-admin-bg-subtle"
          aria-label="Open menu"
          data-mobile-menu-toggle
        >
          ☰
        </button>
        {pageTitle && <h1 className="text-lg font-bold text-admin-fg-primary md:text-xl">{pageTitle}</h1>}
      </div>
      <div className="flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-sm font-medium text-admin-fg-secondary hover:text-admin-fg-primary sm:block"
        >
          View Public Site →
        </a>
        {primaryAction}
      </div>
    </header>
  );
}
