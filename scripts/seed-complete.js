require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('asca-pwa');

    console.log('🌱 Starting comprehensive seed...\n');

    // Clear existing data
    console.log('🗑️ Clearing existing collections...');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      if (!collection.name.startsWith('system')) {
        await db.collection(collection.name).deleteMany({});
      }
    }

    // Seed Settings
    console.log('📝 Seeding Settings...');
    await db.collection('Settings').insertOne({
      siteName: 'Atlanta Saddle Club Association',
      siteDescription: 'We Ride To Inspire',
      tagline: 'Promoting horsemanship, sportsmanship, and community',
      contactEmail: 'info@atlantasaddleclub.org',
      phone: '(404) 555-0123',
      address: 'Atlanta, Georgia',
      social: {
        facebook: 'https://www.facebook.com/ASCAHorsemen',
        instagram: 'https://www.instagram.com/ascahorsemen/',
        youtube: 'https://www.youtube.com/channel/UCHqFOgNrYRSvbwVAJ4zphqw',
      },
      venmo: {
        username: '@therealasca1',
        presets: [10, 25, 50, 100],
      },
      cashApp: '$therealasca1',
      heroes: {
        home: {
          image: '/images/hero-home.jpg',
          title: 'We Ride To Inspire',
          subtitle: 'Promoting horsemanship, sportsmanship, and community',
          cta: { text: 'Get Involved', link: '/get-involved' },
        },
        about: {
          image: '/images/hero-about.jpg',
          title: 'Our Story',
          subtitle: 'A legacy of equestrian excellence',
        },
        members: {
          image: '/images/hero-members.jpg',
          title: 'Our Team',
          subtitle: 'Meet the people who make ASCA happen',
        },
        calendar: {
          image: '/images/hero-calendar.jpg',
          title: 'Events Calendar',
          subtitle: 'Join us for exciting activities',
        },
        blog: {
          image: '/images/hero-blog.jpg',
          title: 'Blog',
          subtitle: 'Stories and updates from ASCA',
        },
      },
      features: [
        {
          title: 'Community',
          description: 'Connect with fellow riders and equestrian enthusiasts',
          icon: '👥',
        },
        {
          title: 'Training',
          description: 'Access expert instruction and horse care education',
          icon: '🏇',
        },
        {
          title: 'Charity',
          description: 'Make a difference through our community initiatives',
          icon: '❤️',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Theme
    console.log('🎨 Seeding Theme...');
    await db.collection('Theme').insertOne({
      colors: {
        primary: '#1a1a1a',
        secondary: '#4a4b02',
        accent: '#f5d800',
        neutral: '#ffffff',
      },
      fontFamily: {
        sans: 'system-ui, -apple-system, "Segoe UI", Roboto',
        serif: 'Georgia, serif',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Events
    console.log('📅 Seeding Events...');
    const now = new Date();
    const events = [
      {
        title: 'Monthly Members Meeting',
        description: 'Join us for our monthly gathering to discuss upcoming activities and club matters.',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        time: '7:00 PM',
        location: 'ASCA Facility, Atlanta, GA',
        image: '/images/events/placeholder.svg',
        rsvpLimit: 50,
        published: true,
        createdAt: new Date(),
      },
      {
        title: 'Spring Trail Ride',
        description: 'Experience beautiful trails with fellow riders. Beginner-friendly and all skill levels welcome.',
        date: new Date(now.getFullYear(), now.getMonth() + 1, 10),
        time: '9:00 AM',
        location: 'Stone Mountain Park, Atlanta, GA',
        image: '/images/events/placeholder.svg',
        rsvpLimit: 20,
        published: true,
        createdAt: new Date(),
      },
      {
        title: 'Horseback Riding Lessons',
        description: 'Professional instruction for beginners and intermediate riders. Learn proper technique and horse care.',
        date: new Date(now.getFullYear(), now.getMonth() + 1, 8),
        time: '2:00 PM',
        location: 'ASCA Facility, Atlanta, GA',
        image: '/images/events/placeholder.svg',
        rsvpLimit: 8,
        published: true,
        createdAt: new Date(),
      },
      {
        title: 'Community Service Ride',
        description: 'Volunteer ride to support local charities. Funds raised go to community programs.',
        date: new Date(now.getFullYear(), now.getMonth() + 2, 5),
        time: '10:00 AM',
        location: 'Atlanta, GA',
        image: '/images/events/placeholder.svg',
        rsvpLimit: 25,
        published: true,
        createdAt: new Date(),
      },
      {
        title: 'Summer Campout',
        description: 'Multi-day camping event with group rides, campfire activities, and horseback games.',
        date: new Date(now.getFullYear(), now.getMonth() + 3, 15),
        time: '10:00 AM',
        location: 'Camping Site TBD',
        image: '/images/events/placeholder.svg',
        rsvpLimit: 30,
        published: true,
        createdAt: new Date(),
      },
      {
        title: 'Holiday Party',
        description: 'Celebrate the season with ASCA members! Food, music, and great company.',
        date: new Date(now.getFullYear() + 1, 11, 10),
        time: '6:00 PM',
        location: 'Community Center, Atlanta, GA',
        image: '/images/events/placeholder.svg',
        rsvpLimit: 100,
        published: true,
        createdAt: new Date(),
      },
    ];

    await db.collection('Events').insertMany(events);

    // Seed Members
    console.log('👥 Seeding Members...');
    const members = [
      {
        name: 'Clariece Pinkney',
        role: 'Instructor',
        bio: 'With over 15 years of experience in equestrian training, Clariece is dedicated to helping riders of all levels develop their skills and confidence.',
        email: 'clariece@asca.com',
        image: '/images/members/placeholder.svg',
        createdAt: new Date(),
      },
      {
        name: 'Marcus Johnson',
        role: 'Founder',
        bio: 'Founder of ASCA, Marcus has been instrumental in building the club\'s community and mission of promoting equestrian excellence.',
        email: 'marcus@asca.com',
        image: '/images/members/placeholder.svg',
        createdAt: new Date(),
      },
      {
        name: 'Sarah Williams',
        role: 'Volunteer Coordinator',
        bio: 'Sarah manages our volunteer programs and ensures our community service initiatives run smoothly.',
        email: 'sarah@asca.com',
        image: '/images/members/placeholder.svg',
        createdAt: new Date(),
      },
      {
        name: 'David Thompson',
        role: 'Event Coordinator',
        bio: 'David plans and organizes all ASCA events, from monthly meetings to large community rides.',
        email: 'david@asca.com',
        image: '/images/members/placeholder.svg',
        createdAt: new Date(),
      },
      {
        name: 'Jessica Lee',
        role: 'Instructor',
        bio: 'Jessica specializes in working with youth riders and teaching horse care and safety.',
        email: 'jessica@asca.com',
        image: '/images/members/placeholder.svg',
        createdAt: new Date(),
      },
    ];

    await db.collection('Members').insertMany(members);

    // Seed Blog Posts
    console.log('📝 Seeding Blog Posts...');
    const blogPosts = [
      {
        title: 'Benefits of Equine Assisted Therapy',
        slug: 'benefits-equine-therapy',
        excerpt: 'Discover how working with horses can improve mental health, build confidence, and develop life skills.',
        content: `# Benefits of Equine Assisted Therapy

Equine-assisted therapy has been shown to provide numerous physical, emotional, and psychological benefits. Through working closely with the horse, our members build a gradual sense of acceptance and feeling 'liked.' This enhances a person's positive self-concept and identity.

## Physical Benefits
- Improved balance and coordination
- Stronger core and leg muscles
- Better posture and flexibility
- Increased cardiovascular health

## Emotional Benefits
- Reduced stress and anxiety
- Improved self-confidence
- Better emotional regulation
- Enhanced sense of accomplishment

## Social Benefits
- Stronger community connections
- Improved communication skills
- Greater empathy and compassion
- Meaningful friendships`,
        author: 'Clariece Pinkney',
        category: 'Equestrian',
        image: '/images/blog/placeholder.svg',
        publishedAt: new Date(now.getFullYear(), now.getMonth() - 2, 15),
        published: true,
        createdAt: new Date(),
      },
      {
        title: '5 Tips for First-Time Trail Riders',
        slug: 'tips-first-time-trail-riders',
        excerpt: 'New to trail riding? Follow these essential tips to ensure a safe and enjoyable experience.',
        content: `# 5 Tips for First-Time Trail Riders

Trail riding is an exciting way to explore nature while bonding with your horse. Here are five essential tips for beginners.

## 1. Wear Proper Safety Gear
Always wear a helmet and appropriate riding attire. Sturdy boots with heels are essential for safe foot placement in stirrups.

## 2. Start with Guided Rides
Join our guided trail rides to learn proper techniques and trail etiquette. Experienced guides ensure your safety.

## 3. Know Your Horse
Spend time with your horse beforehand. Understanding its temperament and behavior helps build confidence.

## 4. Start on Familiar Trails
Begin with well-maintained, less challenging trails before attempting more difficult terrain.

## 5. Stay Hydrated and Take Breaks
Bring plenty of water and plan rest stops. Trail riding can be physically demanding.`,
        author: 'Jessica Lee',
        category: 'Tips',
        image: '/images/blog/placeholder.svg',
        publishedAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        published: true,
        createdAt: new Date(),
      },
      {
        title: 'ASCA Community Ride Fundraiser Success',
        slug: 'asca-fundraiser-success',
        excerpt: 'Our recent community ride raised over $5,000 for local youth programs. Thank you to all participants!',
        content: `# ASCA Community Ride Fundraiser Success

Our annual community ride fundraiser was a tremendous success! With the support of our members and community, we raised over $5,000 for local youth equestrian programs.

## Event Highlights
- 40+ riders participated
- Beautiful weather for riding
- Scenic route through local parks
- Great food and company afterward

## Funds Raised
All proceeds go directly to scholarships and youth programs that introduce young people to equestrian sports.

## Thank You
We want to extend our heartfelt thanks to everyone who participated, donated, and volunteered. Your support makes a real difference in our community!`,
        author: 'David Thompson',
        category: 'Events',
        image: '/images/blog/placeholder.svg',
        publishedAt: new Date(now.getFullYear(), now.getMonth() - 3, 5),
        published: true,
        createdAt: new Date(),
      },
    ];

    await db.collection('BlogPosts').insertMany(blogPosts);

    // Seed Users
    console.log('👤 Seeding Users...');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('AsCA2024!Secure', 10);

    await db.collection('Users').insertOne({
      email: 'admin@ascapwa.org',
      password: hashedPassword,
      role: 'admin',
      name: 'ASCA Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Gallery Images
    console.log('🖼️ Seeding Gallery Images...');
    const galleryImages = [
      {
        title: 'Spring Trail Ride 2025',
        category: 'rides',
        url: '/images/gallery/placeholder.svg',
        altText: 'Group of riders on a scenic trail',
        uploadedAt: new Date(),
      },
      {
        title: 'Riding Lessons',
        category: 'lessons',
        url: '/images/gallery/placeholder.svg',
        altText: 'Instructor working with beginner rider',
        uploadedAt: new Date(),
      },
      {
        title: 'Community Event',
        category: 'events',
        url: '/images/gallery/placeholder.svg',
        altText: 'ASCA members at community gathering',
        uploadedAt: new Date(),
      },
    ];

    await db.collection('GalleryImages').insertMany(galleryImages);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Credentials:');
    console.log('Email: admin@ascapwa.org');
    console.log('Password: AsCA2024!Secure');
    console.log('\n⚠️  Change password immediately after first login!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
