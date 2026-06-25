import { cn } from '@/lib/utils';

export interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'none' | 'sm' | 'md';
}

export default function AdminCard({ children, className, shadow = 'sm' }: AdminCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-admin-border-subtle bg-admin-surface p-4 md:p-6',
        shadow === 'sm' && 'shadow-sm',
        shadow === 'md' && 'shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}
