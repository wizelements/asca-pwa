import {
  EVENTS,
  EVENT_CATEGORIES,
  EVENT_MONTH_ORDER,
  type AscaEvent,
} from '@/lib/content/events';

function eventsByMonth(month: string) {
  return EVENTS.filter((event) => event.month === month);
}

function eventMonths(events: AscaEvent[]) {
  const months = new Set(events.map((event) => event.month));
  return [
    ...EVENT_MONTH_ORDER.filter((month) => months.has(month)),
    ...Array.from(months).filter((month) => !EVENT_MONTH_ORDER.includes(month)),
  ];
}

export function EventCard({ event }: { event: AscaEvent }) {
  const category = EVENT_CATEGORIES[event.category];

  return (
    <article className="card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${category.badgeClass}`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${category.dotClass}`} aria-hidden="true" />
          <span aria-hidden="true">{category.icon}</span>
          {category.label}
        </span>

        <h3 className="mt-4 text-xl font-bold text-brand-fg-primary">{event.title}</h3>

        {event.description && (
          <p className="mt-2 text-sm leading-relaxed text-brand-fg-secondary">{event.description}</p>
        )}

        {event.registrationRequired && (
          <p className="mt-3 inline-flex rounded-full border border-brand-accent bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-fg-primary">
            Registration Required
          </p>
        )}
      </div>

      <p
        className="flex-shrink-0 text-base font-bold text-brand-forest sm:min-w-28 sm:text-right"
        aria-label={`Date: ${event.dateLabel}`}
      >
        {event.dateLabel}
      </p>
    </article>
  );
}

export function MonthSection({ month, events }: { month: string; events: AscaEvent[] }) {
  if (events.length === 0) return null;

  return (
    <section aria-labelledby={`events-${month.toLowerCase()}`} className="space-y-4">
      <h2 id={`events-${month.toLowerCase()}`} className="text-2xl font-bold text-brand-fg-primary">
        {month}
      </h2>
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard key={`${event.month}-${event.title}`} event={event} />
        ))}
      </div>
    </section>
  );
}

export function EventTimeline({ events = EVENTS }: { events?: AscaEvent[] }) {
  return (
    <div className="space-y-10" aria-label="ASCA event schedule">
      {eventMonths(events).map((month) => (
        <MonthSection key={month} month={month} events={events.filter((event) => event.month === month)} />
      ))}
    </div>
  );
}

export default EventTimeline;
