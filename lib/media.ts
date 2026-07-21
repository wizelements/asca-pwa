export type SiteImageSlot =
  | 'home.hero'
  | 'home.activity.trailRides'
  | 'home.activity.communityOutreach'
  | 'home.activity.parades'
  | 'home.activity.horsemanship'
  | 'home.activity.festivalRodeo'
  | 'home.activity.fellowship'
  | 'home.galleryPreview.1'
  | 'home.galleryPreview.2'
  | 'home.galleryPreview.3'
  | 'home.galleryPreview.4'
  | 'home.galleryPreview.5'
  | 'home.galleryPreview.6'
  | 'about.hero'
  | 'about.history'
  | 'members.hero'
  | 'members.community.1'
  | 'members.community.2'
  | 'getInvolved.hero'
  | 'support.hero'
  | 'gallery.hero'
  | 'gallery.fallback.1'
  | 'gallery.fallback.2'
  | 'gallery.fallback.3'
  | 'gallery.fallback.4'
  | 'gallery.fallback.5'
  | 'gallery.fallback.6';

export interface ManagedImage {
  id: string;
  slot: SiteImageSlot;
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  category?: string;
  sortOrder?: number;
  published?: boolean;
}

export type ManagedImageRecord = Record<string, Partial<ManagedImage> & { image?: string; subtitle?: string }>;

export const DEFAULT_LOGO = '/images/asca/logo.png';

export const DEFAULT_MANAGED_IMAGES: ManagedImage[] = [
  {
    id: 'home-hero',
    slot: 'home.hero',
    src: '/images/gallery/event.jpg',
    alt: 'ASCA riders on horseback in matching club shirts',
    title: 'Home hero group ride',
    category: 'Home',
    sortOrder: 100,
    published: true,
  },
  {
    id: 'home-activity-trail-rides',
    slot: 'home.activity.trailRides',
    src: '/images/gallery/trail-ride-1.jpg',
    alt: 'ASCA members on a group trail ride',
    title: 'Trail Rides',
    category: 'Home Activities',
    sortOrder: 110,
    published: true,
  },
  {
    id: 'home-activity-community-outreach',
    slot: 'home.activity.communityOutreach',
    src: '/images/gallery/event.jpg',
    alt: 'ASCA members at a community outreach event',
    title: 'Community Outreach',
    category: 'Home Activities',
    sortOrder: 120,
    published: true,
  },
  {
    id: 'home-activity-parades',
    slot: 'home.activity.parades',
    src: '/images/gallery/activity.jpg',
    alt: 'ASCA riders in a community parade',
    title: 'Parades',
    category: 'Home Activities',
    sortOrder: 130,
    published: true,
  },
  {
    id: 'home-activity-horsemanship',
    slot: 'home.activity.horsemanship',
    src: '/images/gallery/lesson-1.jpg',
    alt: 'ASCA horsemanship lesson in progress',
    title: 'Horsemanship',
    category: 'Home Activities',
    sortOrder: 140,
    published: true,
  },
  {
    id: 'home-activity-festival-rodeo',
    slot: 'home.activity.festivalRodeo',
    src: '/images/gallery/event-1.jpg',
    alt: 'ASCA at a festival and rodeo event',
    title: 'Festival & Rodeo Events',
    category: 'Home Activities',
    sortOrder: 150,
    published: true,
  },
  {
    id: 'home-activity-fellowship',
    slot: 'home.activity.fellowship',
    src: '/images/gallery/blog-member.jpg',
    alt: 'ASCA members enjoying fellowship together',
    title: 'Fellowship',
    category: 'Home Activities',
    sortOrder: 160,
    published: true,
  },
  {
    id: 'home-gallery-preview-1',
    slot: 'home.galleryPreview.1',
    src: '/images/gallery/horse-closeup.jpg',
    alt: 'Close-up of an ASCA horse',
    title: 'Gallery preview 1',
    category: 'Home Gallery Preview',
    sortOrder: 210,
    published: true,
  },
  {
    id: 'home-gallery-preview-2',
    slot: 'home.galleryPreview.2',
    src: '/images/gallery/rider.jpg',
    alt: 'ASCA rider on horseback',
    title: 'Gallery preview 2',
    category: 'Home Gallery Preview',
    sortOrder: 220,
    published: true,
  },
  {
    id: 'home-gallery-preview-3',
    slot: 'home.galleryPreview.3',
    src: '/images/gallery/blog-member.jpg',
    alt: 'ASCA members together at an event',
    title: 'Gallery preview 3',
    category: 'Home Gallery Preview',
    sortOrder: 230,
    published: true,
  },
  {
    id: 'home-gallery-preview-4',
    slot: 'home.galleryPreview.4',
    src: '/images/gallery/activity.jpg',
    alt: 'ASCA members on a trail ride',
    title: 'Gallery preview 4',
    category: 'Home Gallery Preview',
    sortOrder: 240,
    published: true,
  },
  {
    id: 'home-gallery-preview-5',
    slot: 'home.galleryPreview.5',
    src: '/images/gallery/event.jpg',
    alt: 'ASCA community event',
    title: 'Gallery preview 5',
    category: 'Home Gallery Preview',
    sortOrder: 250,
    published: true,
  },
  {
    id: 'home-gallery-preview-6',
    slot: 'home.galleryPreview.6',
    src: '/images/members/member-1.jpg',
    alt: 'An ASCA member with their horse',
    title: 'Gallery preview 6',
    category: 'Home Gallery Preview',
    sortOrder: 260,
    published: true,
  },
  {
    id: 'about-hero',
    slot: 'about.hero',
    src: '/images/hero/about.jpg',
    alt: 'ASCA horses and riders',
    title: 'About hero',
    category: 'About',
    sortOrder: 300,
    published: true,
  },
  {
    id: 'about-history',
    slot: 'about.history',
    src: '/images/gallery/rider.jpg',
    alt: 'An ASCA rider on horseback',
    title: 'About history image',
    category: 'About',
    sortOrder: 310,
    published: true,
  },
  {
    id: 'members-hero',
    slot: 'members.hero',
    src: '/images/gallery/activity.jpg',
    alt: 'ASCA members riding together',
    title: 'Members hero',
    category: 'Meet ASCA',
    sortOrder: 400,
    published: true,
  },
  {
    id: 'members-community-1',
    slot: 'members.community.1',
    src: '/images/gallery/activity.jpg',
    alt: 'ASCA members riding together',
    title: 'Members community image 1',
    category: 'Meet ASCA',
    sortOrder: 410,
    published: true,
  },
  {
    id: 'members-community-2',
    slot: 'members.community.2',
    src: '/images/gallery/event.jpg',
    alt: 'ASCA members at a community event',
    title: 'Members community image 2',
    category: 'Meet ASCA',
    sortOrder: 420,
    published: true,
  },
  {
    id: 'get-involved-hero',
    slot: 'getInvolved.hero',
    src: '/images/hero/involved.jpg',
    alt: 'ASCA volunteer and membership opportunities',
    title: 'Get Involved hero',
    category: 'Get Involved',
    sortOrder: 500,
    published: true,
  },
  {
    id: 'support-hero',
    slot: 'support.hero',
    src: '/images/hero/donate.jpg',
    alt: 'Support ASCA community programs',
    title: 'Support ASCA hero',
    category: 'Support ASCA',
    sortOrder: 700,
    published: true,
  },
  {
    id: 'gallery-hero',
    slot: 'gallery.hero',
    src: '/images/gallery/horse-closeup.jpg',
    alt: 'ASCA horse close-up',
    title: 'Gallery hero',
    category: 'Gallery',
    sortOrder: 800,
    published: true,
  },
  ...[
    ['/images/gallery/horse-closeup.jpg', 'Horse close-up at ASCA', 'Our Horses'],
    ['/images/gallery/rider.jpg', 'ASCA rider on horseback', 'Trail Rides'],
    ['/images/gallery/blog-member.jpg', 'ASCA member activity', 'Community'],
    ['/images/gallery/activity.jpg', 'ASCA trail ride activity', 'Activities'],
    ['/images/gallery/event.jpg', 'ASCA community event', 'Events'],
    ['/images/members/member-1.jpg', 'ASCA member', 'Members'],
  ].map(([src, alt, title], index) => ({
    id: `gallery-fallback-${index + 1}`,
    slot: `gallery.fallback.${index + 1}` as SiteImageSlot,
    src,
    alt,
    title,
    category: 'Gallery Fallback',
    sortOrder: 810 + index * 10,
    published: true,
  })),
];

const defaultsBySlot = new Map(DEFAULT_MANAGED_IMAGES.map((image) => [image.slot, image]));

export function getManagedImagesFromRecord(record: ManagedImageRecord | null | undefined): ManagedImage[] {
  return DEFAULT_MANAGED_IMAGES.map((fallback) => {
    const override = record?.[fallback.slot] || record?.[fallback.slot.replace(/\./g, '_')];
    return {
      ...fallback,
      ...override,
      id: override?.id || fallback.id,
      slot: fallback.slot,
      src: override?.src || override?.image || fallback.src,
      alt: override?.alt || fallback.alt,
      title: override?.title || fallback.title,
      published: override?.published !== false,
    };
  }).sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
}

export function managedImagesToRecord(images: ManagedImage[]): ManagedImageRecord {
  return images.reduce<ManagedImageRecord>((record, image) => {
    record[image.slot] = {
      id: image.id,
      slot: image.slot,
      src: image.src,
      alt: image.alt,
      title: image.title,
      caption: image.caption,
      category: image.category,
      sortOrder: image.sortOrder,
      published: image.published !== false,
    };
    return record;
  }, {});
}

export function getManagedImage(images: ManagedImage[], slot: SiteImageSlot): ManagedImage {
  return images.find((image) => image.slot === slot && image.published !== false) || defaultsBySlot.get(slot)!;
}

export function getManagedImagesByCategory(images: ManagedImage[]) {
  return images.reduce<Record<string, ManagedImage[]>>((groups, image) => {
    const key = image.category || 'Other';
    groups[key] = groups[key] || [];
    groups[key].push(image);
    return groups;
  }, {});
}
