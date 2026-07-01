'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  type AscaEvent,
  type AscaEventCategory,
  EVENT_CATEGORIES,
} from '@/lib/content/events';
import {
  compareEvents,
  formatMonthYear,
  getEventEndDate,
  getInitialCalendarMonth,
  getNextKnownEvent,
  isKnownDateEvent,
  parseDateValue,
} from '@/lib/date';

export type CalendarView = 'month' | 'list';
export type EventFilterMode = 'all' | 'upcoming';

const CATEGORY_OPTIONS = Object.entries(EVENT_CATEGORIES) as Array<
  [AscaEventCategory, (typeof EVENT_CATEGORIES)[AscaEventCategory]]
>;

function addMonths(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function getMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function toMonthValue(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function parseMonthValue(value: string): Date | null {
  const [year, month] = value.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) return null;
  return new Date(Date.UTC(year, month - 1, 1));
}

function monthLabelFromValue(value: string): string {
  const date = parseMonthValue(value);
  return date ? formatMonthYear(date) : value;
}

function replaceEventSearchParam(params: Pick<URLSearchParams, 'toString'>, eventId: string | null): string {
  const next = new URLSearchParams(params.toString());
  if (eventId) next.set('event', eventId);
  else next.delete('event');
  const query = next.toString();
  return `/where-to-find-us${query ? `?${query}` : ''}`;
}

export type { AscaEvent } from '@/lib/content/events';

export interface UseCalendarOptions {
  events: AscaEvent[];
  defaultEventId?: string | null;
}

export interface SpanSegment {
  event: AscaEvent;
  weekIndex: number;
  row: number;
  startCol: number;
  span: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

export interface MonthOption {
  value: string;
  label: string;
  eventCount: number;
}

function matchesEventPermalink(event: AscaEvent, eventId: string): boolean {
  return event.id === eventId || eventId.startsWith(`${event.id}-`);
}

export function useCalendar({ events, defaultEventId }: UseCalendarOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const permalinkEventId = searchParams.get('event');

  const sortedEvents = useMemo(() => [...events].sort(compareEvents), [events]);
  const [currentMonth, setCurrentMonth] = useState(() => getInitialCalendarMonth(sortedEvents));
  const [selectedCategories, setSelectedCategories] = useState<AscaEventCategory[]>(
    CATEGORY_OPTIONS.map(([value]) => value)
  );
  const [view, setView] = useState<CalendarView>('month');
  const [filterMode, setFilterMode] = useState<EventFilterMode>('all');
  const [selectedEvent, setSelectedEventState] = useState<AscaEvent | null>(() => {
    if (defaultEventId) {
      const match = sortedEvents.find((event) => matchesEventPermalink(event, defaultEventId));
      if (match) return match;
    }
    return getNextKnownEvent(sortedEvents) || sortedEvents[0] || null;
  });
  const [mobileDaySelected, setMobileDaySelected] = useState<Date | null>(null);

  const filteredEvents = useMemo(
    () => sortedEvents.filter((event) => selectedCategories.includes(event.category)),
    [sortedEvents, selectedCategories]
  );

  const knownEvents = useMemo(
    () => filteredEvents.filter(isKnownDateEvent),
    [filteredEvents]
  );

  const tbaEvents = useMemo(
    () => filteredEvents.filter((event) => event.isTba || !event.startDate),
    [filteredEvents]
  );

  const nextEvent = useMemo(() => getNextKnownEvent(filteredEvents), [filteredEvents]);

  const upcomingEvents = useMemo(() => {
    const today = getToday();
    const future = knownEvents.filter((event) => {
      const end = getEventEndDate(event);
      return end ? end >= today : false;
    });
    if (filterMode === 'upcoming') return future.slice(0, 8);
    const source = future.length > 0 ? future : knownEvents;
    return source.slice(0, 8);
  }, [knownEvents, filterMode]);

  const displayEvents = useMemo(() => {
    if (filterMode === 'upcoming') {
      const today = getToday();
      return knownEvents.filter((event) => {
        const end = getEventEndDate(event);
        return end ? end >= today : false;
      });
    }
    return knownEvents;
  }, [knownEvents, filterMode]);

  const monthOptions = useMemo<MonthOption[]>(() => {
    const monthCounts = new Map<string, number>();

    knownEvents.forEach((event) => {
      const start = parseDateValue(event.startDate);
      if (!start) return;
      const end = getEventEndDate(event);
      const finalMonth = getMonthStart(end && end >= start ? end : start);
      let cursor = getMonthStart(start);

      while (cursor <= finalMonth) {
        const value = toMonthValue(cursor);
        monthCounts.set(value, (monthCounts.get(value) || 0) + 1);
        cursor = addMonths(cursor, 1);
      }
    });

    const currentValue = toMonthValue(currentMonth);
    if (!monthCounts.has(currentValue)) monthCounts.set(currentValue, 0);

    return [...monthCounts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, eventCount]) => ({
        value,
        label: monthLabelFromValue(value),
        eventCount,
      }));
  }, [knownEvents, currentMonth]);

  const setSelectedEvent = useCallback(
    (event: AscaEvent | null) => {
      setSelectedEventState(event);
      setMobileDaySelected(null);
      router.replace(replaceEventSearchParam(searchParams, event?.id || null), { scroll: false });
    },
    [router, searchParams]
  );

  const clearSelectedEvent = useCallback(() => {
    setSelectedEvent(null);
  }, [setSelectedEvent]);

  const clearPermalink = useCallback(() => {
    router.replace(replaceEventSearchParam(new URLSearchParams(window.location.search), null), { scroll: false });
  }, [router]);

  const monthDays = useMemo(() => {
    const start = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth(), 1));
    const end = new Date(Date.UTC(currentMonth.getUTCFullYear(), currentMonth.getUTCMonth() + 1, 0));
    const cursor = new Date(start);
    cursor.setUTCDate(cursor.getUTCDate() - cursor.getUTCDay());
    const days: Date[] = [];
    while (cursor <= end || cursor.getUTCDay() !== 0) {
      days.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return days;
  }, [currentMonth]);

  const gridSpanSegments = useMemo((): SpanSegment[] => {
    const weeks = chunkArray(monthDays, 7);
    const segments: SpanSegment[] = [];

    weeks.forEach((week, weekIndex) => {
      const weekStart = week[0];
      const weekEnd = week[week.length - 1];
      const occupied: Array<{ row: number; startCol: number; endCol: number }> = [];

      displayEvents.forEach((event) => {
        const start = parseDateValue(event.startDate);
        const end = getEventEndDate(event);
        if (!start || !end || sameDate(start, end)) return;
        if (end < weekStart || start > weekEnd) return;

        const startCol = Math.max(0, differenceInDays(start, weekStart));
        const endCol = Math.min(6, differenceInDays(end, weekStart));
        const span = endCol - startCol + 1;

        let candidateRow = 0;
        while (true) {
          const collision = occupied.some(
            (segment) => segment.row === candidateRow && rangesOverlap(startCol, endCol, segment.startCol, segment.endCol)
          );
          if (!collision) break;
          candidateRow += 1;
        }

        occupied.push({ row: candidateRow, startCol, endCol });
        segments.push({
          event,
          weekIndex,
          row: candidateRow,
          startCol,
          span,
          continuesBefore: start < weekStart,
          continuesAfter: end > weekEnd,
        });
      });
    });

    return segments;
  }, [monthDays, displayEvents]);

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((month) => addMonths(month, -1));
    setMobileDaySelected(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((month) => addMonths(month, 1));
    setMobileDaySelected(null);
  }, []);

  const goToToday = useCallback(() => {
    const today = getToday();
    setCurrentMonth(getMonthStart(today));
    setMobileDaySelected(null);
  }, []);

  const jumpToMonth = useCallback((value: string) => {
    const month = parseMonthValue(value);
    if (!month) return;
    setCurrentMonth(month);
    setView('month');
    setMobileDaySelected(null);
  }, []);

  const goToEventMonth = useCallback(
    (event: AscaEvent) => {
      const start = parseDateValue(event.startDate);
      if (!start) return;
      setCurrentMonth(getMonthStart(start));
      setMobileDaySelected(null);
    },
    []
  );

  const toggleCategory = useCallback((category: AscaEventCategory) => {
    setSelectedCategories((current) => {
      if (current.includes(category) && current.length === 1) return current;
      return current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category];
    });
  }, []);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'left') goToNextMonth();
      else goToPreviousMonth();
    },
    [goToNextMonth, goToPreviousMonth]
  );

  const selectDay = useCallback(
    (day: Date) => {
      setMobileDaySelected(day);
      if (!sameMonth(day, currentMonth)) {
        setCurrentMonth(getMonthStart(day));
      }
    },
    [currentMonth]
  );

  const monthLabel = useMemo(() => formatMonthYear(currentMonth), [currentMonth]);

  const canGoToday = useMemo(() => {
    const today = getToday();
    return (
      currentMonth.getUTCFullYear() !== today.getUTCFullYear() ||
      currentMonth.getUTCMonth() !== today.getUTCMonth()
    );
  }, [currentMonth]);

  useEffect(() => {
    if (permalinkEventId && selectedEvent?.id !== permalinkEventId) {
      const match = sortedEvents.find((event) => matchesEventPermalink(event, permalinkEventId));
      if (match) {
        setSelectedEventState(match);
        const start = parseDateValue(match.startDate);
        if (start) {
          setCurrentMonth(getMonthStart(start));
        }
      }
    }
  }, [permalinkEventId, sortedEvents, selectedEvent?.id]);

  return {
    currentMonth,
    currentMonthValue: toMonthValue(currentMonth),
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
    clearSelectedEvent,
    clearPermalink,
    permalinkEventId,
    mobileDaySelected,
    selectDay,
    knownEvents,
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
  };
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function differenceInDays(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((a.getTime() - b.getTime()) / msPerDay);
}

function sameDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA <= endB && startB <= endA;
}
