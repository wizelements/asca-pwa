import Link from 'next/link';
import { cn } from '@/lib/utils';
import AdminCard from './AdminCard';

export interface AdminStatCardProps {
  label: string;
  value: string | number;
  trend?: { value: string; positive?: boolean };
  href?: string;
}

export default function AdminStatCard({ label, value, trend, href }: AdminStatCardProps) {
  const content = (
    <div>
      <p className="text-sm font-medium text-admin-fg-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-admin-fg-primary">{value}</p>
      {trend && (
        <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-admin-success' : 'text-admin-warning')}>
          {trend.value}
        </p>
      )}
    </div>
  );

  return (
    <AdminCard className={cn('transition', href && 'hover:border-admin-primary/30 hover:bg-admin-bg-subtle')}>
      {href ? (
        <Link href={href} className="block rounded-lg focus:outline-none focus:ring-4 focus:ring-admin-primary/10">
          {content}
        </Link>
      ) : (
        content
      )}
    </AdminCard>
  );
}
