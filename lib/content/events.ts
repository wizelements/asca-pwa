/**
 * ASCA event calendar ("Where to Find Us").
 * This is the approved fallback/seed schedule. The public page prefers
 * admin-managed database events and falls back to this list if the database
 * has not been populated yet.
 */

export type EventCategory = 'hosted' | 'attending' | 'sponsored';
export type AscaEventCategory = EventCategory;

export interface AscaEvent {
  id: string;
  title: string;
  category: EventCategory;
  startDate?: string;
  endDate?: string;
  /** Internal ordering date for admin-managed TBA rows. Never shown as an event date. */
  sortDate?: string;
  endSortDate?: string;
  time?: string;
  month?: string;
  dateLabel?: string;
  sortOrder?: number;
  description?: string;
  location?: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaHref?: string;
  isTba?: boolean;
  published?: boolean;
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

export const MONTHLY_MEETING_LOCATION = 'Piccadilly, 2449 Godby Road, College Park, GA 30349';

export const EVENTS: AscaEvent[] = [
  {
    id: 'berry-picking-2026-06-06',
    month: 'June',
    category: 'attending',
    title: 'Berry Picking',
    startDate: '2026-06-06',
    dateLabel: '6/6',
    sortDate: '2026-06-06',
    sortOrder: 10,
    published: true,
  },
  {
    id: 'tubing-in-helen-2026-06-13',
    month: 'June',
    category: 'attending',
    title: 'Tubing in Helen',
    startDate: '2026-06-13',
    dateLabel: '6/13',
    sortDate: '2026-06-13',
    sortOrder: 20,
    published: true,
  },
  {
    id: 'juneteenth-parade-festival-2026-06-20',
    month: 'June',
    category: 'attending',
    title: 'Juneteenth Parade & Festival',
    startDate: '2026-06-20',
    dateLabel: '6/20',
    sortDate: '2026-06-20',
    sortOrder: 30,
    published: true,
  },
  {
    id: 'cowboys-vs-cowgirls-cya-challenge-2026',
    month: 'July',
    category: 'sponsored',
    title: 'Cowboys vs Cowgirls CYA Challenge',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    dateLabel: '7/1–8/31',
    sortDate: '2026-07-01',
    endSortDate: '2026-08-31',
    sortOrder: 40,
    description:
      'Collect adult underwear and donations to purchase them in support of Mobile Showers Atlanta.',
    published: true,
  },
  {
    id: 'monthly-meeting-2026-07-08',
    month: 'July',
    category: 'hosted',
    title: 'Monthly Meeting',
    startDate: '2026-07-08',
    dateLabel: '7/8',
    sortDate: '2026-07-08',
    sortOrder: 50,
    time: '7:00pm',
    location: MONTHLY_MEETING_LOCATION,
    published: true,
  },
  {
    id: 'mobile-showers-atlanta-2026-07-11',
    month: 'July',
    category: 'attending',
    title: 'Mobile Showers Atlanta',
    startDate: '2026-07-11',
    dateLabel: '7/11',
    sortDate: '2026-07-11',
    sortOrder: 60,
    registrationRequired: true,
    published: true,
  },

  {
    id: 'monthly-meeting-2026-08-05',
    month: 'August',
    category: 'hosted',
    title: 'Monthly Meeting',
    startDate: '2026-08-05',
    dateLabel: '8/5',
    sortDate: '2026-08-05',
    sortOrder: 70,
    time: '7:00pm',
    location: MONTHLY_MEETING_LOCATION,
    published: true,
  },
  {
    id: 'horsemanship-class-jds-horse-ranch-2026-08-08',
    month: 'August',
    category: 'hosted',
    title: "Horsemanship Class at JD's Horse Ranch",
    startDate: '2026-08-08',
    dateLabel: '8/8',
    sortDate: '2026-08-08',
    sortOrder: 80,
    published: true,
  },

  {
    id: 'monthly-meeting-2026-09-02',
    month: 'September',
    category: 'hosted',
    title: 'Monthly Meeting',
    startDate: '2026-09-02',
    dateLabel: '9/2',
    sortDate: '2026-09-02',
    sortOrder: 90,
    time: '7:00pm',
    location: MONTHLY_MEETING_LOCATION,
    published: true,
  },
  {
    id: 'mingo-saddle-club-fall-trail-ride-tba',
    month: 'September',
    category: 'attending',
    title: 'Mingo Saddle Club Fall Trail Ride',
    dateLabel: 'Date TBA',
    sortDate: '2026-09-30',
    sortOrder: 100,
    isTba: true,
    published: true,
  },

  {
    id: 'morris-brown-college-homecoming-parade-2026-10-03',
    month: 'October',
    category: 'attending',
    title: 'Morris Brown College Homecoming Parade',
    startDate: '2026-10-03',
    dateLabel: '10/3',
    sortDate: '2026-10-03',
    sortOrder: 110,
    published: true,
  },
  {
    id: 'monthly-meeting-2026-10-07',
    month: 'October',
    category: 'hosted',
    title: 'Monthly Meeting',
    startDate: '2026-10-07',
    dateLabel: '10/7',
    sortDate: '2026-10-07',
    sortOrder: 120,
    time: '7:00pm',
    location: MONTHLY_MEETING_LOCATION,
    published: true,
  },
  {
    id: 'tri-county-saddle-club-trail-ride-tba',
    month: 'October',
    category: 'attending',
    title: 'Tri-County Saddle Club Trail Ride',
    dateLabel: 'Date TBA',
    sortDate: '2026-10-09',
    sortOrder: 130,
    isTba: true,
    published: true,
  },
  {
    id: 'rodeo-expo-jds-horse-ranch-2026-10-24',
    month: 'October',
    category: 'hosted',
    title: "Rodeo Expo at JD's Horse Ranch",
    startDate: '2026-10-24',
    dateLabel: '10/24',
    sortDate: '2026-10-24',
    sortOrder: 140,
    published: true,
  },

  {
    id: 'monthly-meeting-2026-11-04',
    month: 'November',
    category: 'hosted',
    title: 'Monthly Meeting',
    startDate: '2026-11-04',
    dateLabel: '11/4',
    sortDate: '2026-11-04',
    sortOrder: 150,
    time: '7:00pm',
    location: MONTHLY_MEETING_LOCATION,
    published: true,
  },
  {
    id: 'cobbtown-trail-ride-tba',
    month: 'November',
    category: 'attending',
    title: 'Cobbtown Trail Ride',
    dateLabel: 'Date TBA',
    sortDate: '2026-11-30',
    sortOrder: 160,
    isTba: true,
    published: true,
  },

  {
    id: 'monthly-meeting-2026-12-02',
    month: 'December',
    category: 'hosted',
    title: 'Monthly Meeting',
    startDate: '2026-12-02',
    dateLabel: '12/2',
    sortDate: '2026-12-02',
    sortOrder: 170,
    time: '7:00pm',
    location: MONTHLY_MEETING_LOCATION,
    published: true,
  },
];
