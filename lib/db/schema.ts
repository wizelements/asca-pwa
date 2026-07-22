import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";


export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  siteName: text('site_name').notNull().default('Atlanta Saddle Club Association'),
  siteDescription: text('site_description').notNull().default('We Ride To Inspire'),
  tagline: text('tagline').notNull().default('Promoting horsemanship, sportsmanship, and community'),
  contactEmail: text('contact_email').notNull().default('info@atlantasaddleclub.org'),
  phone: text('phone').default('(404) 555-0123'),
  address: text('address').default('Atlanta, Georgia'),
  social: text('social', { mode: 'json' }).notNull().default(
    sql`'{"facebook":"https://www.facebook.com/TheRealASCA","instagram":"https://www.instagram.com/therealasca/","tiktok":"https://www.tiktok.com/@therealasca"}'`
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
  time: text('time').default(''),
  location: text('location').notNull(),
  imageUrl: text('image_url'),
  imageAlt: text('image_alt').notNull().default(''),
  ctaLabel: text('cta_label').default(''),
  ctaHref: text('cta_href').default(''),
  isTba: integer('is_tba', { mode: 'boolean' }).notNull().default(false),
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
  sortOrder: integer('sort_order').default(0),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const mediaAssets = sqliteTable('media_assets', {
  id: text('id').primaryKey(),
  dataUrl: text('data_url').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const formSubmissions = sqliteTable('form_submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  status: text('status').notNull().default('new'),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});


export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  user: text("user").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const activityCategories = sqliteTable('activity_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').default(''),
  sortOrder: integer('sort_order').default(0),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const activityAlbums = sqliteTable('activity_albums', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  categoryId: integer('category_id').notNull().references(() => activityCategories.id),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'set null' }),
  activityDate: integer('activity_date', { mode: 'timestamp' }),
  location: text('location').default(''),
  summary: text('summary').default(''),
  coverMediaAssetId: text('cover_media_asset_id').references(() => mediaAssets.id, { onDelete: 'set null' }),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  privacyReviewStatus: text('privacy_review_status', { enum: ['not_required', 'pending', 'approved', 'restricted'] }).notNull().default('not_required'),
  sortOrder: integer('sort_order').default(0),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const albumMediaAssets = sqliteTable('album_media_assets', {
  albumId: integer('album_id').notNull().references(() => activityAlbums.id, { onDelete: 'cascade' }),
  mediaAssetId: text('media_asset_id').notNull().references(() => mediaAssets.id),
  sortOrder: integer('sort_order').default(0),
  caption: text('caption').default(''),
  altText: text('alt_text').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.albumId, table.mediaAssetId] }),
}));

export const horseProfiles = sqliteTable('horse_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').default(''),
  primaryMediaAssetId: text('primary_media_asset_id').references(() => mediaAssets.id, { onDelete: 'set null' }),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  sortOrder: integer('sort_order').default(0),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const horseProfileMedia = sqliteTable('horse_profile_media', {
  horseProfileId: integer('horse_profile_id').notNull().references(() => horseProfiles.id, { onDelete: 'cascade' }),
  mediaAssetId: text('media_asset_id').notNull().references(() => mediaAssets.id),
  sortOrder: integer('sort_order').default(0),
  caption: text('caption').default(''),
  altText: text('alt_text').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.horseProfileId, table.mediaAssetId] }),
}));

export const legacyGalleryReview = sqliteTable('legacy_gallery_review', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  legacyGalleryImageId: integer('legacy_gallery_image_id').notNull().unique(),
  legacyTitle: text('legacy_title').notNull(),
  legacyCategory: text('legacy_category').notNull(),
  legacyMediaReference: text('legacy_media_reference').notNull(),
  proposedDestinationType: text('proposed_destination_type', { enum: ['album', 'horse', 'review', 'skip'] }).notNull(),
  proposedCategorySlug: text('proposed_category_slug'),
  proposedAlbumId: integer('proposed_album_id').references(() => activityAlbums.id, { onDelete: 'set null' }),
  proposedHorseProfileId: integer('proposed_horse_profile_id').references(() => horseProfiles.id, { onDelete: 'set null' }),
  migrationConfidence: text('migration_confidence', { enum: ['high', 'medium', 'low'] }).notNull(),
  reviewReason: text('review_reason').notNull(),
  reviewStatus: text('review_status', { enum: ['pending', 'approved', 'rejected', 'resolved', 'skipped'] }).notNull().default('pending'),
  privacyReviewStatus: text('privacy_review_status', { enum: ['not_required', 'pending', 'approved', 'restricted'] }).notNull().default('not_required'),
  notes: text('notes').default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
  reviewerId: integer('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
});

// --- CRM tables ---

export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["person", "organization"] }).notNull().default("person"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  organizationName: text("organization_name"),
  email: text("email"),
  phone: text("phone"),
  source: text("source").notNull().default("manual"),
  status: text("status").notNull().default("lead"),
  lifecycleStage: text("lifecycle_stage").notNull().default("awareness"),
  interests: text("interests", { mode: "json" }).notNull().default(sql`'[]'`),
  consentEmail: integer("consent_email", { mode: "boolean" }).notNull().default(false),
  consentSms: integer("consent_sms", { mode: "boolean" }).notNull().default(false),
  notesSummary: text("notes_summary").default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull(),
  formSubmissionId: integer("form_submission_id"),
  subject: text("subject"),
  message: text("message"),
  sourcePage: text("source_page"),
  status: text("status").notNull().default("new"),
  assignedTo: integer("assigned_to"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const contactNotes = sqliteTable("contact_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull(),
  authorAdminId: integer("author_admin_id").notNull(),
  note: text("note").notNull(),
  visibility: text("visibility").notNull().default("admin"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const contactTasks = sqliteTable("contact_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: integer("due_date", { mode: "timestamp" }),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  assignedTo: integer("assigned_to"),
  createdBy: integer("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const contactTags = sqliteTable("contact_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#737373"),
  category: text("category").notNull().default("custom"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const contactTagAssignments = sqliteTable("contact_tag_assignments", {
  contactId: integer("contact_id").notNull(),
  tagId: integer("tag_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  pk: primaryKey({ columns: [table.contactId, table.tagId] }),
}));

export const contactActivities = sqliteTable("contact_activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactId: integer("contact_id").notNull(),
  activityType: text("activity_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  metadata: text("metadata", { mode: "json" }).notNull().default(sql`'{}'`),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});
