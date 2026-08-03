'use client';

import { useCallback } from 'react';
import {
  type AscaEvent,
  EVENT_CATEGORIES,
} from '@/lib/content/events';
import { formatShortDate, getEventEndDate, parseDateValue } from '@/lib/date';

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  events: AscaEvent[];
  selected: boolean;
  spanRows?: number;
  onSelect: (day: Date) => void;
  onSelectEvent: (event: AscaEvent) => void;
  onNavigateDay: (day: Date, offset: number) => void;
}

function sameDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isToday(day: Date): boolean {
  const now = new Date();
  return sameDate(day, new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())));
}

function isEventActiveOnDay(event: AscaEvent, day: Date): boolean {
  const start = parseDateValue(event.startDate);
  const end = getEventEndDate(event);
  if (!start || !end) return false;
  return day >= start && day <= end;
}

function eventStartsOnDay(event: AscaEvent, day: Date): boolean {
  const start = parseDateValue(event.startDate);
  return start ? sameDate(start, day) : false;
}

function isMultiDayEvent(event: AscaEvent): boolean {
  const start = parseDateValue(event.startDate);
  const end = getEventEndDate(event);
  return Boolean(start && end && !sameDate(start, end));
}

function dateKey(day: Date): string {
  return day.toISOString().slice(0, 10);
}

export default function CalendarDayCell({
  day,
  currentMonth,
  events,
  selected,
  spanRows = 0,
  onSelect,
  onSelectEvent,
  onNavigateDay,
}: CalendarDayCellProps) {
  const inMonth = day.getUTCMonth() === currentMonth.getUTCMonth();
  const dayEvents = events.filter((event) => eventStartsOnDay(event, day) && !isMultiDayEvent(event));
  const activeEvents = events.filter((event) => isEventActiveOnDay(event, day));
  const dateLabel = day.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const handleClick = useCallback(() => {
    onSelect(day);
  }, [day, onSelect]);

  const eventListOffset = spanRows > 0 ? `${spanRows * 1.45 + 0.55}rem` : '0.5rem';

  return (
    <div
      role="gridcell"
      aria-label={`${dateLabel}, ${activeEvents.length} event${activeEvents.length === 1 ? '' : 's'}`}
      aria-selected={selected}
      data-calendar-date={dateKey(day)}
      tabIndex={inMonth ? 0 : -1}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
          return;
        }

        const offsets: Record<string, number> = {
          ArrowLeft: -1,
          ArrowRight: 1,
          ArrowUp: -7,
          ArrowDown: 7,
        };
        const offset = offsets[event.key];
        if (offset) {
          event.preventDefault();
          onNavigateDay(day, offset);
        }
      }}
      className={[
        'relative min-h-[7rem] cursor-pointer border-b border-r border-brand-border-subtle p-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-forest md:min-h-[8rem]',
        inMonth ? 'bg-brand-bg-elevated' : 'bg-brand-bg-subtle/60 text-brand-fg-muted',
        selected ? 'bg-brand-bg-soft' : '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span
          className={[
            'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
            isToday(day)
              ? 'bg-brand-forest text-white'
              : 'text-brand-fg-primary',
            !inMonth && 'text-brand-fg-muted',
          ].join(' ')}
        >
          {day.getUTCDate()}
        </span>
        {activeEvents.length > 0 && (
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {activeEvents.slice(0, 3).map((event) => {
              const category = EVENT_CATEGORIES[event.category];
              return <span key={event.id} className={`h-1.5 w-1.5 rounded-full ${category.dotClass}`} />;
            })}
          </span>
        )}
      </div>

      <div className="space-y-1" role="list" style={{ marginTop: eventListOffset }}>
        {dayEvents.slice(0, 3).map((event) => {
          const category = EVENT_CATEGORIES[event.category];
          return (
            <button
              key={event.id}
              type="button"
              onClick={(eventClick) => {
                eventClick.stopPropagation();
                onSelectEvent(event);
              }}
              onKeyDown={(eventKey) => {
                if (eventKey.key === 'Enter' || eventKey.key === ' ') {
                  eventKey.preventDefault();
                  eventKey.stopPropagation();
                  onSelectEvent(event);
                }
              }}
              className="block w-full rounded-md bg-brand-bg-soft px-2 py-1 text-left text-xs font-semibold text-brand-fg-primary hover:outline hover:outline-2 hover:outline-brand-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-forest"
              aria-label={`${event.title}, ${event.category}, ${formatShortDate(event.startDate)}${event.endDate ? ` through ${formatShortDate(event.endDate)}` : ''}`}
            >
              <span
                className={`mr-1 inline-block h-2 w-2 rounded-full ${category.dotClass}`}
                aria-hidden="true"
              />
              {event.title}
              {event.endDate && (
                <span className="sr-only"> through {formatShortDate(event.endDate)}</span>
              )}
            </button>
          );
        })}
        {dayEvents.length > 3 && (
          <p className="text-xs text-brand-fg-muted">+{dayEvents.length - 3} more</p>
        )}
      </div>
    </div>
  );
}
