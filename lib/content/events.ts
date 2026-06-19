/**
 * ASCA event calendar ("Where to Find Us").
 * This is the approved fallback/seed schedule. The public page prefers
 * admin-managed database events and falls back to this list if the database
 * has not been populated yet.
 */

export type EventCategory =
  | 'hosted'
  | 'attending'
  | 'sponsored';

export interface AscaEvent {
  month: string;
  title: string;
  category: EventCategory;
  dateLabel: string;
  sortDate?: string;
  endSortDate?: string;
  sortOrder?: number;
  description?: string;
  location?: string;
  registrationRequired?: boolean;
}

export const EVENT_CATEGORY_VALUES: EventCategory[] = ['hosted', 'attending', 'sponsored'];

export function isEventCategory(value: string): value is EventCategory {
  return EVENT_CATEGORY_VALUES.includes(value as EventCategory);
}

export const EVENT_CATEGORIES: Record<
  EventCategory,
  { label: string; icon: string; dotClass: string; badgeClass: string }
> = {
  hosted: {
    label: 'Hosted by ASCA',
    icon: '★',
    dotClass: 'bg-brand-forest',
    badgeClass: 'bg-brand-forest text-white',
  },
  attending: {
    label: 'ASCA Will Be There',
    icon: '↗',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
  },
  sponsored: {
    label: 'Sponsored by ASCA',
    icon: '◆',
    dotClass: 'bg-purple-600',
    badgeClass: 'bg-purple-100 text-purple-900 border border-purple-300',
  },
};

/** Months in display order so the page lists them chronologically. */
export const EVENT_MONTH_ORDER = [
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const EVENTS: AscaEvent[] = [
  // June
  { month: 'June', category: 'attending', title: 'Berry Picking', dateLabel: '6/6', sortDate: '2026-06-06', sortOrder: 10 },
  { month: 'June', category: 'attending', title: 'Tubing in Helen', dateLabel: '6/13', sortDate: '2026-06-13', sortOrder: 20 },
  { month: 'June', category: 'attending', title: 'Juneteenth Parade & Festival', dateLabel: '6/20', sortDate: '2026-06-20', sortOrder: 30 },

  // July
  { month: 'July', category: 'hosted', title: 'Monthly Meeting', dateLabel: '7/8', sortDate: '2026-07-08', sortOrder: 40 },
  {
    month: 'July',
    category: 'attending',
    title: 'Mobile Showers Atlanta',
    dateLabel: '7/11',
    sortDate: '2026-07-11',
    sortOrder: 50,
    registrationRequired: true,
  },
  {
    month: 'July',
    category: 'sponsored',
    title: 'Cowboys vs Cowgirls CYA Challenge',
    dateLabel: '7/1–8/31',
    sortDate: '2026-07-01',
    endSortDate: '2026-08-31',
    sortOrder: 60,
    description:
      'Collect adult underwear and donations to purchase them in support of Mobile Showers Atlanta.',
  },

  // August
  { month: 'August', category: 'hosted', title: 'Monthly Meeting', dateLabel: '8/5', sortDate: '2026-08-05', sortOrder: 70 },
  {
    month: 'August',
    category: 'hosted',
    title: "Horsemanship Class at JD's Horse Ranch",
    dateLabel: '8/8',
    sortDate: '2026-08-08',
    sortOrder: 80,
  },

  // September
  { month: 'September', category: 'hosted', title: 'Monthly Meeting', dateLabel: '9/2', sortDate: '2026-09-02', sortOrder: 90 },
  {
    month: 'September',
    category: 'attending',
    title: 'Mingo Saddle Club Fall Trail Ride',
    dateLabel: 'Date TBA',
    sortDate: '2026-09-30',
    sortOrder: 100,
  },

  // October
  { month: 'October', category: 'hosted', title: 'Monthly Meeting', dateLabel: '10/7', sortDate: '2026-10-07', sortOrder: 120 },
  {
    month: 'October',
    category: 'attending',
    title: 'Morris Brown College Homecoming Parade',
    dateLabel: '10/3',
    sortDate: '2026-10-03',
    sortOrder: 110,
  },
  {
    month: 'October',
    category: 'attending',
    title: 'Tri-County Saddle Club Trail Ride',
    dateLabel: '10/9–10/11',
    sortDate: '2026-10-09',
    endSortDate: '2026-10-11',
    sortOrder: 130,
  },
  {
    month: 'October',
    category: 'hosted',
    title: "Rodeo Expo at JD's Horse Ranch",
    dateLabel: '10/24',
    sortDate: '2026-10-24',
    sortOrder: 140,
  },

  // November
  { month: 'November', category: 'hosted', title: 'Monthly Meeting', dateLabel: '11/4', sortDate: '2026-11-04', sortOrder: 150 },
  {
    month: 'November',
    category: 'attending',
    title: 'Cobbtown Trail Ride',
    dateLabel: 'Date TBA',
    sortDate: '2026-11-30',
    sortOrder: 160,
  },

  // December
  { month: 'December', category: 'hosted', title: 'Monthly Meeting', dateLabel: '12/2', sortDate: '2026-12-02', sortOrder: 170 },
];
