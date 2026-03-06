import { MongoClient, Db } from 'mongodb';

let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db | null> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    cachedDb = client.db('asca-pwa');
    return cachedDb;
  } catch {
    return null;
  }
}

// Settings
export async function getSettings() {
  const db = await connectToDatabase();
  if (!db) return getDefaultSettings();
  try {
    const settings = await db.collection('Settings').findOne({});
    return settings || getDefaultSettings();
  } catch {
    return getDefaultSettings();
  }
}

function getDefaultSettings() {
  return {
    siteName: 'Atlanta Saddle Club Association',
    siteDescription: 'We Ride To Inspire',
    tagline: 'Promoting horsemanship, sportsmanship, and community',
    contactEmail: 'info@atlantasaddleclub.org',
    phone: '(404) 555-0123',
    address: 'Atlanta, Georgia',
    social: {
      facebook: 'https://www.facebook.com/TheRealASCA',
      instagram: 'https://www.instagram.com/therealasca/',
      twitter: 'https://twitter.com/TheRealASCA',
    },
    venmo: {
      username: '@therealasca1',
      presets: [10, 25, 50, 100],
    },
    cashApp: '$therealasca1',
    heroes: {
      home: {
        image: '/images/hero/home.jpg',
        title: 'We Ride To Inspire',
        subtitle: 'Promoting horsemanship, sportsmanship, and community',
        cta: { text: 'Get Involved', link: '/get-involved' },
      },
      about: {
        image: '/images/hero/about.jpg',
        title: 'About ASCA',
        subtitle: 'Atlanta\'s premiere saddle club. We exist to promote positive horsemanship within the community.',
      },
      members: {
        image: '/images/gallery/activity.jpg',
        title: 'Meet ASCA',
        subtitle: 'We ride to inspire those that thought it wasn\'t possible is now possible.',
      },
      calendar: {
        image: '/images/hero/calendar.jpg',
        title: 'Calendar of Events',
        subtitle: 'Join us for exciting activities and community events',
      },
      blog: {
        image: '/images/hero/blog.jpg',
        title: 'Blog',
        subtitle: 'Stories, tips, and updates from the ASCA community',
      },
      donate: {
        image: '/images/hero/donate.jpg',
        title: 'Support ASCA',
        subtitle: 'Make a difference in our community',
      },
      involved: {
        image: '/images/hero/involved.jpg',
        title: 'Get Involved',
        subtitle: 'Join our equestrian community',
      },
    },
  };
}

// Theme
export async function getTheme() {
  const db = await connectToDatabase();
  if (!db) return getDefaultTheme();
  try {
    const theme = await db.collection('Theme').findOne({});
    return theme || getDefaultTheme();
  } catch {
    return getDefaultTheme();
  }
}

function getDefaultTheme() {
  return {
    colors: {
      primary: '#1a1a1a',
      secondary: '#4a4b02',
      accent: '#f5d800',
      neutral: '#ffffff',
    },
  };
}

// Static fallback data
const staticBlogPost = {
  _id: 'static-1',
  title: 'Feeling good with Horses: Benefits of Equine Assisted Therapy',
  slug: 'benefits-of-equine-assisted-therapy',
  excerpt: 'Equine-Assisted Therapy (EAT) or equine-assisted learning or, the more well-known horseback riding, can be beneficial for people of all ages in numerous ways. Here\'s how you can benefit from the healing power of horses.',
  content: `Equine-assisted therapy encompasses a range of treatments that involve activities with horses and other equines to promote human physical and mental health.

Equine-Assisted Therapy (EAT) or equine-assisted learning or, the more well-known horseback riding, can be beneficial for people of all ages in numerous ways.

Here are some of the benefits:

**Physical Benefits:**
- Improved balance, coordination, and motor skills
- Strengthened core muscles
- Better posture and flexibility

**Emotional Benefits:**
- Reduced anxiety and stress
- Increased self-confidence and self-esteem
- Enhanced emotional awareness

**Social Benefits:**
- Improved communication skills
- Better teamwork and cooperation
- Increased empathy and trust

Horses are very sensitive and pick up on others' emotions quickly, and they accurately reflect these feelings back to the student. This creates a feedback loop that allows the student to learn new positive ways of thinking and being.`,
  author: 'Clariece Pinkney',
  image: '/images/gallery/blog-member.jpg',
  category: 'Wellness',
  published: true,
  publishedAt: new Date('2024-01-15'),
};

const staticGalleryImages = [
  { _id: 'g1', title: 'Our Horses', image: '/images/gallery/horse-closeup.jpg', description: 'Beautiful horses at ASCA', category: 'Horses' },
  { _id: 'g2', title: 'Trail Rides', image: '/images/gallery/rider.jpg', description: 'ASCA members on the trail', category: 'Trail Rides' },
  { _id: 'g3', title: 'Community', image: '/images/gallery/blog-member.jpg', description: 'ASCA community activities', category: 'Community' },
  { _id: 'g4', title: 'Activities', image: '/images/gallery/activity.jpg', description: 'Trail riding activities', category: 'Activities' },
  { _id: 'g5', title: 'Events', image: '/images/gallery/event.jpg', description: 'ASCA community event', category: 'Events' },
  { _id: 'g6', title: 'Members', image: '/images/members/member-1.jpg', description: 'ASCA members', category: 'Members' },
];

// Events
export async function getUpcomingEvents(limit = 6) {
  const db = await connectToDatabase();
  if (!db) return [];
  try {
    const now = new Date();
    const events = await db
      .collection('Events')
      .find({ date: { $gte: now }, published: true })
      .sort({ date: 1 })
      .limit(limit)
      .toArray();
    return events;
  } catch {
    return [];
  }
}

export async function getAllEvents() {
  const db = await connectToDatabase();
  if (!db) return [];
  try {
    const now = new Date();
    const events = await db
      .collection('Events')
      .find({ date: { $gte: now }, published: true })
      .sort({ date: 1 })
      .toArray();
    return events;
  } catch {
    return [];
  }
}

// Members
export async function getMembers(role?: string) {
  const db = await connectToDatabase();
  if (!db) return [];
  try {
    const query = role ? { role } : {};
    const members = await db
      .collection('Members')
      .find(query)
      .sort({ name: 1 })
      .toArray();
    return members;
  } catch {
    return [];
  }
}

// Blog Posts
export async function getBlogPosts(limit = 5) {
  const db = await connectToDatabase();
  if (!db) return [staticBlogPost];
  try {
    const posts = await db
      .collection('BlogPosts')
      .find({ published: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    return posts.length > 0 ? posts : [staticBlogPost];
  } catch {
    return [staticBlogPost];
  }
}

export async function getSingleBlogPost(slug: string) {
  const db = await connectToDatabase();
  if (!db) {
    return slug === staticBlogPost.slug ? staticBlogPost : null;
  }
  try {
    const post = await db.collection('BlogPosts').findOne({ slug });
    return post || (slug === staticBlogPost.slug ? staticBlogPost : null);
  } catch {
    return slug === staticBlogPost.slug ? staticBlogPost : null;
  }
}

// Gallery
export async function getGalleryImages(category?: string) {
  const db = await connectToDatabase();
  if (!db) {
    return category
      ? staticGalleryImages.filter((img) => img.category === category)
      : staticGalleryImages;
  }
  try {
    const query = category ? { category } : {};
    const images = await db
      .collection('GalleryImages')
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray();
    return images.length > 0 ? images : staticGalleryImages;
  } catch {
    return staticGalleryImages;
  }
}

export async function getGallery(category?: string) {
  return getGalleryImages(category);
}

// Form Submissions
export async function saveFormSubmission(
  type: string,
  data: Record<string, string>
) {
  const db = await connectToDatabase();
  if (!db) {
    console.warn('No database connection — form submission not saved');
    return;
  }
  await db.collection('FormSubmissions').insertOne({
    type,
    data,
    submittedAt: new Date(),
    status: 'new',
  });
}
