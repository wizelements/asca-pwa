import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  siteName: text('site_name').notNull().default('Atlanta Saddle Club Association'),
  siteDescription: text('site_description').notNull().default('We Ride To Inspire'),
  tagline: text('tagline').notNull().default('Promoting horsemanship, sportsmanship, and community'),
  contactEmail: text('contact_email').notNull().default('info@atlantasaddleclub.org'),
  phone: text('phone').default('(404) 555-0123'),
  address: text('address').default('Atlanta, Georgia'),
  social: text('social', { mode: 'json' }).notNull().default(
    sql`'{"facebook":"https://www.facebook.com/TheRealASCA","instagram":"https://www.instagram.com/therealasca/"}'`
  ),
  venmo: text('venmo', { mode: 'json' }).notNull().default(
    sql`'{"username":"@therealasca1","presets":[10,25,50,100]}'`
  ),
  cashApp: text('cash_app').default('$therealasca1'),
  heroes: text('heroes', { mode: 'json' }).notNull().default(
    sql`'{}'`
  ),
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),
  maintenanceMode: integer('maintenance_mode', { mode: 'boolean' }).notNull().default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const theme = sqliteTable('theme', {
  id: integer('id').primaryKey(),
  colors: text('colors', { mode: 'json' }).notNull().default(
    sql`'{"primary":"#1a1a1a","secondary":"#4a4b02","accent":"#f5d800","neutral":"#ffffff"}'`
  ),
  fonts: text('fonts', { mode: 'json' }).notNull().default(
    sql`'{"sans":"system-ui","serif":"Georgia"}'`
  ),
  logo: text('logo').default(''),
  favicon: text('favicon').default(''),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role', { enum: ['admin', 'editor', 'viewer'] }).notNull().default('viewer'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  lastLogin: integer('last_login', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
  location: text('location').notNull(),
  imageUrl: text('image_url'),
  imageAlt: text('image_alt').notNull().default(''),
  capacity: integer('capacity'),
  registrationDeadline: integer('registration_deadline', { mode: 'timestamp' }),
  rsvpList: text('rsvp_list', { mode: 'json' }).notNull().default(sql`'[]'`),
  category: text('category').default('hosted'),
  month: text('month').default(''),
  dateLabel: text('date_label').default(''),
  sortOrder: integer('sort_order').default(0),
  registrationRequired: integer('registration_required', { mode: 'boolean' }).notNull().default(false),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  bio: text('bio').default(''),
  photo: text('photo').default(''),
  roles: text('roles', { mode: 'json' }).notNull().default(sql`'[]'`),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  joinDate: integer('join_date', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').default(''),
  content: text('content').notNull(),
  author: text('author').notNull(),
  image: text('image').default(''),
  category: text('category').default('general'),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  viewCount: integer('view_count').notNull().default(0),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const galleryImages = sqliteTable('gallery_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').default(''),
  category: text('category').default('general'),
  image: text('image').notNull(),
  alt: text('alt').notNull().default(''),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const formSubmissions = sqliteTable('form_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  status: text('status').notNull().default('new'),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  user: text('user').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
