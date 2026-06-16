/**
 * ASCA event calendar ("Where to Find Us").
 * Add or update events here — the page renders directly from this array.
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
  description?: string;
  location?: string;
  registrationRequired?: boolean;
}

export const EVENT_CATEGORIES: Record<
  EventCategory,
  { label: string; dotClass: string; badgeClass: string }
> = {
  hosted: {
    label: 'Hosted by ASCA',
    dotClass: 'bg-brand-forest',
    badgeClass: 'bg-brand-forest text-white',
  },
  attending: {
    label: 'ASCA Will Be There',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
  },
  sponsored: {
    label: 'Sponsored by ASCA',
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
  { month: 'June', category: 'attending', title: 'Berry Picking', dateLabel: '6/6' },
  { month: 'June', category: 'attending', title: 'Tubing in Helen', dateLabel: '6/13' },
  { month: 'June', category: 'attending', title: 'Juneteenth Parade & Festival', dateLabel: '6/20' },

  // July
  { month: 'July', category: 'hosted', title: 'Monthly Meeting', dateLabel: '7/8' },
  {
    month: 'July',
    category: 'attending',
    title: 'Mobile Showers Atlanta',
    dateLabel: '7/11',
    registrationRequired: true,
  },
  {
    month: 'July',
    category: 'sponsored',
    title: 'Cowboys vs Cowgirls CYA Challenge',
    dateLabel: '7/1 – 8/31',
    description:
      'Collect adult underwear and donations to purchase them in support of Mobile Showers Atlanta.',
  },

  // August
  { month: 'August', category: 'hosted', title: 'Monthly Meeting', dateLabel: '8/5' },
  {
    month: 'August',
    category: 'hosted',
    title: 'Horsemanship Class at JD’s Horse Ranch',
    dateLabel: '8/8',
  },

  // September
  { month: 'September', category: 'hosted', title: 'Monthly Meeting', dateLabel: '9/2' },
  {
    month: 'September',
    category: 'attending',
    title: 'Mingo Saddle Club Fall Trail Ride',
    dateLabel: 'Date TBA',
  },

  // October
  { month: 'October', category: 'hosted', title: 'Monthly Meeting', dateLabel: '10/7' },
  {
    month: 'October',
    category: 'attending',
    title: 'Morris Brown College Homecoming Parade',
    dateLabel: '10/3',
  },
  {
    month: 'October',
    category: 'attending',
    title: 'Tri-County Saddle Club Trail Ride',
    dateLabel: '10/9 – 11',
  },
  {
    month: 'October',
    category: 'hosted',
    title: 'Rodeo Expo at JD’s Horse Ranch',
    dateLabel: '10/24',
  },

  // November
  { month: 'November', category: 'hosted', title: 'Monthly Meeting', dateLabel: '11/4' },
  {
    month: 'November',
    category: 'attending',
    title: 'Cobbtown Trail Ride',
    dateLabel: 'Date TBA',
  },

  // December
  { month: 'December', category: 'hosted', title: 'Monthly Meeting', dateLabel: '12/2' },
];
