import type { AscaEvent } from '@/lib/content/events';

export function parseDateValue(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function formatLongDate(value?: string): string {
  const date = parseDateValue(value);
  if (!date) return 'Date TBA';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortDate(value?: string): string {
  const date = parseDateValue(value);
  if (!date) return 'Date TBA';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function formatEventDateRange(event: AscaEvent): string {
  if (event.isTba || !event.startDate) return event.dateLabel || 'Date TBA';
  if (!event.endDate || event.endDate === event.startDate) return formatLongDate(event.startDate);
  return `${formatLongDate(event.startDate)} – ${formatLongDate(event.endDate)}`;
}

export function compareEvents(a: AscaEvent, b: AscaEvent): number {
  const orderA = a.sortOrder ?? 9999;
  const orderB = b.sortOrder ?? 9999;
  if (orderA !== orderB) return orderA - orderB;

  const dateA = parseDateValue(a.startDate || a.sortDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const dateB = parseDateValue(b.startDate || b.sortDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (dateA !== dateB) return dateA - dateB;
  return a.title.localeCompare(b.title);
}

export function isKnownDateEvent(event: AscaEvent): boolean {
  return Boolean(!event.isTba && event.startDate && parseDateValue(event.startDate));
}

export function getEventEndDate(event: AscaEvent): Date | null {
  return parseDateValue(event.endDate || event.startDate);
}

export function getNextKnownEvent(events: AscaEvent[], now = new Date()): AscaEvent | null {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return [...events]
    .filter(isKnownDateEvent)
    .sort(compareEvents)
    .find((event) => {
      const endDate = getEventEndDate(event);
      return endDate ? endDate >= today : false;
    }) || null;
}

export function getInitialCalendarMonth(events: AscaEvent[], now = new Date()): Date {
  const nextEvent = getNextKnownEvent(events, now);
  const date = parseDateValue(nextEvent?.startDate) || parseDateValue(events.find(isKnownDateEvent)?.startDate) || now;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}
