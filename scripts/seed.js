#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Clear existing data
    await db.collection('themes').deleteMany({});
    await db.collection('settings').deleteMany({});
    console.log('✓ Cleared collections');

    // Create default theme
    await db.collection('themes').insertOne({
      colors: {
        primary: '#1a1a1a',
        secondary: '#4a4b02',
        accent: '#f5d800',
        neutral: '#ffffff',
      },
      fonts: {
        sans: 'system-ui',
        serif: 'Georgia',
      },
      logo: '',
      favicon: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Created default theme');

    // Create default settings
    await db.collection('settings').insertOne({
      siteTitle: 'Atlanta Saddle Club Association',
      siteDescription: 'We Ride To Inspire',
      siteUrl: 'https://atlantasaddleclub.com',
      venmoUsername: '',
      venmoPresets: [],
      notificationsEnabled: true,
      maintenanceMode: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Created default settings');

    console.log('\n✓ Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
