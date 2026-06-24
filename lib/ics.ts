import type { AscaEvent } from '@/lib/content/events';
import { formatEventDateRange, parseDateValue } from '@/lib/date';

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function dateToIcsDate(value: string): string {
  return value.replace(/-/g, '');
}

function addOneDay(value: string): string {
  const date = parseDateValue(value);
  if (!date) return value;
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function createIcsContent(event: AscaEvent): string | null {
  if (event.isTba || !event.startDate) return null;

  const start = dateToIcsDate(event.startDate);
  const end = dateToIcsDate(addOneDay(event.endDate || event.startDate));
  const description = [event.description, event.time ? `Time: ${event.time}` : '', formatEventDateRange(event)]
    .filter(Boolean)
    .join('\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atlanta Saddle Club Association//ASCA Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@asca-pwa.vercel.app`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : '',
    description ? `DESCRIPTION:${escapeIcsText(description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export function createIcsDataHref(event: AscaEvent): string | null {
  const content = createIcsContent(event);
  if (!content) return null;
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;
}
