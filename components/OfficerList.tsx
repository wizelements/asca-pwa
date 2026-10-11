import { getCachedSiteContent, siteList } from '@/lib/site-content';

function parseOfficer(value: string) {
  const [title = '', name = '', flag = ''] = value.split('|').map((part) => part.trim());
  return {
    title,
    name,
    founding: /^(founding|founder|yes)$/i.test(flag),
  };
}

export default async function OfficerList() {
  const copy = await getCachedSiteContent();
  const officers = siteList(copy, 'about.officers.items')
    .map(parseOfficer)
    .filter((officer) => officer.title && officer.name);

  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {officers.map((officer, index) => (
        <li
          key={`${officer.title}-${officer.name}-${index}`}
          className="editorial-card group relative min-h-[190px] p-7 text-left transition-all duration-300"
        >
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-forest">
              {officer.title}
            </p>
            <span className="font-serif text-sm italic text-brand-fg-muted">{String(index + 1).padStart(2, '0')}</span>
          </div>

          <div className="mt-8 h-px w-10 bg-brand-accent transition-all duration-300 group-hover:w-16" aria-hidden="true" />

          <p className="mt-5 font-serif text-2xl font-medium leading-tight text-brand-fg-primary">
            {officer.name}
          </p>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-brand-fg-muted">
            {officer.founding ? 'Founding Member' : 'ASCA Leadership'}
          </p>
        </li>
      ))}
    </ul>
  );
}
