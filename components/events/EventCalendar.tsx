'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ManagedImage from '@/components/media/ManagedImage';
import { EVENT_CATEGORIES, type AscaEvent, type AscaEventCategory } from '@/lib/content/events';
import { formatEventDateRange, getEventEndDate, parseDateValue } from '@/lib/date';
import CalendarListView from './CalendarListView';
import CalendarMiniMonth from './CalendarMiniMonth';
import CalendarMonthView from './CalendarMonthView';
import EventDetailModal from './EventDetailModal';
import { useCalendar } from './useCalendar';

interface EventCalendarProps {
  events: AscaEvent[];
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

function CompactEventCard({ event, onSelect }: { event: AscaEvent; onSelect: (event: AscaEvent) => void }) {
  return (
    <article className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <CategoryBadge category={event.category} />
          <h3 className="mt-3 text-lg font-bold text-brand-fg-primary">{event.title}</h3>
          <p className="mt-1 text-sm font-semibold text-brand-forest">{formatEventDateRange(event)}</p>
          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm text-brand-fg-secondary">{event.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSelect(event)}
          className="rounded-full border border-brand-border-subtle px-4 py-2 text-sm font-semibold text-brand-fg-primary transition-colors hover:bg-brand-bg-subtle focus-visible:ring-2 focus-visible:ring-brand-forest"
        >
          Details
        </button>
      </div>
    </article>
  );
}

function MobileDayDrawer({
  day,
  events,
  onSelectEvent,
}: {
  day: Date | null;
  events: AscaEvent[];
  onSelectEvent: (event: AscaEvent) => void;
}) {
  if (!day) return null;
  const dayEvents = events.filter((event) => {
    const start = parseDateValue(event.startDate);
    const end = getEventEndDate(event);
    return start && end && day >= start && day <= end;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-4 rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated p-4 shadow-sm lg:hidden"
    >
      <h4 className="text-sm font-bold uppercase tracking-wide text-brand-forest">
        Events for {day.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}
      </h4>
      {dayEvents.length === 0 ? (
        <p className="mt-2 text-sm text-brand-fg-secondary">No events on this day.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {dayEvents.map((event) => (
            <li key={event.id}>
              <CompactEventCard event={event} onSelect={onSelectEvent} />
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const {
    currentMonth,
    currentMonthValue,
    monthDays,
    monthLabel,
    monthOptions,
    selectedCategories,
    view,
    setView,
    filterMode,
    setFilterMode,
    selectedEvent,
    setSelectedEvent,
    clearPermalink,
    permalinkEventId,
    mobileDaySelected,
    selectDay,
    displayEvents,
    tbaEvents,
    nextEvent,
    upcomingEvents,
    gridSpanSegments,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    canGoToday,
    jumpToMonth,
    goToEventMonth,
    toggleCategory,
    handleSwipe,
    CATEGORY_OPTIONS,
  } = useCalendar({ events });

  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectEvent = useCallback(
    (event: AscaEvent) => {
      setSelectedEvent(event);
      setModalOpen(true);
    },
    [setSelectedEvent]
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    clearPermalink();
  }, [clearPermalink]);

  useEffect(() => {
    if (permalinkEventId && selectedEvent?.id === permalinkEventId) {
      setModalOpen(true);
    }
  }, [permalinkEventId, selectedEvent?.id]);

  const nextEventBackground = useMemo(() => {
    if (!nextEvent?.imageUrl) return undefined;
    return nextEvent.imageUrl;
  }, [nextEvent]);

  return (
    <div className="space-y-10">
      <section
        className="rounded-2xl border border-brand-border-subtle bg-brand-bg-elevated p-5 shadow-sm md:p-8"
        aria-labelledby="calendar-controls-heading"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 id="calendar-controls-heading" className="text-2xl font-bold text-brand-fg-primary">
              Event Calendar
            </h2>
            <p className="mt-1 text-sm text-brand-fg-secondary">
              Filter by ASCA-hosted events, events ASCA attends, and sponsored outreach.
            </p>
          </div>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Filter events by category"
            role="group"
          >
            {CATEGORY_OPTIONS.map(([value, category]) => {
              const active = selectedCategories.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  onClick={() => toggleCategory(value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-forest ${
                    active
                      ? 'border-brand-forest bg-brand-forest text-white'
                      : 'border-brand-border-subtle bg-brand-bg-body text-brand-fg-primary hover:bg-brand-bg-subtle'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky top-2 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border-subtle bg-brand-bg-subtle/95 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-border-subtle text-brand-fg-primary transition-colors hover:bg-brand-bg-body focus-visible:ring-2 focus-visible:ring-brand-forest"
              aria-label="Show previous month"
              title="Previous month"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-border-subtle text-brand-fg-primary transition-colors hover:bg-brand-bg-body focus-visible:ring-2 focus-visible:ring-brand-forest"
              aria-label="Show next month"
              title="Next month"
            >
              →
            </button>
            <h3 className="min-w-[10rem] text-center text-lg font-bold text-brand-fg-primary md:text-xl" aria-live="polite">
              {monthLabel}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="event-calendar-month-jump">Jump to month</label>
            <select
              id="event-calendar-month-jump"
              value={currentMonthValue}
              onChange={(event) => jumpToMonth(event.target.value)}
              className="min-h-11 rounded-full border border-brand-border-subtle bg-brand-bg-body px-4 py-2 text-sm font-semibold text-brand-fg-primary focus-visible:ring-2 focus-visible:ring-brand-forest"
              aria-label="Jump to month"
            >
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}{month.eventCount > 0 ? ` (${month.eventCount})` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={goToToday}
              disabled={!canGoToday}
              className={`min-h-11 rounded-full border border-brand-border-subtle px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-forest ${
                canGoToday
                  ? 'text-brand-fg-primary hover:bg-brand-bg-body'
                  : 'cursor-not-allowed text-brand-fg-muted opacity-70'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setFilterMode((current) => (current === 'upcoming' ? 'all' : 'upcoming'))}
              aria-pressed={filterMode === 'upcoming'}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-forest ${
                filterMode === 'upcoming'
                  ? 'border-brand-forest bg-brand-forest text-white'
                  : 'border-brand-border-subtle text-brand-fg-primary hover:bg-brand-bg-body'
              }`}
            >
              Upcoming
            </button>
            <div className="flex rounded-full border border-brand-border-subtle bg-brand-bg-body p-1">
              <button
                type="button"
                aria-pressed={view === 'month'}
                onClick={() => setView('month')}
                className={`min-h-9 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-forest ${
                  view === 'month' ? 'bg-brand-forest text-white' : 'text-brand-fg-primary hover:bg-brand-bg-subtle'
                }`}
              >
                Month
              </button>
              <button
                type="button"
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
                className={`min-h-9 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-forest ${
                  view === 'list' ? 'bg-brand-forest text-white' : 'text-brand-fg-primary hover:bg-brand-bg-subtle'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div className="order-1">
            {view === 'month' ? (
              <CalendarMonthView
                currentMonth={currentMonth}
                monthDays={monthDays}
                knownEvents={displayEvents}
                selectedDay={mobileDaySelected}
                gridSpanSegments={gridSpanSegments}
                onSelectDay={selectDay}
                onSelectEvent={handleSelectEvent}
                onSwipe={handleSwipe}
                monthLabel={monthLabel}
              />
            ) : (
              <CalendarListView
                events={displayEvents}
                onSelectEvent={handleSelectEvent}
                selectedEventId={selectedEvent?.id}
                emptyMessage="No events match the current filters."
                groupByMonth
              />
            )}

            <MobileDayDrawer
              day={mobileDaySelected}
              events={displayEvents}
              onSelectEvent={handleSelectEvent}
            />
          </div>

          <aside
            className="order-2 hidden rounded-2xl border border-brand-border-subtle bg-brand-bg-subtle p-5 xl:block"
            aria-labelledby="event-details-heading"
          >
            {selectedEvent ? (
              <EventDetailsPanel
                event={selectedEvent}
                onOpenModal={() => setModalOpen(true)}
              />
            ) : (
              <p className="text-brand-fg-secondary">Select an event to view details.</p>
            )}
            <div className="mt-6 border-t border-brand-border-subtle pt-5">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand-forest">
                Quick Day Jump
              </h4>
              <CalendarMiniMonth
                currentMonth={currentMonth}
                selectedDay={mobileDaySelected}
                events={displayEvents}
                onSelectDay={selectDay}
              />
            </div>
          </aside>
        </div>
      </section>

      {nextEvent && (
        <section
          className="relative overflow-hidden rounded-2xl border border-brand-forest/20 bg-brand-forest p-6 text-white shadow-sm"
          aria-labelledby="next-event-heading"
        >
          {nextEventBackground && (
            <div className="absolute inset-0 opacity-15">
              <ManagedImage
                src={nextEventBackground}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">Next Event</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 id="next-event-heading" className="text-2xl font-bold">{nextEvent.title}</h2>
                <div className="mt-3">
                  <CategoryBadge category={nextEvent.category} />
                </div>
                <p className="mt-1 text-amber-100">
                  {formatEventDateRange(nextEvent)}
                  {nextEvent.time ? ` at ${nextEvent.time}` : ''}
                </p>
                {nextEvent.location && (
                  <p className="mt-1 text-sm text-amber-100">{nextEvent.location}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  goToEventMonth(nextEvent);
                  handleSelectEvent(nextEvent);
                }}
                className="rounded-full bg-brand-accent px-5 py-2 text-sm font-bold uppercase tracking-wide text-brand-fg-primary transition-colors hover:bg-brand-accent-muted focus-visible:ring-2 focus-visible:ring-white"
              >
                View Details
              </button>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="upcoming-events-heading">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="section-label">Calendar</p>
            <h2 id="upcoming-events-heading" className="section-title mb-0">Upcoming Events</h2>
          </div>
          <p className="text-sm text-brand-fg-muted">{displayEvents.length} known-date events</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {upcomingEvents.map((event) => (
            <CompactEventCard key={event.id} event={event} onSelect={handleSelectEvent} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="tba-events-heading"
        className="rounded-2xl border border-brand-border-subtle bg-brand-bg-subtle p-6"
      >
        <p className="section-label">Dates Pending</p>
        <h2 id="tba-events-heading" className="section-title mb-3">Date TBA</h2>
        <p className="mb-5 max-w-2xl text-sm text-brand-fg-secondary">
          These events are confirmed as ASCA-interest activities, but the dates are not finalized yet.
          They are intentionally not placed on the month calendar until dates are confirmed.
        </p>
        {tbaEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {tbaEvents.map((event) => (
              <CompactEventCard key={event.id} event={event} onSelect={handleSelectEvent} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-brand-fg-secondary">No TBA events match the current filters.</p>
        )}
      </section>

      <EventDetailModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

function EventDetailsPanel({
  event,
  onOpenModal,
}: {
  event: AscaEvent;
  onOpenModal: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-forest">Selected Event</p>
      <h3 id="event-details-heading" className="mt-2 text-2xl font-bold text-brand-fg-primary">
        {event.title}
      </h3>
      <CategoryBadge category={event.category} />
      <dl className="mt-3 grid grid-cols-1 gap-3 text-sm text-brand-fg-secondary">
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
          <div>
            <dt className="font-semibold text-brand-fg-primary">Location</dt>
            <dd>{event.location}</dd>
          </div>
        )}
      </dl>
      {event.description && (
        <p className="text-sm leading-relaxed text-brand-fg-secondary">{event.description}</p>
      )}
      <button
        type="button"
        onClick={onOpenModal}
        className="btn-primary text-xs"
      >
        Full Details
      </button>
    </div>
  );
}
