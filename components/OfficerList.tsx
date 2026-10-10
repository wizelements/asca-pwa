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
        <li key={`${officer.title}-${officer.name}-${index}`} className="card text-center">
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
