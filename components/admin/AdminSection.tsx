import { cn } from '@/lib/utils';

export interface AdminSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export default function AdminSection({ title, children, className, collapsible }: AdminSectionProps) {
  return (
    <section className={cn('rounded-xl border border-admin-border-subtle bg-admin-surface p-4 shadow-sm md:p-6', className)}>
      {title && (
        <div className={cn('mb-4 flex items-center justify-between', collapsible && 'cursor-pointer')}>
          <h2 className="text-lg font-bold text-admin-fg-primary">{title}</h2>
        </div>
      )}
      {children}
    </section>
  );
}
