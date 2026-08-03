import type { CanonicalCategory } from './types';

export const CANONICAL_ACTIVITY_CATEGORIES: CanonicalCategory[] = [
  { slug: 'trail-rides', name: 'Trail Rides', description: 'Group trail rides and outdoor riding events.', sortOrder: 10, active: true },
  { slug: 'community-outreach', name: 'Community Outreach', description: 'ASCA outreach, service, and community partnership events.', sortOrder: 20, active: true },
  { slug: 'parades', name: 'Parades', description: 'Parade appearances and public procession events.', sortOrder: 30, active: true },
  { slug: 'horsemanship', name: 'Horsemanship', description: 'Classes, clinics, and educational horsemanship events.', sortOrder: 40, active: true },
  { slug: 'festivals-rodeos', name: 'Festivals & Rodeos', description: 'Festivals, rodeos, and large-scale public events.', sortOrder: 50, active: true },
  { slug: 'fellowship', name: 'Fellowship', description: 'Social gatherings, fellowship events, and club get-togethers.', sortOrder: 60, active: true },
  { slug: 'club-events', name: 'Club Events', description: 'General Atlanta Saddle Club Association events and meetings.', sortOrder: 70, active: true },
];

export const CANONICAL_CATEGORY_SLUGS = CANONICAL_ACTIVITY_CATEGORIES.map((c) => c.slug);

export const LEGACY_TO_CANONICAL_CATEGORY_MAP: Record<string, string> = {
  'Trail Rides': 'trail-rides',
  'Community Outreach': 'community-outreach',
  'Parades': 'parades',
  'Horsemanship': 'horsemanship',
  'Festival & Rodeo Events': 'festivals-rodeos',
  'Festivals & Rodeos': 'festivals-rodeos',
  'Fellowship': 'fellowship',
};

export const REVIEW_REQUIRED_LEGACY_CATEGORIES = new Set([
  'Events',
  'Community',
  'Activities',
  'Members',
  'Horses',
]);

export const GENERIC_TITLE_PATTERNS = [
  /^Events?$/i,
  /^Community$/i,
  /^Activities?$/i,
  /^Members?$/i,
  /^Horses?$/i,
  /^Trail\s*Rides?$/i,
];

export function isGenericTitle(title: string): boolean {
  return GENERIC_TITLE_PATTERNS.some((pattern) => pattern.test(title.trim()));
}

export function looksLikeHorseTitle(title: string): { isHorse: boolean; name?: string } {
  const match = title.trim().match(/^Meet\s+([A-Z][A-Za-z\s]+)$/i);
  if (match) {
    return { isHorse: true, name: match[1].trim() };
  }
  return { isHorse: false };
}
