import { cn } from '@/lib/utils';
import AdminCard from './AdminCard';

export interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; positive?: boolean };
  href?: string;
}

export default function AdminStatCard({ label, value, icon, trend, href }: AdminStatCardProps) {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-admin-fg-muted">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-admin-fg-primary">{value}</p>
        {trend && (
          <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-admin-success' : 'text-admin-warning')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
      {icon && <div className="rounded-lg bg-admin-bg-subtle p-2 text-admin-fg-secondary">{icon}</div>}
    </div>
  );

  return (
    <AdminCard className={cn('transition-colors', href && 'hover:bg-admin-bg-subtle cursor-pointer')}>
      {href ? (
        <a href={href} className="block">
          {content}
        </a>
      ) : (
        content
      )}
    </AdminCard>
  );
}
