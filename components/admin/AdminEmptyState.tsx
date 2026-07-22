import Link from 'next/link';
import AdminActionButton from './AdminActionButton';

export type AdminEmptyStateIllustration = 'albums' | 'horses' | 'media' | 'search' | 'inbox' | 'tasks' | 'generic';

export interface AdminEmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

export interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: AdminEmptyStateAction;
  secondaryAction?: AdminEmptyStateAction;
  illustration?: AdminEmptyStateIllustration;
}

function EmptyStateIllustration({ type }: { type: AdminEmptyStateIllustration }) {
  const svgProps = {
    viewBox: '0 0 160 120',
    className: 'h-[120px] w-[160px] text-admin-fg-muted',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  };

  switch (type) {
    case 'albums':
      return <svg {...svgProps}><rect x="30" y="25" width="96" height="70" rx="8" fill="currentColor" opacity=".12" transform="rotate(-6 30 25)"/><rect x="35" y="20" width="96" height="72" rx="8" fill="currentColor" opacity=".22"/><rect x="42" y="27" width="82" height="58" rx="5" stroke="currentColor" strokeWidth="3"/><circle cx="104" cy="43" r="7" fill="currentColor" opacity=".65"/><path d="m48 77 21-20 14 13 10-9 25 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'horses':
      return <svg {...svgProps}><path d="M48 95c12-10 16-24 14-39l-8-23 22 13c11-12 24-18 39-20l-8 17c10 12 11 25 3 39-8 13-22 18-39 14L59 110" fill="currentColor" opacity=".18"/><path d="M48 95c12-10 16-24 14-39l-8-23 22 13c11-12 24-18 39-20l-8 17c10 12 11 25 3 39-8 13-22 18-39 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="94" cy="57" r="3.5" fill="currentColor"/><path d="M82 76c8 5 16 5 24 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
    case 'media':
      return <svg {...svgProps}><rect x="30" y="28" width="100" height="72" rx="9" fill="currentColor" opacity=".12"/><rect x="37" y="35" width="86" height="58" rx="5" stroke="currentColor" strokeWidth="3"/><circle cx="99" cy="52" r="7" fill="currentColor" opacity=".6"/><path d="m43 85 21-21 15 14 10-9 27 16M126 17v12m-6-6h12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'search':
      return <svg {...svgProps}><rect x="25" y="25" width="92" height="70" rx="9" fill="currentColor" opacity=".1"/><rect x="31" y="31" width="80" height="58" rx="6" stroke="currentColor" strokeWidth="3" strokeDasharray="7 6"/><circle cx="92" cy="69" r="22" fill="currentColor" opacity=".18"/><circle cx="92" cy="69" r="18" stroke="currentColor" strokeWidth="4"/><path d="m106 83 20 20" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/></svg>;
    case 'inbox':
      return <svg {...svgProps}><path d="m34 55 13-25h66l13 25v42H34V55Z" fill="currentColor" opacity=".12"/><path d="m34 55 13-25h66l13 25v42H34V55Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M35 61h27c2 10 8 15 18 15s16-5 18-15h27" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="M65 43h30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".55"/></svg>;
    case 'tasks':
      return <svg {...svgProps}><rect x="38" y="18" width="84" height="88" rx="9" fill="currentColor" opacity=".12"/><rect x="44" y="24" width="72" height="76" rx="6" stroke="currentColor" strokeWidth="3"/><path d="m56 45 5 5 9-11m-14 31 5 5 9-11M80 46h24M80 71h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    default:
      return <svg {...svgProps}><circle cx="80" cy="62" r="38" fill="currentColor" opacity=".12"/><path d="M80 35v54M53 62h54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".7"/><path d="M123 25v14m-7-7h14M35 85v12m-6-6h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;
  }
}

function EmptyStateAction({ action, variant }: { action: AdminEmptyStateAction; variant: 'primary' | 'secondary' }) {
  const button = <AdminActionButton variant={variant} size="sm" onClick={action.href ? undefined : action.onClick}>{action.label}</AdminActionButton>;
  return action.href ? <Link href={action.href}>{button}</Link> : button;
}

export default function AdminEmptyState({ icon, title, description, action, secondaryAction, illustration }: AdminEmptyStateProps) {
  const showIllustration = illustration || !icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-admin-border-subtle bg-admin-surface p-10 text-center sm:p-12">
      {showIllustration ? (
        <div className="mb-5"><EmptyStateIllustration type={illustration || 'generic'} /></div>
      ) : (
        <div className="mb-5 text-4xl text-admin-fg-muted">{icon}</div>
      )}
      <h3 className="text-lg font-bold text-admin-fg-primary">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-admin-fg-secondary">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && <EmptyStateAction action={action} variant="primary" />}
          {secondaryAction && <EmptyStateAction action={secondaryAction} variant="secondary" />}
        </div>
      )}
    </div>
  );
}
