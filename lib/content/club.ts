/** Member-facing club content: why people join, fun facts, activity highlights. */

export const WHY_MEMBERS_JOIN = [
  'A shared love of horses',
  'Friendship and fellowship',
  'Trail rides and events',
  'Learning opportunities',
  'Community service',
  'Leadership opportunities',
];

export interface FunFact {
  label: string;
  value: string;
}

export const FUN_FACTS: FunFact[] = [
  { label: 'Years in operation', value: '6' },
  { label: 'Members', value: '40' },
  {
    label: 'Trail rides completed',
    value: 'ASCA Hosted - 5 and has attended dozens across the Southeast',
  },
  { label: 'Parades completed', value: '10' },
  {
    label: 'Community giving',
    value: 'Volunteering at local food banks and Mobile Showers Atlanta, and completing donation drives to help the homeless',
  },
  { label: 'Black Cowboy Heritage Festival', value: 'Established in 2026' },
  {
    label: 'Trots for Tots Breakfast with Santa',
    value: '4 — collecting toys for families in need during the holidays',
  },
];

/**
 * "Our Latest Activities" cards shown on the home page.
 * TODO: swap `image` values for real 2025/2026 activity photos when available.
 * These reuse existing gallery assets as temporary placeholders.
 */
export interface ActivityHighlight {
  title: string;
  image: string;
  alt: string;
  placeholder?: boolean;
}

export const ACTIVITY_HIGHLIGHTS: ActivityHighlight[] = [
  { title: 'Trail Rides', image: '/images/gallery/trail-ride-1.jpg', alt: 'ASCA members on a group trail ride', placeholder: true },
  { title: 'Community Outreach', image: '/images/gallery/event.jpg', alt: 'ASCA members at a community outreach event', placeholder: true },
  { title: 'Parades', image: '/images/gallery/activity.jpg', alt: 'ASCA riders in a community parade', placeholder: true },
  { title: 'Horsemanship', image: '/images/gallery/lesson-1.jpg', alt: 'ASCA horsemanship lesson in progress', placeholder: true },
  { title: 'Festival & Rodeo Events', image: '/images/gallery/event-1.jpg', alt: 'ASCA at a festival and rodeo event', placeholder: true },
  { title: 'Fellowship', image: '/images/gallery/blog-member.jpg', alt: 'ASCA members enjoying fellowship together', placeholder: true },
];

export const SUPPORT_NEEDS = [
  'Socks — child and adult',
  'Underwear — adult',
  'Toiletries and hygiene supplies',
  'School supplies',
  'Horse-related equipment',
  'Event-related equipment: porta potties, bleachers',
  'Event-related services',
];

export const SUPPORT_REASONS = [
  'Quarterly horsemanship educational workshops and clinics',
  'Community outreach and service projects and events',
  'Black Cowboy Heritage Festival, Rodeo Expo, and community events',
];

export const OTHER_WAYS_TO_SUPPORT = [
  'Donate supplies: horse, safety, sanitation',
  'Become a community partner',
  'Share our events and mission',
];
