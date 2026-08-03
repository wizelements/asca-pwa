'use client';

import { type AscaEvent } from '@/lib/content/events';
import { getEventEndDate, parseDateValue } from '@/lib/date';

interface CalendarMiniMonthProps {
  currentMonth: Date;
  selectedDay: Date | null;
  events: AscaEvent[];
  onSelectDay: (day: Date) => void;
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

export default function CalendarMiniMonth({
  currentMonth,
  selectedDay,
  events,
  onSelectDay,
}: CalendarMiniMonthProps) {
  const days = getMiniMonthDays(currentMonth);

  return (
    <div className="rounded-xl border border-brand-border-subtle bg-brand-bg-elevated p-3 shadow-sm">
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-brand-fg-muted">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={`${day}-${index}`}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = day.getUTCMonth() === currentMonth.getUTCMonth();
          const active = events.some((event) => {
            const start = parseDateValue(event.startDate);
            const end = getEventEndDate(event);
            return start && end && day >= start && day <= end;
          });
          const selected = selectedDay ? sameDate(selectedDay, day) : false;
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-label={`${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}${active ? ', has events' : ''}`}
              className={[
                'aspect-square rounded-md text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-brand-forest',
                !inMonth && 'text-brand-fg-muted',
                today ? 'bg-brand-forest text-white' : 'text-brand-fg-primary hover:bg-brand-bg-subtle',
                selected && !today ? 'bg-brand-bg-soft ring-1 ring-brand-forest' : '',
                active && !today && !selected ? 'font-bold text-brand-forest' : '',
              ].join(' ')}
            >
              {day.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getMiniMonthDays(month: Date): Date[] {
  const start = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0));
  const cursor = new Date(start);
  cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay());
  const days: Date[] = [];
  while (cursor <= end || cursor.getUTCDay() !== 0) {
    days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}
