import { getDb } from '@/lib/db';
import { createMediaAsset } from '@/lib/media-storage';

export type Role = 'admin' | 'editor' | 'viewer';

export interface Social {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface Venmo {
  username?: string;
  presets?: number[];
  zelle?: string;
}

export interface Hero {
  id?: string;
  slot?: string;
  src?: string;
  image?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  category?: string;
  sortOrder?: number;
  published?: boolean;
  cta?: { text: string; link: string };
}

export interface Settings {
  id: number;
  siteName: string;
  siteDescription: string;
  tagline: string;
  contactEmail: string;
  phone: string;
  address: string;
  social: Social;
  venmo: Venmo;
  cashApp: string;
  heroes: Record<string, Hero>;
  notificationsEnabled: boolean;
  maintenanceMode: boolean;
  updatedAt?: Date;
}

export interface Theme {
  id: number;
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    neutral?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
  fonts: {
    sans?: string;
    serif?: string;
    heading?: string;
    body?: string;
  };
  logo: string;
  favicon: string;
  updatedAt?: Date;
}

export interface User {
  id: number;
  email: string;
  password: string;
  name?: string;
  role: Role;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  endDate: Date;
  time?: string;
  location: string;
  imageUrl?: string;
  imageAlt: string;
  ctaLabel?: string;
  ctaHref?: string;
  isTba: boolean;
  capacity?: number;
  registrationDeadline?: Date;
  rsvpList: string[];
  category: string;
  month?: string;
  dateLabel?: string;
  sortOrder?: number;
  registrationRequired: boolean;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  photo?: string;
  roles: string[];
  isActive: boolean;
  isVerified: boolean;
  joinDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: string;
  image?: string;
  category: string;
  published: boolean;
  viewCount: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  category: string;
  image: string;
  alt: string;
  sortOrder?: number;
  published: boolean;
  uploadedAt?: Date;
}

export interface FormSubmission {
  id: number;
  type: string;
  data: Record<string, string>;
  status: 'new' | 'replied' | 'resolved';
  submittedAt?: Date;
}

export interface Stats {
  totalEvents: number;
  publishedEvents: number;
  totalMembers: number;
  activeMembers: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalGalleryImages: number;
  totalFormSubmissions: number;
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function sanitizeSocial(value: Social | Record<string, unknown> | null | undefined): Social {
  return {
    facebook: typeof value?.facebook === 'string' ? value.facebook : undefined,
    instagram: typeof value?.instagram === 'string' ? value.instagram : undefined,
    tiktok: typeof value?.tiktok === 'string' ? value.tiktok : undefined,
  };
}

function rowToSettings(row: any): Settings {
  const social = parseJson<Social>(row.social, {});

  return {
    id: row.id,
    siteName: row.site_name,
    siteDescription: row.site_description,
    tagline: row.tagline,
    contactEmail: row.contact_email,
    phone: row.phone,
    address: row.address,
    social: sanitizeSocial(social),
    venmo: parseJson<Venmo>(row.venmo, {}),
    cashApp: row.cash_app,
    heroes: parseJson<Record<string, Hero>>(row.heroes, {}),
    notificationsEnabled: Boolean(row.notifications_enabled),
    maintenanceMode: Boolean(row.maintenance_mode),
    updatedAt: row.updated_at ? new Date(row.updated_at * 1000) : undefined,
  };
}

function rowToTheme(row: any): Theme {
  return {
    id: row.id,
    colors: parseJson(row.colors, { primary: '#1a1a1a', secondary: '#4a4b02', accent: '#f5d800', neutral: '#ffffff' }),
    fonts: parseJson(row.fonts, { sans: 'system-ui', serif: 'Georgia' }),
    logo: row.logo,
    favicon: row.favicon,
    updatedAt: row.updated_at ? new Date(row.updated_at * 1000) : undefined,
  };
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    name: row.name,
    role: row.role as Role,
    isActive: Boolean(row.is_active),
    lastLogin: row.last_login ? new Date(row.last_login * 1000) : undefined,
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
  };
}

function rowToEvent(row: any): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: new Date(row.date * 1000),
    endDate: new Date(row.end_date * 1000),
    time: row.time || undefined,
    location: row.location,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    ctaLabel: row.cta_label || undefined,
    ctaHref: row.cta_href || undefined,
    isTba: Boolean(row.is_tba),
    capacity: row.capacity ?? undefined,
    registrationDeadline: row.registration_deadline ? new Date(row.registration_deadline * 1000) : undefined,
    rsvpList: parseJson<string[]>(row.rsvp_list, []),
    category: row.category,
    month: row.month || undefined,
    dateLabel: row.date_label || undefined,
    sortOrder: row.sort_order ?? undefined,
    registrationRequired: Boolean(row.registration_required),
    published: Boolean(row.published),
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at * 1000) : undefined,
  };
}

function rowToMember(row: any): Member {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    bio: row.bio,
    photo: row.photo,
    roles: parseJson<string[]>(row.roles, []),
    isActive: Boolean(row.is_active),
    isVerified: Boolean(row.is_verified),
    joinDate: row.join_date ? new Date(row.join_date * 1000) : undefined,
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at * 1000) : undefined,
  };
}

function rowToBlogPost(row: any): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    image: row.image,
    category: row.category,
    published: Boolean(row.published),
    viewCount: row.view_count,
    publishedAt: row.published_at ? new Date(row.published_at * 1000) : undefined,
    createdAt: row.created_at ? new Date(row.created_at * 1000) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at * 1000) : undefined,
  };
}

function rowToGalleryImage(row: any): GalleryImage {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    image: row.image,
    alt: row.alt,
    sortOrder: row.sort_order ?? undefined,
    published: row.published === undefined ? true : Boolean(row.published),
    uploadedAt: row.uploaded_at ? new Date(row.uploaded_at * 1000) : undefined,
  };
}

function rowToFormSubmission(row: any): FormSubmission {
  return {
    id: row.id,
    type: row.type,
    data: parseJson<Record<string, string>>(row.data, {}),
    status: row.status as FormSubmission['status'],
    submittedAt: row.submitted_at ? new Date(row.submitted_at * 1000) : undefined,
  };
}

export async function getSettings(): Promise<Settings> {
  const db = getDb();
  const result = await db.execute('SELECT * FROM settings WHERE id = 1');
  if (result.rows.length === 0) {
    throw new Error('Settings not found');
  }
  return rowToSettings(result.rows[0]);
}

export async function getSiteTagline(): Promise<string> {
  const db = getDb();
  const result = await db.execute('SELECT tagline FROM settings WHERE id = 1');
  const tagline = result.rows[0]?.tagline;
  return typeof tagline === 'string' ? tagline : '';
}

async function storeInlineImage(source: string | undefined): Promise<string | undefined> {
  return source?.startsWith('data:image/') ? createMediaAsset(source) : source;
}

async function storeInlineHeroImages(heroes: Record<string, Hero>): Promise<Record<string, Hero>> {
  const entries = await Promise.all(Object.entries(heroes).map(async ([slot, image]) => {
    const source = image.src || image.image || '';
    const src = await storeInlineImage(source);
    const normalized = { ...image, src };
    delete normalized.image;
    return [slot, normalized] as const;
  }));
  return Object.fromEntries(entries);
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  const db = getDb();
  const current = await getSettings();
  const heroes = data.heroes ? await storeInlineHeroImages(data.heroes) : current.heroes;
  const merged = { ...current, ...data, heroes, social: sanitizeSocial(data.social ?? current.social) };

  await db.execute({
    sql: `UPDATE settings SET
      site_name = ?, site_description = ?, tagline = ?, contact_email = ?, phone = ?, address = ?,
      social = ?, venmo = ?, cash_app = ?, heroes = ?, notifications_enabled = ?, maintenance_mode = ?,
      updated_at = unixepoch()
    WHERE id = 1`,
    args: [
      merged.siteName,
      merged.siteDescription,
      merged.tagline,
      merged.contactEmail,
      merged.phone,
      merged.address,
      JSON.stringify(merged.social),
      JSON.stringify(merged.venmo),
      merged.cashApp,
      JSON.stringify(merged.heroes),
      Number(merged.notificationsEnabled),
      Number(merged.maintenanceMode),
    ],
  });

  return getSettings();
}

export async function getTheme(): Promise<Theme> {
  const db = getDb();
  const result = await db.execute('SELECT * FROM theme WHERE id = 1');
  if (result.rows.length === 0) {
    throw new Error('Theme not found');
  }
  return rowToTheme(result.rows[0]);
}

async function storeInlineThemeImages(theme: Partial<Theme>): Promise<Partial<Theme>> {
  const patch: Partial<Theme> = { ...theme };
  if (theme.logo !== undefined) patch.logo = await storeInlineImage(theme.logo);
  if (theme.favicon !== undefined) patch.favicon = await storeInlineImage(theme.favicon);
  return patch;
}

export async function updateTheme(raw: Partial<Theme>): Promise<Theme> {
  const data = await storeInlineThemeImages(raw);
  const db = getDb();
  const current = await getTheme();
  const merged = { ...current, ...data };

  await db.execute({
    sql: `UPDATE theme SET
      colors = ?, fonts = ?, logo = ?, favicon = ?, updated_at = unixepoch()
    WHERE id = 1`,
    args: [
      JSON.stringify(merged.colors),
      JSON.stringify(merged.fonts),
      merged.logo,
      merged.favicon,
    ],
  });

  return getTheme();
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE lower(email) = ?',
    args: [email.toLowerCase()],
  });
  if (result.rows.length === 0) return null;
  return rowToUser(result.rows[0]);
}

export async function updateUserLogin(userId: number): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'UPDATE users SET last_login = unixepoch() WHERE id = ?',
    args: [userId],
  });
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'UPDATE users SET password = ? WHERE id = ?',
    args: [passwordHash, userId],
  });
}

export async function getEvents(published?: boolean): Promise<Event[]> {
  const db = getDb();
  let sql = 'SELECT * FROM events';
  const args: any[] = [];
  if (published !== undefined) {
    sql += ' WHERE published = ?';
    args.push(Number(published));
  }
  sql += ' ORDER BY COALESCE(sort_order, 9999), date ASC, id ASC';
  const result = await db.execute({ sql, args });
  return result.rows.map(rowToEvent);
}

export async function getEventById(id: number): Promise<Event | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM events WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToEvent(result.rows[0]);
}

export async function createEvent(data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
  const db = getDb();
  const imageUrl = await storeInlineImage(data.imageUrl);
  const result = await db.execute({
    sql: `INSERT INTO events (title, description, date, end_date, time, location, image_url, image_alt, cta_label, cta_href, is_tba, capacity, registration_deadline, rsvp_list, category, month, date_label, sort_order, registration_required, published, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    args: [
      data.title,
      data.description,
      Math.floor(data.date.getTime() / 1000),
      Math.floor(data.endDate.getTime() / 1000),
      data.time ?? '',
      data.location,
      imageUrl ?? null,
      data.imageAlt,
      data.ctaLabel ?? '',
      data.ctaHref ?? '',
      Number(data.isTba),
      data.capacity ?? null,
      data.registrationDeadline ? Math.floor(data.registrationDeadline.getTime() / 1000) : null,
      JSON.stringify(data.rsvpList),
      data.category,
      data.month ?? null,
      data.dateLabel ?? null,
      data.sortOrder ?? 0,
      Number(data.registrationRequired),
      Number(data.published),
    ],
  });
  const id = Number(result.lastInsertRowid);
  return (await getEventById(id))!;
}

export async function updateEvent(id: number, data: Partial<Event>): Promise<Event | null> {
  const db = getDb();
  const existing = await getEventById(id);
  if (!existing) return null;
  const merged = { ...existing, ...data };
  const imageUrl = await storeInlineImage(merged.imageUrl);

  await db.execute({
    sql: `UPDATE events SET
      title = ?, description = ?, date = ?, end_date = ?, time = ?, location = ?, image_url = ?, image_alt = ?,
      cta_label = ?, cta_href = ?, is_tba = ?, capacity = ?, registration_deadline = ?, rsvp_list = ?, category = ?, month = ?, date_label = ?, sort_order = ?,
      registration_required = ?, published = ?, updated_at = unixepoch()
    WHERE id = ?`,
    args: [
      merged.title,
      merged.description,
      Math.floor(merged.date.getTime() / 1000),
      Math.floor(merged.endDate.getTime() / 1000),
      merged.time ?? '',
      merged.location,
      imageUrl ?? null,
      merged.imageAlt,
      merged.ctaLabel ?? '',
      merged.ctaHref ?? '',
      Number(merged.isTba),
      merged.capacity ?? null,
      merged.registrationDeadline ? Math.floor(merged.registrationDeadline.getTime() / 1000) : null,
      JSON.stringify(merged.rsvpList),
      merged.category,
      merged.month ?? null,
      merged.dateLabel ?? null,
      merged.sortOrder ?? 0,
      Number(merged.registrationRequired),
      Number(merged.published),
      id,
    ],
  });

  return getEventById(id);
}

export async function deleteEvent(id: number): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'DELETE FROM events WHERE id = ?',
    args: [id],
  });
  return Number(result.rowsAffected) > 0;
}

export async function getMembers(active?: boolean): Promise<Member[]> {
  const db = getDb();
  let sql = 'SELECT * FROM members';
  const args: any[] = [];
  if (active !== undefined) {
    sql += ' WHERE is_active = ?';
    args.push(Number(active));
  }
  sql += ' ORDER BY first_name, last_name';
  const result = await db.execute({ sql, args });
  return result.rows.map(rowToMember);
}

export async function getMemberById(id: number): Promise<Member | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM members WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToMember(result.rows[0]);
}

export async function createMember(data: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<Member> {
  const db = getDb();
  const photo = await storeInlineImage(data.photo);
  const result = await db.execute({
    sql: `INSERT INTO members (first_name, last_name, email, bio, photo, roles, is_active, is_verified, join_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    args: [
      data.firstName,
      data.lastName,
      data.email,
      data.bio ?? null,
      photo ?? null,
      JSON.stringify(data.roles),
      Number(data.isActive),
      Number(data.isVerified),
      data.joinDate ? Math.floor(data.joinDate.getTime() / 1000) : Math.floor(Date.now() / 1000),
    ],
  });
  const id = Number(result.lastInsertRowid);
  return (await getMemberById(id))!;
}

export async function updateMember(id: number, data: Partial<Member>): Promise<Member | null> {
  const db = getDb();
  const existing = await getMemberById(id);
  if (!existing) return null;
  const merged = { ...existing, ...data };
  const photo = await storeInlineImage(merged.photo);

  await db.execute({
    sql: `UPDATE members SET
      first_name = ?, last_name = ?, email = ?, bio = ?, photo = ?, roles = ?, is_active = ?, is_verified = ?, join_date = ?, updated_at = unixepoch()
    WHERE id = ?`,
    args: [
      merged.firstName,
      merged.lastName,
      merged.email,
      merged.bio ?? null,
      photo ?? null,
      JSON.stringify(merged.roles),
      Number(merged.isActive),
      Number(merged.isVerified),
      merged.joinDate ? Math.floor(merged.joinDate.getTime() / 1000) : Math.floor(Date.now() / 1000),
      id,
    ],
  });

  return getMemberById(id);
}

export async function deleteMember(id: number): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'DELETE FROM members WHERE id = ?',
    args: [id],
  });
  return Number(result.rowsAffected) > 0;
}

export async function getBlogPosts(published?: boolean): Promise<BlogPost[]> {
  const db = getDb();
  let sql = 'SELECT * FROM blog_posts';
  const args: any[] = [];
  if (published !== undefined) {
    sql += ' WHERE published = ?';
    args.push(Number(published));
  }
  sql += ' ORDER BY published_at DESC, created_at DESC';
  const result = await db.execute({ sql, args });
  return result.rows.map(rowToBlogPost);
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM blog_posts WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToBlogPost(result.rows[0]);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM blog_posts WHERE slug = ?',
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return rowToBlogPost(result.rows[0]);
}

export async function createBlogPost(data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<BlogPost> {
  const db = getDb();
  const publishedAt = data.published ? Math.floor(Date.now() / 1000) : null;
  const image = await storeInlineImage(data.image);
  const result = await db.execute({
    sql: `INSERT INTO blog_posts (title, slug, excerpt, content, author, image, category, published, view_count, published_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    args: [
      data.title,
      data.slug,
      data.excerpt ?? null,
      data.content,
      data.author,
      image ?? null,
      data.category,
      Number(data.published),
      0,
      publishedAt,
    ],
  });
  const id = Number(result.lastInsertRowid);
  return (await getBlogPostById(id))!;
}

export async function updateBlogPost(id: number, data: Partial<BlogPost>): Promise<BlogPost | null> {
  const db = getDb();
  const existing = await getBlogPostById(id);
  if (!existing) return null;
  const merged = { ...existing, ...data };
  const image = await storeInlineImage(merged.image);

  let publishedAt: number | null = existing.publishedAt ? Math.floor(existing.publishedAt.getTime() / 1000) : null;
  if (data.published && !existing.published) {
    publishedAt = Math.floor(Date.now() / 1000);
  }

  await db.execute({
    sql: `UPDATE blog_posts SET
      title = ?, slug = ?, excerpt = ?, content = ?, author = ?, image = ?, category = ?, published = ?, view_count = ?, published_at = ?, updated_at = unixepoch()
    WHERE id = ?`,
    args: [
      merged.title,
      merged.slug,
      merged.excerpt ?? null,
      merged.content,
      merged.author,
      image ?? null,
      merged.category,
      Number(merged.published),
      merged.viewCount,
      publishedAt,
      id,
    ],
  });

  return getBlogPostById(id);
}

export async function deleteBlogPost(id: number): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'DELETE FROM blog_posts WHERE id = ?',
    args: [id],
  });
  return Number(result.rowsAffected) > 0;
}

function galleryImageSelect(includeImageData: boolean): string {
  if (includeImageData) return 'image';
  return `CASE
    WHEN image LIKE 'data:image/%;base64,%' THEN
      '/api/media/gallery/' || id || '?v=' ||
      COALESCE(uploaded_at, 0) || '-' || length(image) || '-' || hex(substr(image, -12))
    ELSE image
  END AS image`;
}

export async function getGalleryImages(
  category?: string,
  published?: boolean,
  includeImageData = false
): Promise<GalleryImage[]> {
  const db = getDb();
  let sql = `SELECT id, title, description, category, ${galleryImageSelect(includeImageData)},
    alt, sort_order, published, uploaded_at FROM gallery_images`;
  const args: any[] = [];
  const where: string[] = [];
  if (category) {
    where.push('category = ?');
    args.push(category);
  }
  if (published !== undefined) {
    where.push('published = ?');
    args.push(Number(published));
  }
  if (where.length > 0) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ' ORDER BY COALESCE(sort_order, 9999), uploaded_at DESC, id DESC';
  const result = await db.execute({ sql, args });
  return result.rows.map(rowToGalleryImage);
}

export async function getGalleryImageById(id: number, includeImageData = false): Promise<GalleryImage | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT id, title, description, category, ${galleryImageSelect(includeImageData)},
      alt, sort_order, published, uploaded_at FROM gallery_images WHERE id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToGalleryImage(result.rows[0]);
}

export async function createGalleryImage(data: Omit<GalleryImage, 'id' | 'uploadedAt'>): Promise<GalleryImage> {
  const db = getDb();
  const image = await storeInlineImage(data.image);
  const result = await db.execute({
    sql: `INSERT INTO gallery_images (title, description, category, image, alt, sort_order, published, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    args: [
      data.title,
      data.description ?? null,
      data.category,
      image!,
      data.alt,
      data.sortOrder ?? 0,
      Number(data.published !== false),
    ],
  });
  const id = Number(result.lastInsertRowid);
  return (await getGalleryImageById(id))!;
}

export async function updateGalleryImage(id: number, data: Partial<GalleryImage>): Promise<GalleryImage | null> {
  const db = getDb();
  const existing = await getGalleryImageById(id, true);
  if (!existing) return null;
  const legacyMediaUrl = `/api/media/gallery/${id}`;
  const requestedImage = data.image?.startsWith(legacyMediaUrl) ? existing.image : data.image;
  const image = await storeInlineImage(requestedImage);
  const merged = { ...existing, ...data, image: image ?? existing.image };

  await db.execute({
    sql: `UPDATE gallery_images SET
      title = ?, description = ?, category = ?, image = ?, alt = ?, sort_order = ?, published = ?
    WHERE id = ?`,
    args: [
      merged.title,
      merged.description ?? null,
      merged.category,
      merged.image,
      merged.alt,
      merged.sortOrder ?? 0,
      Number(merged.published),
      id,
    ],
  });

  return getGalleryImageById(id);
}

export async function deleteGalleryImage(id: number): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'DELETE FROM gallery_images WHERE id = ?',
    args: [id],
  });
  return Number(result.rowsAffected) > 0;
}

export async function getFormSubmissions(filters: { type?: string; status?: FormSubmission['status'] } = {}): Promise<FormSubmission[]> {
  const db = getDb();
  let sql = 'SELECT * FROM form_submissions';
  const args: any[] = [];
  const where: string[] = [];
  if (filters.type) {
    where.push('type = ?');
    args.push(filters.type);
  }
  if (filters.status) {
    where.push('status = ?');
    args.push(filters.status);
  }
  if (where.length > 0) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ' ORDER BY submitted_at DESC';
  const result = await db.execute({ sql, args });
  return result.rows.map(rowToFormSubmission);
}

export async function getFormSubmissionById(id: number): Promise<FormSubmission | null> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM form_submissions WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return rowToFormSubmission(result.rows[0]);
}

export async function createFormSubmission(type: string, data: Record<string, string>): Promise<FormSubmission> {
  const db = getDb();
  const result = await db.execute({
    sql: `INSERT INTO form_submissions (type, data, status, submitted_at)
          VALUES (?, ?, 'new', unixepoch())`,
    args: [type, JSON.stringify(data)],
  });
  const id = Number(result.lastInsertRowid);
  return (await getFormSubmissionById(id))!;
}

export async function updateFormSubmissionStatus(id: number, status: FormSubmission['status']): Promise<FormSubmission | null> {
  const db = getDb();
  if (!['new', 'replied', 'resolved'].includes(status)) {
    throw new Error('Invalid form status');
  }
  await db.execute({
    sql: 'UPDATE form_submissions SET status = ? WHERE id = ?',
    args: [status, id],
  });
  return getFormSubmissionById(id);
}

export async function getStats(): Promise<Stats> {
  const db = getDb();
  const [events, members, blog, gallery, forms] = await Promise.all([
    db.execute('SELECT COUNT(*) as c FROM events'),
    db.execute('SELECT COUNT(*) as c FROM members'),
    db.execute('SELECT COUNT(*) as c FROM blog_posts'),
    db.execute('SELECT COUNT(*) as c FROM gallery_images'),
    db.execute('SELECT COUNT(*) as c FROM form_submissions'),
  ]);

  const totalEvents = Number(events.rows[0]?.c ?? 0);
  const totalMembers = Number(members.rows[0]?.c ?? 0);
  const totalBlogPosts = Number(blog.rows[0]?.c ?? 0);
  const totalGalleryImages = Number(gallery.rows[0]?.c ?? 0);
  const totalFormSubmissions = Number(forms.rows[0]?.c ?? 0);

  const [publishedEvents, activeMembers, publishedBlogPosts] = await Promise.all([
    db.execute('SELECT COUNT(*) as c FROM events WHERE published = 1'),
    db.execute('SELECT COUNT(*) as c FROM members WHERE is_active = 1'),
    db.execute('SELECT COUNT(*) as c FROM blog_posts WHERE published = 1'),
  ]);

  return {
    totalEvents,
    publishedEvents: Number(publishedEvents.rows[0]?.c ?? 0),
    totalMembers,
    activeMembers: Number(activeMembers.rows[0]?.c ?? 0),
    totalBlogPosts,
    publishedBlogPosts: Number(publishedBlogPosts.rows[0]?.c ?? 0),
    totalGalleryImages,
    totalFormSubmissions,
  };
}

export async function getRecentActivity(limit = 10): Promise<any[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?',
    args: [limit],
  });
  return result.rows.map((row: any) => ({
    id: String(row.id),
    type: row.type,
    title: row.title,
    user: row.user,
    timestamp: row.timestamp ? new Date(row.timestamp * 1000).toISOString() : new Date().toISOString(),
  }));
}

export async function logActivity(type: string, title: string, user: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'INSERT INTO activities (type, title, user, timestamp) VALUES (?, ?, ?, unixepoch())',
    args: [type, title, user],
  });
}
