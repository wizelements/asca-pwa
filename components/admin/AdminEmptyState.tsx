import AdminActionButton from './AdminActionButton';

export interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
}

export default function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-admin-border-subtle bg-admin-surface p-8 text-center">
      {icon && <div className="mb-4 text-4xl text-admin-fg-muted">{icon}</div>}
      <h3 className="text-lg font-bold text-admin-fg-primary">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-admin-fg-secondary">{description}</p>}
      {action && (
        <div className="mt-5">
          {action.href ? (
            <a href={action.href}>
              <AdminActionButton variant="primary" size="sm">{action.label}</AdminActionButton>
            </a>
          ) : (
            <AdminActionButton variant="primary" size="sm" onClick={action.onClick}>{action.label}</AdminActionButton>
          )}
        </div>
      )}
    </div>
  );
}
