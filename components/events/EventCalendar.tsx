'use client';

import { useMemo, useState } from 'react';

import ManagedImage from '@/components/media/ManagedImage';
import { EVENT_CATEGORIES, type AscaEvent, type AscaEventCategory } from '@/lib/content/events';
import {
  compareEvents,
  formatEventDateRange,
  formatMonthYear,
  formatShortDate,
  getInitialCalendarMonth,
  getNextKnownEvent,
  isKnownDateEvent,
  parseDateValue,
} from '@/lib/date';
import { createIcsDataHref } from '@/lib/ics';

const CATEGORY_OPTIONS = Object.entries(EVENT_CATEGORIES) as Array<[
  AscaEventCategory,
  (typeof EVENT_CATEGORIES)[AscaEventCategory],
]>;

function addMonths(date: Date, amount: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function sameDate(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear()
    && a.getUTCMonth() === b.getUTCMonth()
    && a.getUTCDate() === b.getUTCDate();
}

function getCalendarDays(month: Date) {
  const start = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));
  const cursor = new Date(start);
  const days: Date[] = [];
  cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay());
  while (cursor <= end || cursor.getUTCDay() !== 0) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function eventStartsOnDay(event: AscaEvent, day: Date) {
  const start = parseDateValue(event.startDate);
  return start ? sameDate(start, day) : false;
}

function CategoryBadge({ category }: { category: AscaEventCategory }) {
  const config = EVENT_CATEGORIES[category];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${config.badgeClass}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}

function EventActions({ event }: { event: AscaEvent }) {
  const icsHref = createIcsDataHref(event);
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {event.ctaHref && (
        <a
          href={event.ctaHref}
          target={event.ctaHref.startsWith('http') ? '_blank' : undefined}
          rel={event.ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="btn-primary text-xs"
        >
          {event.ctaLabel || 'Learn More'}
        </a>
      )}
      {icsHref && (
        <a
          href={icsHref}
          download={`${event.id}.ics`}
          className="rounded-full border border-brand-border-subtle px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-fg-primary hover:bg-brand-bg-subtle"
        >
          Add to Calendar
        </a>
      )}
    </div>
  );
}

function EventDetails({ event }: { event: AscaEvent }) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-forest">Selected Event</p>
      <h3 id="event-details-heading" className="mt-2 text-2xl font-bold text-brand-fg-primary">{event.title}</h3>
      <div className="mt-4"><CategoryBadge category={event.category} /></div>
      {event.imageUrl && (
        <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-xl bg-brand-bg-elevated">
          <ManagedImage
            src={event.imageUrl}
            alt={event.imageAlt || event.title}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 360px"
          />
        </div>
      )}
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-brand-fg-secondary sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-brand-fg-primary">Date</dt>
          <dd>{formatEventDateRange(event)}</dd>
        </div>
        {event.time && (
          <div>
            <dt className="font-semibold text-brand-fg-primary">Time</dt>
            <dd>{event.time}</dd>
          </div>
        )}
        {event.location && (
          <div className="sm:col-span-2">
            <dt className="font-semibold text-brand-fg-primary">Location</dt>
            <dd>{event.location}</dd>
          </div>
        )}
      </dl>
      {event.description && <p className="mt-4 text-sm leading-relaxed text-brand-fg-secondary">{event.description}</p>}
      {event.registrationRequired && (
        <p className="mt-4 inline-flex rounded-full border border-brand-accent bg-brand-bg-elevated px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-fg-primary">
          Registration Required
        </p>
      )}
      <EventActions event={event} />
    </>
  );
}

function CompactEventCard({ event, onSelect }: { event: AscaEvent; onSelect: (event: AscaEvent) => void }) {
  return (
    <article className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CategoryBadge category={event.category} />
          <h3 className="mt-3 text-lg font-bold text-brand-fg-primary">{event.title}</h3>
          <p className="mt-1 text-sm font-semibold text-brand-forest">{formatEventDateRange(event)}</p>
          {event.description && <p className="mt-2 line-clamp-2 text-sm text-brand-fg-secondary">{event.description}</p>}
        </div>
        <button
          type="button"
          onClick={() => onSelect(event)}
          className="rounded-full border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle"
        >
          Details
        </button>
      </div>
    </article>
  );
}

export default function EventCalendar({ events }: { events: AscaEvent[] }) {
  const sortedEvents = useMemo(() => [...events].sort(compareEvents), [events]);
  const [currentMonth, setCurrentMonth] = useState(() => getInitialCalendarMonth(sortedEvents));
  const [selectedCategories, setSelectedCategories] = useState<AscaEventCategory[]>(CATEGORY_OPTIONS.map(([value]) => value));
  const [selectedEvent, setSelectedEvent] = useState<AscaEvent | null>(() => getNextKnownEvent(sortedEvents) || sortedEvents[0] || null);

  const filteredEvents = useMemo(
    () => sortedEvents.filter((event) => selectedCategories.includes(event.category)),
    [sortedEvents, selectedCategories],
  );
  const knownEvents = useMemo(() => filteredEvents.filter(isKnownDateEvent), [filteredEvents]);
  const tbaEvents = useMemo(() => filteredEvents.filter((event) => event.isTba || !event.startDate), [filteredEvents]);
  const nextEvent = useMemo(() => getNextKnownEvent(filteredEvents), [filteredEvents]);
  const monthDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const future = knownEvents.filter((event) => {
      const end = parseDateValue(event.endDate || event.startDate);
      return end ? end >= today : false;
    });
    return (future.length > 0 ? future : knownEvents).slice(0, 8);
  }, [knownEvents]);

  const toggleCategory = (category: AscaEventCategory) => {
    setSelectedCategories((current) => {
      if (current.includes(category) && current.length === 1) return current;
      return current.includes(category) ? current.filter((item) => item !== category) : [...current, category];
    });
  };

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated p-5 shadow-sm md:p-8" aria-labelledby="calendar-controls-heading">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="calendar-controls-heading" className="text-2xl font-bold text-brand-fg-primary">Event Calendar</h2>
            <p className="mt-1 text-sm text-brand-fg-secondary">Filter by ASCA-hosted events, events ASCA attends, and sponsored outreach.</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filter events by category">
            {CATEGORY_OPTIONS.map(([value, category]) => {
              const active = selectedCategories.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCategory(value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? 'border-brand-forest bg-brand-forest text-white' : 'border-brand-border-subtle bg-brand-bg-body text-brand-fg-primary hover:bg-brand-bg-subtle'}`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setCurrentMonth((month) => addMonths(month, -1))} className="rounded-full border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle" aria-label="Show previous month">← Previous</button>
              <h3 className="text-center text-xl font-bold text-brand-fg-primary" aria-live="polite">{formatMonthYear(currentMonth)}</h3>
              <button type="button" onClick={() => setCurrentMonth((month) => addMonths(month, 1))} className="rounded-full border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary hover:bg-brand-bg-subtle" aria-label="Show next month">Next →</button>
            </div>

            <div className="grid grid-cols-7 rounded-t-xl border border-b-0 border-brand-border-subtle bg-brand-bg-subtle text-center text-xs font-bold uppercase tracking-wide text-brand-fg-muted">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="py-3">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 overflow-hidden rounded-b-xl border border-brand-border-subtle bg-brand-bg-elevated">
              {monthDays.map((day) => {
                const inMonth = day.getUTCMonth() === currentMonth.getUTCMonth();
                const dayEvents = knownEvents.filter((event) => eventStartsOnDay(event, day));
                return (
                  <div key={day.toISOString()} className={`min-h-28 border-b border-r border-brand-border-subtle p-2 ${inMonth ? 'bg-brand-bg-elevated' : 'bg-brand-bg-subtle/60 text-brand-fg-muted'}`}>
                    <p className="text-sm font-semibold">{day.getUTCDate()}</p>
                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const category = EVENT_CATEGORIES[event.category];
                        return (
                          <button key={event.id} type="button" onClick={() => setSelectedEvent(event)} className="block w-full rounded-md bg-brand-bg-soft px-2 py-1 text-left text-xs font-semibold text-brand-fg-primary hover:outline hover:outline-2 hover:outline-brand-forest">
                            <span className={`mr-1 inline-block h-2 w-2 rounded-full ${category.dotClass}`} aria-hidden="true" />
                            {event.title}
                            {event.endDate && <span className="sr-only"> through {formatShortDate(event.endDate)}</span>}
                          </button>
                        );
                      })}
                      {dayEvents.length > 3 && <p className="text-xs text-brand-fg-muted">+{dayEvents.length - 3} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-2xl border border-brand-border-subtle bg-brand-bg-subtle p-5" aria-labelledby="event-details-heading">
            {selectedEvent ? <EventDetails event={selectedEvent} /> : <p className="text-brand-fg-secondary">Select an event to view details.</p>}
          </aside>
        </div>
      </section>

      {nextEvent && (
        <section className="rounded-2xl border border-brand-forest/20 bg-brand-forest p-6 text-white shadow-sm" aria-labelledby="next-event-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">Next Event</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 id="next-event-heading" className="text-2xl font-bold">{nextEvent.title}</h2>
              <p className="mt-1 text-amber-100">{formatEventDateRange(nextEvent)}{nextEvent.time ? ` at ${nextEvent.time}` : ''}</p>
              {nextEvent.location && <p className="mt-1 text-sm text-amber-100">{nextEvent.location}</p>}
            </div>
            <button type="button" onClick={() => setSelectedEvent(nextEvent)} className="rounded-full bg-brand-accent px-5 py-2 text-sm font-bold uppercase tracking-wide text-brand-fg-primary hover:bg-brand-accent-muted">View Details</button>
          </div>
        </section>
      )}

      <section aria-labelledby="upcoming-events-heading">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="section-label">Calendar</p>
            <h2 id="upcoming-events-heading" className="section-title mb-0">Upcoming Events</h2>
          </div>
          <p className="text-sm text-brand-fg-muted">{knownEvents.length} known-date events</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {upcomingEvents.map((event) => <CompactEventCard key={event.id} event={event} onSelect={setSelectedEvent} />)}
        </div>
      </section>

      <section aria-labelledby="tba-events-heading" className="rounded-2xl border border-brand-border-subtle bg-brand-bg-subtle p-6">
        <p className="section-label">Dates Pending</p>
        <h2 id="tba-events-heading" className="section-title mb-3">Date TBA</h2>
        <p className="mb-5 max-w-2xl text-sm text-brand-fg-secondary">
          These events are confirmed as ASCA-interest activities, but the dates are not finalized yet. They are intentionally not placed on the month calendar until dates are confirmed.
        </p>
        {tbaEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {tbaEvents.map((event) => <CompactEventCard key={event.id} event={event} onSelect={setSelectedEvent} />)}
          </div>
        ) : (
          <p className="text-sm text-brand-fg-secondary">No TBA events match the current filters.</p>
        )}
      </section>
    </div>
  );
}
