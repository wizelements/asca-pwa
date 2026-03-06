import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: 'MONGODB_URI not set' }, { status: 500 });
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('asca-pwa');

  const results: Record<string, string> = {};

  // Seed blog post
  const existingPost = await db.collection('BlogPosts').findOne({ slug: 'benefits-of-equine-assisted-therapy' });
  if (!existingPost) {
    await db.collection('BlogPosts').insertOne({
      title: 'Feeling good with Horses: Benefits of Equine Assisted Therapy',
      slug: 'benefits-of-equine-assisted-therapy',
      excerpt: 'Equine-Assisted Therapy (EAT) or equine-assisted learning or, the more well-known horseback riding, can be beneficial for people of all ages in numerous ways. Here\'s how you can benefit from the healing power of horses.',
      content: `Equine-assisted therapy encompasses a range of treatments that involve activities with horses and other equines to promote human physical and mental health.\n\nEquine-Assisted Therapy (EAT) or equine-assisted learning or, the more well-known horseback riding, can be beneficial for people of all ages in numerous ways.\n\nHere are some of the benefits:\n\n**Physical Benefits:**\n- Improved balance, coordination, and motor skills\n- Strengthened core muscles\n- Better posture and flexibility\n\n**Emotional Benefits:**\n- Reduced anxiety and stress\n- Increased self-confidence and self-esteem\n- Enhanced emotional awareness\n\n**Social Benefits:**\n- Improved communication skills\n- Better teamwork and cooperation\n- Increased empathy and trust\n\nHorses are very sensitive and pick up on others' emotions quickly, and they accurately reflect these feelings back to the student. This creates a feedback loop that allows the student to learn new positive ways of thinking and being.`,
      author: 'Clariece Pinkney',
      category: 'Wellness',
      image: '/images/gallery/blog-member.jpg',
      published: true,
      publishedAt: new Date('2021-02-11'),
      createdAt: new Date('2021-02-11'),
    });
    results.blog = 'Blog post seeded';
  } else {
    results.blog = 'Blog post already exists';
  }

  // Seed gallery images
  const galleryCount = await db.collection('GalleryImages').countDocuments();
  if (galleryCount === 0) {
    await db.collection('GalleryImages').insertMany([
      { title: 'Our Horses', image: '/images/gallery/horse-closeup.jpg', description: 'ASCA horses up close', category: 'Horses', uploadedAt: new Date() },
      { title: 'Trail Rides', image: '/images/gallery/rider.jpg', description: 'Members on horseback', category: 'Trail Rides', uploadedAt: new Date() },
      { title: 'Community', image: '/images/gallery/blog-member.jpg', description: 'ASCA community gathering', category: 'Community', uploadedAt: new Date() },
      { title: 'Activities', image: '/images/gallery/activity.jpg', description: 'ASCA activities and events', category: 'Activities', uploadedAt: new Date() },
      { title: 'Events', image: '/images/gallery/event.jpg', description: 'Community event photos', category: 'Events', uploadedAt: new Date() },
      { title: 'Members', image: '/images/members/member-1.jpg', description: 'ASCA members', category: 'Members', uploadedAt: new Date() },
    ]);
    results.gallery = '6 gallery images seeded';
  } else {
    results.gallery = `Gallery already has ${galleryCount} images`;
  }

  // Seed settings with updated branding
  const existingSettings = await db.collection('Settings').findOne({});
  if (!existingSettings) {
    await db.collection('Settings').insertOne({
      siteName: 'Atlanta Saddle Club Association',
      siteDescription: 'We Ride To Inspire',
      tagline: 'Promoting horsemanship, sportsmanship, and community',
      contactEmail: 'info@atlantasaddleclub.org',
      social: {
        facebook: 'https://www.facebook.com/TheRealASCA',
        instagram: 'https://www.instagram.com/therealasca/',
        twitter: 'https://twitter.com/TheRealASCA',
      },
      venmo: { username: '@therealasca1', presets: [10, 25, 50, 100] },
      cashApp: '$therealasca1',
      heroes: {
        home: { image: '/images/hero/home.jpg', title: 'We Ride To Inspire', subtitle: 'Promoting horsemanship, sportsmanship, and community', cta: { text: 'Get Involved', link: '/get-involved' } },
        about: { image: '/images/hero/about.jpg', title: 'About ASCA', subtitle: "Atlanta's premiere saddle club. We exist to promote positive horsemanship within the community." },
        members: { image: '/images/gallery/activity.jpg', title: 'Meet ASCA', subtitle: "We ride to inspire those that thought it wasn't possible is now possible." },
        calendar: { image: '/images/hero/calendar.jpg', title: 'Calendar of Events', subtitle: 'Join us for exciting activities and community events' },
        blog: { image: '/images/hero/blog.jpg', title: 'Blog', subtitle: 'Stories, tips, and updates from the ASCA community' },
        donate: { image: '/images/hero/donate.jpg', title: 'Support ASCA', subtitle: 'Make a difference in our community' },
        gallery: { image: '/images/gallery/horse-closeup.jpg', title: 'Photo Gallery', subtitle: 'Moments from ASCA events and activities' },
      },
      createdAt: new Date(),
    });
    results.settings = 'Settings seeded';
  } else {
    // Update existing settings with new hero titles
    await db.collection('Settings').updateOne({}, {
      $set: {
        'heroes.about.title': 'About ASCA',
        'heroes.about.subtitle': "Atlanta's premiere saddle club. We exist to promote positive horsemanship within the community.",
        'heroes.members.title': 'Meet ASCA',
        'heroes.members.image': '/images/gallery/activity.jpg',
        'heroes.members.subtitle': "We ride to inspire those that thought it wasn't possible is now possible.",
        'heroes.gallery.image': '/images/gallery/horse-closeup.jpg',
        'social.facebook': 'https://www.facebook.com/TheRealASCA',
        'social.instagram': 'https://www.instagram.com/therealasca/',
        'social.twitter': 'https://twitter.com/TheRealASCA',
      },
    });
    results.settings = 'Settings updated with new hero titles';
  }

  // Seed theme
  const existingTheme = await db.collection('Theme').findOne({});
  if (!existingTheme) {
    await db.collection('Theme').insertOne({
      colors: {
        primary: '#1f6b3a',
        secondary: '#1f1f1f',
        accent: '#e6d543',
        neutral: '#f7f3ea',
      },
      createdAt: new Date(),
    });
    results.theme = 'Theme seeded';
  } else {
    results.theme = 'Theme already exists';
  }

  await client.close();
  return NextResponse.json({ success: true, results });
}
