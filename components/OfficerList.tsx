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
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-forest">
            {officer.title}
          </p>
          <div className="mt-5 h-px w-10 bg-brand-accent" aria-hidden="true" />
          <p className="mt-5 font-serif text-3xl font-semibold leading-tight text-brand-fg-primary">
            {officer.name}
          </p>
          {officer.founding && (
            <p className="mt-4 text-sm font-medium text-brand-fg-secondary">Founding Member</p>
          )}
        </li>
      ))}
    </ul>
  );
}
