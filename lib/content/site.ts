/**
 * Centralized ASCA site content.
 * Update club-wide facts, links, and contact details here.
 */

export const MEETING = {
  cadence: '1st Wednesday of each month',
  time: '7:00pm',
  venue: 'Piccadilly',
  address: '2449 Godby Road, College Park, GA 30349',
  /** Short single-line summary used in callouts. */
  summary:
    'We meet on the 1st Wednesday of each month at 7pm at Piccadilly, 2449 Godby Road, College Park GA 30349.',
};

export const MEMBERSHIP_APPLICATION_URL =
  'https://form.jotform.com/250195865459167';

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/TheRealASCA',
  instagram: 'https://www.instagram.com/therealasca/',
  /** TikTok page — update to the real handle once confirmed. */
  tiktok: 'https://www.tiktok.com/@therealasca',
  tiktokComingSoon: false,
};

export const CONTACT_EMAILS = {
  primary: 'info@atlantasaddleclub.com',
  secondary: 'therealasca@gmail.com',
};

export const DONATION_METHODS = [
  { label: 'Cash App', handle: '$therealasca1' },
  { label: 'Zelle', handle: 'therealasca@gmail.com' },
];

/** Canonical primary navigation (used by Header and Footer). */
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/members', label: 'Meet ASCA' },
  { href: '/get-involved', label: 'Get Involved' },
  { href: '/where-to-find-us', label: 'Event Calendar' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/support-asca', label: 'Support ASCA' },
];

/** Footer navigation per client request. */
export const FOOTER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/members', label: 'Meet ASCA' },
  { href: '/get-involved', label: 'Get Involved' },
  { href: '/where-to-find-us', label: 'Event Calendar' },
  { href: '/gallery', label: 'Club Activity / Photo Gallery' },
  { href: '/support-asca', label: 'Support ASCA' },
  { href: '/#contact', label: 'Contact' },
];
