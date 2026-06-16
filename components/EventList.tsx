import {
  EVENTS,
  EVENT_CATEGORIES,
  EVENT_MONTH_ORDER,
  AscaEvent,
} from '@/lib/content/events';

function groupByMonth(events: AscaEvent[]) {
  const map = new Map<string, AscaEvent[]>();
  for (const month of EVENT_MONTH_ORDER) {
    const monthEvents = events.filter((e) => e.month === month);
    if (monthEvents.length > 0) map.set(month, monthEvents);
  }
  return map;
}

export default function EventList() {
  const grouped = groupByMonth(EVENTS);

  return (
    <div className="space-y-12">
      {Array.from(grouped.entries()).map(([month, events]) => (
        <section key={month}>
          <h2 className="mb-5 text-2xl font-bold text-brand-fg-primary">{month}</h2>
          <ul className="space-y-4">
            {events.map((event, i) => {
              const cat = EVENT_CATEGORIES[event.category];
              return (
                <li
                  key={`${event.title}-${i}`}
                  className="card flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex-1">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${cat.badgeClass}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${cat.dotClass}`} aria-hidden="true" />
                      {cat.label}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-brand-fg-primary">
                      {event.title}
                      {event.registrationRequired && (
                        <span className="ml-2 align-middle text-xs font-medium uppercase tracking-[0.12em] text-brand-danger">
                          Registration required
                        </span>
                      )}
                    </h3>
                    {event.location && (
                      <p className="mt-1 text-sm text-brand-fg-secondary">{event.location}</p>
                    )}
                    {event.description && (
                      <p className="mt-2 text-sm text-brand-fg-secondary">{event.description}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-sm font-semibold text-brand-forest sm:text-right">
                    {event.dateLabel}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
