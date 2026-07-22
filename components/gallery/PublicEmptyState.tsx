import Link from 'next/link';

interface PublicEmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export default function PublicEmptyState({ title, description, action }: PublicEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated px-6 py-16 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 120 88"
        className="mx-auto h-24 w-32 text-brand-forest"
        fill="none"
      >
        <rect x="13" y="15" width="65" height="50" rx="6" className="fill-brand-bg-subtle stroke-current" strokeWidth="3" />
        <path d="m20 57 17-18 12 11 9-8 13 15" className="stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="59" cy="29" r="5" className="fill-current" />
        <rect x="43" y="25" width="65" height="50" rx="6" className="fill-brand-bg-elevated stroke-brand-fg-muted" strokeWidth="3" />
        <path d="m50 67 17-18 12 11 9-8 13 15" className="stroke-brand-fg-muted" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h2 className="mt-5 text-xl font-bold text-brand-fg-primary">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-md text-brand-fg-secondary">{description}</p>}
      {action && (
        <Link href={action.href} className="btn-primary mt-6 inline-flex focus-visible:ring-2 focus-visible:ring-brand-forest focus-visible:ring-offset-2">
          {action.label}
        </Link>
      )}
    </div>
  );
}
