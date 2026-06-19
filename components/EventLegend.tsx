import { EVENT_CATEGORIES } from '@/lib/content/events';

export default function EventLegend() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-4" aria-label="Event category legend">
      {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => (
        <li
          key={key}
          className="inline-flex items-center gap-2 rounded-full border border-brand-border-subtle bg-white px-4 py-2 text-sm font-medium text-brand-fg-primary"
        >
          <span className={`h-3 w-3 flex-shrink-0 rounded-full ${cat.dotClass}`} aria-hidden="true" />
          <span className="font-bold text-brand-forest" aria-hidden="true">{cat.icon}</span>
          {cat.label}
        </li>
      ))}
    </ul>
  );
}
