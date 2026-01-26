#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI not set');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✓ Connected to MongoDB');

    // Create indexes
    const db = mongoose.connection.db;
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('✓ Created users indexes');

    // Event indexes
    await db.collection('events').createIndex({ date: 1 });
    await db.collection('events').createIndex({ published: 1 });
    console.log('✓ Created events indexes');

    // Member indexes
    await db.collection('members').createIndex({ email: 1 }, { unique: true });
    await db.collection('members').createIndex({ roles: 1 });
    console.log('✓ Created members indexes');

    // BlogPost indexes
    await db.collection('blogposts').createIndex({ slug: 1 }, { unique: true });
    await db.collection('blogposts').createIndex({ published: 1 });
    console.log('✓ Created blogpost indexes');

    // GalleryImage indexes
    await db.collection('galleryimages').createIndex({ category: 1 });
    await db.collection('galleryimages').createIndex({ featured: 1 });
    console.log('✓ Created gallery indexes');

    // FormSubmission indexes
    await db.collection('formsubmissions').createIndex({ formType: 1 });
    await db.collection('formsubmissions').createIndex({ status: 1 });
    console.log('✓ Created formsubmission indexes');

    console.log('\n✓ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
