import Link from 'next/link';

interface PublicEmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export default function PublicEmptyState({ title, description, action }: PublicEmptyStateProps) {
  return (
    <div className="editorial-card px-6 py-16 text-center md:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brand-forest/15 bg-brand-bg-subtle">
        <span className="font-serif text-2xl italic text-brand-forest" aria-hidden="true">A</span>
      </div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-brand-forest">Atlanta Saddle Club Association</p>
      <h2 className="mt-4 font-serif text-3xl font-medium text-brand-fg-primary">{title}</h2>
      {description && <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-brand-fg-secondary">{description}</p>}
      {action && (
        <Link href={action.href} className="btn-secondary mt-7 inline-flex focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2">
          {action.label}
        </Link>
      )}
    </div>
  );
}
