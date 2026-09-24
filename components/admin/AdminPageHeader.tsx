import Link from 'next/link';

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  backHref,
  primaryAction,
  secondaryAction,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-2 inline-flex min-h-[36px] items-center text-sm font-semibold text-admin-fg-muted hover:text-admin-fg-primary"
          >
            <span className="mr-1.5" aria-hidden="true">←</span>
            Back
          </Link>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-admin-fg-primary">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-admin-fg-secondary">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  );
}
