import { MongoClient, Db, ObjectId } from 'mongodb';

let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db('asca-pwa');
  return cachedDb;
}

// Settings
export async function getSettings() {
  try {
    const db = await connectToDatabase();
    const settings = await db
      .collection('Settings')
      .findOne({});
    return settings || getDefaultSettings();
  } catch (error) {
    console.error('Error fetching settings:', error);
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
        title: 'Events Calendar',
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
  try {
    const db = await connectToDatabase();
    const theme = await db
      .collection('Theme')
      .findOne({});
    return theme || getDefaultTheme();
  } catch (error) {
    console.error('Error fetching theme:', error);
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

// Events
export async function getUpcomingEvents(limit = 6) {
  try {
    const db = await connectToDatabase();
    const now = new Date();
    const events = await db
      .collection('Events')
      .find({ date: { $gte: now }, published: true })
      .sort({ date: 1 })
      .limit(limit)
      .toArray();
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export async function getAllEvents() {
  try {
    const db = await connectToDatabase();
    const now = new Date();
    const events = await db
      .collection('Events')
      .find({ date: { $gte: now }, published: true })
      .sort({ date: 1 })
      .toArray();
    return events;
  } catch (error) {
    console.error('Error fetching all events:', error);
    return [];
  }
}

// Members
export async function getMembers(role?: string) {
  try {
    const db = await connectToDatabase();
    const query = role ? { role } : {};
    const members = await db
      .collection('Members')
      .find(query)
      .sort({ name: 1 })
      .toArray();
    return members;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

// Blog Posts
export async function getBlogPosts(limit = 5) {
  try {
    const db = await connectToDatabase();
    const posts = await db
      .collection('BlogPosts')
      .find({ published: true })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray();
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getSingleBlogPost(slug: string) {
  try {
    const db = await connectToDatabase();
    const post = await db
      .collection('BlogPosts')
      .findOne({ slug });
    return post;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Gallery
export async function getGalleryImages(category?: string) {
  try {
    const db = await connectToDatabase();
    const query = category ? { category } : {};
    const images = await db
      .collection('GalleryImages')
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray();
    return images;
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
}

// Alias for getGalleryImages
export async function getGallery(category?: string) {
  return getGalleryImages(category);
}

// Form Submissions
export async function saveFormSubmission(
  type: string,
  data: Record<string, string>
) {
  try {
    const db = await connectToDatabase();
    await db.collection('FormSubmissions').insertOne({
      type,
      data,
      submittedAt: new Date(),
      status: 'new',
    });
  } catch (error) {
    console.error('Error saving form submission:', error);
    throw error;
  }
}
