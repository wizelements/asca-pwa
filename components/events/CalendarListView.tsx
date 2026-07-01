'use client';

import { AscaEvent, EVENT_CATEGORIES, AscaEventCategory } from '@/lib/content/events';
import { formatEventDateRange } from '@/lib/date';

interface CalendarListViewProps {
  events: AscaEvent[];
  onSelectEvent: (event: AscaEvent) => void;
  selectedEventId?: string;
  emptyMessage?: string;
  groupByMonth?: boolean;
}

export default function CalendarListView({
  events,
  onSelectEvent,
  selectedEventId,
  emptyMessage = 'No events match the current filters.',
  groupByMonth = false,
}: CalendarListViewProps) {
  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated p-8 text-sm text-brand-fg-secondary">
        {emptyMessage}
      </p>
    );
  }

  const groups = groupByMonth ? groupEventsByMonth(events) : { 'Upcoming Events': events };

  return (
    <div className="space-y-8">
      {Object.entries(groups).map(([group, groupEvents]) => {
        const headingId = getGroupHeadingId(group);
        return (
          <section key={group} aria-labelledby={groupByMonth ? headingId : undefined}>
            {groupByMonth && (
              <h3 id={headingId} className="mb-3 text-lg font-bold text-brand-fg-primary">
                {group}
              </h3>
            )}
            <ul className="space-y-3" role="list">
              {groupEvents.map((event) => {
                const category = EVENT_CATEGORIES[event.category as AscaEventCategory];
                const selected = selectedEventId === event.id;
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(event)}
                      className={[
                        'flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-brand-forest sm:flex-row sm:items-center sm:justify-between',
                        selected
                          ? 'border-brand-forest bg-brand-bg-soft'
                          : 'border-brand-border-subtle bg-brand-bg-elevated hover:bg-brand-bg-subtle',
                      ].join(' ')}
                      aria-current={selected ? 'true' : undefined}
                    >
                      <div className="flex-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${category.badgeClass}`}>
                          <span className={`h-2 w-2 rounded-full ${category.dotClass}`} aria-hidden="true" />
                          {category.label}
                        </span>
                        <h4 className="mt-2 text-base font-bold text-brand-fg-primary sm:text-lg">{event.title}</h4>
                        <p className="mt-1 text-sm font-semibold text-brand-forest">{formatEventDateRange(event)}</p>
                        {event.location && (
                          <p className="mt-1 text-xs text-brand-fg-secondary">{event.location}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-brand-forest">Details →</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function groupEventsByMonth(events: AscaEvent[]): Record<string, AscaEvent[]> {
  return events.reduce((acc, event) => {
    const date = event.startDate || event.sortDate || 'Unknown';
    const month =
      date !== 'Unknown'
        ? new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        : 'Date TBA';
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {} as Record<string, AscaEvent[]>);
}

function getGroupHeadingId(group: string): string {
  return `list-group-${group.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`;
}
