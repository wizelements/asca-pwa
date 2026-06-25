import { cn } from '@/lib/utils';

export interface AdminActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function AdminActionButton({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: AdminActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
        size === 'sm' && 'min-h-[36px] rounded-full px-3 py-1.5 text-xs',
        size === 'md' && 'min-h-[44px] rounded-full px-5 py-2 text-sm',
        size === 'lg' && 'min-h-[48px] rounded-full px-6 py-3 text-base',
        variant === 'primary' && 'bg-admin-primary text-white hover:bg-admin-primary-dark focus:ring-admin-primary disabled:bg-admin-primary/50',
        variant === 'secondary' && 'border border-admin-border-subtle bg-admin-surface text-admin-fg-primary hover:bg-admin-bg-subtle focus:ring-admin-fg-muted disabled:opacity-50',
        variant === 'danger' && 'border border-admin-danger bg-white text-admin-danger hover:bg-admin-danger hover:text-white focus:ring-admin-danger disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {loading && <span className="mr-2 animate-spin">⟳</span>}
      {children}
    </button>
  );
}
