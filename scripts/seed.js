/**
 * ASCA PWA Database Seed Script
 * Populates MongoDB with initial content from atlantasaddleclub.com
 * Run: npm run db:seed or node scripts/seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

// Import models
const Event = require('../lib/models/Event');
const Member = require('../lib/models/Member');
const BlogPost = require('../lib/models/BlogPost');
const GalleryImage = require('../lib/models/GalleryImage');
const User = require('../lib/models/User');
const Theme = require('../lib/models/Theme');
const Settings = require('../lib/models/Settings');
const FormSubmission = require('../lib/models/FormSubmission');

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function seedAdminUser() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@ascapwa.org' });
    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('AsCA2024!Secure', 10);
    const admin = await User.create({
      email: 'admin@ascapwa.org',
      password: hashedPassword,
      name: 'ASCA Administrator',
      role: 'admin',
      createdAt: new Date(),
    });
    console.log('✓ Admin user created:', admin.email);
  } catch (error) {
    console.error('✗ Admin user seed failed:', error.message);
  }
}

async function seedTheme() {
  try {
    const existingTheme = await Theme.findOne({});
    if (existingTheme) {
      console.log('✓ Theme already exists');
      return;
    }

    const theme = await Theme.create({
      colors: {
        dark: '#1a1a1a',
        olive: '#4a4b02',
        gold: '#f5d800',
        white: '#ffffff',
      },
      fonts: {
        heading: 'system-ui, -apple-system, sans-serif',
        body: 'system-ui, -apple-system, sans-serif',
      },
      updatedAt: new Date(),
    });
    console.log('✓ Theme created with ASCA brand colors');
  } catch (error) {
    console.error('✗ Theme seed failed:', error.message);
  }
}

async function seedSettings() {
  try {
    const existingSettings = await Settings.findOne({});
    if (existingSettings) {
      console.log('✓ Settings already exist');
      return;
    }

    const settings = await Settings.create({
      siteTitle: 'Atlanta Saddle Club Association',
      siteDescription: 'We Ride To Inspire - Promoting horsemanship, sportsmanship, and community.',
      siteUrl: 'https://asca-pwa.vercel.app',
      contact: {
        email: 'info@atlantasaddleclub.org',
        phone: '(404) 555-0123',
        address: 'Atlanta, Georgia',
      },
      social: {
        facebook: 'https://www.facebook.com/ASCAHorsemen',
        instagram: 'https://www.instagram.com/ascahorsemen/',
        youtube: 'https://www.youtube.com/channel/UCHqFOgNrYRSvbwVAJ4zphqw',
      },
      venmo: {
        username: 'therealasca1',
        presets: [10, 25, 50, 100],
      },
      newsletter: {
        enabled: true,
        formId: 'newsletter-subscribe',
      },
      features: {
        membersDirectory: true,
        eventsCalendar: true,
        blogEnabled: true,
        donationsEnabled: true,
        formsEnabled: true,
      },
      updatedAt: new Date(),
    });
    console.log('✓ Settings created');
  } catch (error) {
    console.error('✗ Settings seed failed:', error.message);
  }
}

async function seedEvents() {
  try {
    const existingEvents = await Event.countDocuments();
    if (existingEvents > 0) {
      console.log(`✓ Events already exist (${existingEvents} events)`);
      return;
    }

    const events = [
      {
        title: 'Monthly Members Meeting',
        description: 'Join us for our monthly gathering to discuss club activities and upcoming events.',
        date: new Date('2026-02-15'),
        time: '10:00 AM',
        endTime: '12:00 PM',
        location: 'Atlanta, Georgia',
        type: 'meeting',
        capacity: 50,
        rsvpCount: 0,
        featured: true,
        createdAt: new Date(),
      },
      {
        title: 'Group Trail Ride',
        description: 'Experience the beauty of nature with fellow members on an organized trail ride.',
        date: new Date('2026-02-22'),
        time: '9:00 AM',
        endTime: '2:00 PM',
        location: 'Stone Mountain Park',
        type: 'ride',
        difficulty: 'intermediate',
        capacity: 30,
        rsvpCount: 0,
        featured: true,
        createdAt: new Date(),
      },
      {
        title: 'Beginner Riding Lesson',
        description: 'Learn the basics of horsemanship from experienced instructors.',
        date: new Date('2026-03-01'),
        time: '2:00 PM',
        endTime: '3:30 PM',
        location: 'Atlanta, Georgia',
        type: 'lesson',
        capacity: 12,
        rsvpCount: 0,
        featured: true,
        createdAt: new Date(),
      },
      {
        title: 'Spring Campout',
        description: 'Weekend camping trip with ASCA members. Bring your horse and enjoy outdoor activities.',
        date: new Date('2026-04-18'),
        time: '8:00 AM',
        endTime: '6:00 PM',
        location: 'Camping Retreat Center',
        type: 'campout',
        capacity: 40,
        rsvpCount: 0,
        featured: false,
        createdAt: new Date(),
      },
    ];

    await Event.insertMany(events);
    console.log(`✓ ${events.length} events seeded`);
  } catch (error) {
    console.error('✗ Events seed failed:', error.message);
  }
}

async function seedMembers() {
  try {
    const existingMembers = await Member.countDocuments();
    if (existingMembers > 0) {
      console.log(`✓ Members already exist (${existingMembers} members)`);
      return;
    }

    const members = [
      {
        name: 'Clariece Pinkney',
        role: 'instructor',
        bio: 'Lead instructor with 15+ years of equine experience.',
        email: 'clariece@example.com',
        phone: '(404) 555-0001',
        joinDate: new Date('2015-05-10'),
        imageUrl: '/images/members/clariece.jpg',
        featured: true,
        createdAt: new Date(),
      },
      {
        name: 'Sarah Johnson',
        role: 'rider',
        bio: 'Passionate rider dedicated to horse care and horsemanship.',
        email: 'sarah@example.com',
        phone: '(404) 555-0002',
        joinDate: new Date('2018-03-15'),
        featured: false,
        createdAt: new Date(),
      },
      {
        name: 'Marcus Williams',
        role: 'volunteer',
        bio: 'Active volunteer supporting trail maintenance and events.',
        email: 'marcus@example.com',
        phone: '(404) 555-0003',
        joinDate: new Date('2020-01-20'),
        featured: false,
        createdAt: new Date(),
      },
      {
        name: 'Jennifer Lee',
        role: 'instructor',
        bio: 'Specialized in beginner lessons and horse training.',
        email: 'jennifer@example.com',
        phone: '(404) 555-0004',
        joinDate: new Date('2017-07-08'),
        featured: false,
        createdAt: new Date(),
      },
    ];

    await Member.insertMany(members);
    console.log(`✓ ${members.length} members seeded`);
  } catch (error) {
    console.error('✗ Members seed failed:', error.message);
  }
}

async function seedBlogPosts() {
  try {
    const existingBlog = await BlogPost.countDocuments();
    if (existingBlog > 0) {
      console.log(`✓ Blog posts already exist (${existingBlog} posts)`);
      return;
    }

    const posts = [
      {
        title: 'Feeling good with Horses: Benefits of Equine Assisted Therapy',
        slug: 'benefits-of-equine-assisted-therapy',
        excerpt: 'Equine-assisted therapy encompasses a range of treatments that involve activities with horses and other equines to promote human physical and mental wellness.',
        content: `<h2>What is Equine Assisted Therapy?</h2>
<p>Equine-assisted therapy (EAT) is an innovative approach that combines the power of horses with therapeutic techniques to improve physical, emotional, and psychological well-being.</p>

<h3>Benefits</h3>
<ul>
  <li>Improved emotional regulation and stress relief</li>
  <li>Enhanced self-confidence and self-esteem</li>
  <li>Better social skills and relationship building</li>
  <li>Physical therapy and motor skill development</li>
  <li>Increased sense of responsibility and empathy</li>
</ul>

<p>The bonding with the horse is key. Through working closely with the horse, participants build a gradual sense of acceptance and feeling "liked." This enhances a person's positive self-concept and identity.</p>`,
        author: 'Clariece Pinkney',
        authorId: null,
        readTime: '3 min',
        featured: true,
        published: true,
        publishedAt: new Date('2021-02-11'),
        createdAt: new Date('2021-02-11'),
        updatedAt: new Date('2021-02-11'),
      },
    ];

    await BlogPost.insertMany(posts);
    console.log(`✓ ${posts.length} blog posts seeded`);
  } catch (error) {
    console.error('✗ Blog posts seed failed:', error.message);
  }
}

async function seedGalleryImages() {
  try {
    const existingGallery = await GalleryImage.countDocuments();
    if (existingGallery > 0) {
      console.log(`✓ Gallery images already exist (${existingGallery} images)`);
      return;
    }

    const images = [
      {
        title: 'Group Trail Ride',
        altText: 'ASCA members riding horses on a scenic trail',
        imageUrl: '/images/gallery/trail-ride.jpg',
        description: 'Members enjoying a group trail ride through nature.',
        category: 'rides',
        featured: true,
        uploadedAt: new Date(),
        createdAt: new Date(),
      },
      {
        title: 'Riding Lesson',
        altText: 'Instructor teaching a beginner rider',
        imageUrl: '/images/gallery/lesson.jpg',
        description: 'Instruction in progress at our facility.',
        category: 'lessons',
        featured: true,
        uploadedAt: new Date(),
        createdAt: new Date(),
      },
      {
        title: 'Club Meeting',
        altText: 'ASCA members gathered for monthly meeting',
        imageUrl: '/images/gallery/meeting.jpg',
        description: 'Members discussing upcoming events.',
        category: 'meetings',
        featured: false,
        uploadedAt: new Date(),
        createdAt: new Date(),
      },
    ];

    await GalleryImage.insertMany(images);
    console.log(`✓ ${images.length} gallery images seeded`);
  } catch (error) {
    console.error('✗ Gallery images seed failed:', error.message);
  }
}

async function main() {
  console.log('\n=== ASCA PWA Database Seed ===\n');

  await connectDB();

  await seedAdminUser();
  await seedTheme();
  await seedSettings();
  await seedEvents();
  await seedMembers();
  await seedBlogPosts();
  await seedGalleryImages();

  console.log('\n✓ Seed complete!\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
