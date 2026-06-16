import { OFFICERS } from '@/lib/content/officers';

export default function OfficerList() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {OFFICERS.map((officer) => (
        <li key={officer.name} className="card text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-forest">
            {officer.title}
          </p>
          <p className="mt-3 text-lg font-bold text-brand-fg-primary">{officer.name}</p>
          {officer.founding && (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brand-fg-muted">
              Founding Member
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
