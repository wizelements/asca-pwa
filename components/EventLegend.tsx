import { EVENT_CATEGORIES, EventCategory } from '@/lib/content/events';

export default function EventLegend() {
  const categories = Object.keys(EVENT_CATEGORIES) as EventCategory[];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {categories.map((key) => {
        const cat = EVENT_CATEGORIES[key];
        return (
          <span
            key={key}
            className="inline-flex items-center gap-2 rounded-full border border-brand-border-subtle bg-white px-4 py-2 text-sm font-medium text-brand-fg-primary"
          >
            <span className={`h-3 w-3 flex-shrink-0 rounded-full ${cat.dotClass}`} aria-hidden="true" />
            {cat.label}
          </span>
        );
      })}
    </div>
  );
}
