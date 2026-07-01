'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import CalendarDayCell from './CalendarDayCell';
import { formatEventDateRange } from '@/lib/date';
import { type AscaEvent, type SpanSegment } from './useCalendar';

interface CalendarMonthViewProps {
  currentMonth: Date;
  monthDays: Date[];
  knownEvents: AscaEvent[];
  selectedDay: Date | null;
  gridSpanSegments: SpanSegment[];
  onSelectDay: (day: Date) => void;
  onSelectEvent: (event: AscaEvent) => void;
  onSwipe: (direction: 'left' | 'right') => void;
  monthLabel: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getSegmentColor(event: AscaEvent): string {
  if (event.category === 'hosted') return 'bg-brand-forest text-white';
  if (event.category === 'attending') return 'bg-amber-100 text-amber-950 ring-1 ring-amber-300';
  return 'bg-purple-100 text-purple-950 ring-1 ring-purple-300';
}

function getSegmentRadius(segment: SpanSegment): string {
  if (segment.continuesBefore && segment.continuesAfter) return 'rounded-none';
  if (segment.continuesBefore) return 'rounded-l-none rounded-r-md';
  if (segment.continuesAfter) return 'rounded-l-md rounded-r-none';
  return 'rounded-md';
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function dateKey(day: Date): string {
  return day.toISOString().slice(0, 10);
}

function addDays(day: Date, offset: number): Date {
  const next = new Date(day);
  next.setUTCDate(day.getUTCDate() + offset);
  return next;
}

export default function CalendarMonthView({
  currentMonth,
  monthDays,
  knownEvents,
  selectedDay,
  gridSpanSegments,
  onSelectDay,
  onSelectEvent,
  onSwipe,
  monthLabel,
}: CalendarMonthViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const weeks = useMemo(() => chunkArray(monthDays, 7), [monthDays]);

  const onTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!touchStart) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      setTouchStart(null);
      if (Math.abs(deltaX) < 50 || Math.abs(deltaY) > Math.abs(deltaX)) return;
      onSwipe(deltaX > 0 ? 'right' : 'left');
    },
    [touchStart, onSwipe]
  );

  const onNavigateDay = useCallback(
    (day: Date, offset: number) => {
      const next = addDays(day, offset);
      onSelectDay(next);
      window.requestAnimationFrame(() => {
        const target = containerRef.current?.querySelector<HTMLElement>(`[data-calendar-date="${dateKey(next)}"]`);
        target?.focus();
      });
    },
    [onSelectDay]
  );

  return (
    <div
      ref={containerRef}
      role="grid"
      aria-label={`Calendar for ${monthLabel}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative touch-pan-y"
    >
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-7 rounded-t-xl border border-b-0 border-brand-border-subtle bg-brand-bg-subtle text-center text-xs font-bold uppercase tracking-wide text-brand-fg-muted"
      >
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-3" role="columnheader" aria-label={day}>
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </motion.div>

      <div className="overflow-hidden rounded-b-xl border border-brand-border-subtle bg-brand-bg-elevated">
        {weeks.map((week, weekIndex) => {
          const weekSegments = gridSpanSegments.filter((segment) => segment.weekIndex === weekIndex);
          const spanRows = weekSegments.reduce((max, segment) => Math.max(max, segment.row + 1), 0);

          return (
            <div key={week[0].toISOString()} className="relative" role="row">
              <div className="grid grid-cols-7" role="presentation">
                {week.map((day) => (
                  <CalendarDayCell
                    key={day.toISOString()}
                    day={day}
                    currentMonth={currentMonth}
                    events={knownEvents}
                    selected={selectedDay ? sameDate(selectedDay, day) : false}
                    spanRows={spanRows}
                    onSelect={onSelectDay}
                    onSelectEvent={onSelectEvent}
                    onNavigateDay={onNavigateDay}
                  />
                ))}
              </div>

              {weekSegments.length > 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-[2.65rem] z-10 grid grid-cols-7 gap-px px-1">
                  {weekSegments.map((segment) => (
                    <button
                      key={`${segment.event.id}-${segment.weekIndex}-${segment.startCol}`}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectEvent(segment.event);
                      }}
                      className={`pointer-events-auto h-5 px-2 text-left text-[11px] font-semibold leading-5 shadow-sm transition-transform hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-brand-forest ${getSegmentColor(segment.event)} ${getSegmentRadius(segment)}`}
                      style={{
                        gridColumn: `${segment.startCol + 1} / span ${segment.span}`,
                        transform: `translateY(${segment.row * 1.45}rem)`,
                      }}
                      aria-label={`${segment.event.title}, ${formatEventDateRange(segment.event)}`}
                    >
                      <span className="block truncate">
                        {segment.continuesBefore && <span aria-hidden="true">← </span>}
                        {segment.event.title}
                        {segment.continuesAfter && <span aria-hidden="true"> →</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-xs text-brand-fg-muted sm:hidden" aria-hidden="true">
        Swipe left or right to change months
      </p>
    </div>
  );
}

function sameDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
