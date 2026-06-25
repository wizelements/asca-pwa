import { cn } from '@/lib/utils';

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
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {backHref && (
          <a
            href={backHref}
            className="mb-2 inline-flex items-center text-sm font-medium text-admin-fg-muted hover:text-admin-fg-primary"
          >
            ← Back
          </a>
        )}
        <h1 className="text-3xl font-bold text-admin-fg-primary">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-admin-fg-secondary">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  );
}
