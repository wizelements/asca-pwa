import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const dbPath = `/tmp/asca-api-test-${Date.now()}.db`;

async function setupDb() {
  try { (await import('node:fs')).unlinkSync(dbPath); } catch {}
  const client = createClient({ url: `file:${dbPath}` });
  // Recreate base schema inline because 0000_initial_schema.sql does not exist.
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS settings (id integer PRIMARY KEY, site_name text, site_description text, tagline text, contact_email text, phone text, address text, social text, venmo text, cash_app text, heroes text, notifications_enabled integer, maintenance_mode integer, updated_at integer);
    CREATE TABLE IF NOT EXISTS theme (id integer PRIMARY KEY, colors text, fonts text, logo text, favicon text, updated_at integer);
    CREATE TABLE IF NOT EXISTS users (id integer PRIMARY KEY AUTOINCREMENT, email text UNIQUE, password text NOT NULL, name text, role text, is_active integer, last_login integer, created_at integer);
    CREATE TABLE IF NOT EXISTS events (id integer PRIMARY KEY AUTOINCREMENT, title text, description text, date integer, end_date integer, time text, location text, image_url text, image_alt text, cta_label text, cta_href text, is_tba integer, capacity integer, registration_deadline integer, rsvp_list text, category text, month text, date_label text, sort_order integer, registration_required integer, published integer, created_at integer, updated_at integer);
    CREATE TABLE IF NOT EXISTS members (id integer PRIMARY KEY AUTOINCREMENT, first_name text, last_name text, email text, bio text, photo text, roles text, is_active integer, is_verified integer, join_date integer, created_at integer, updated_at integer);
    CREATE TABLE IF NOT EXISTS blog_posts (id integer PRIMARY KEY AUTOINCREMENT, title text, slug text UNIQUE, excerpt text, content text, author text, image text, category text, published integer, view_count integer, published_at integer, created_at integer, updated_at integer);
    CREATE TABLE IF NOT EXISTS gallery_images (id integer PRIMARY KEY AUTOINCREMENT, title text, description text, category text, image text NOT NULL, alt text, sort_order integer, published integer, uploaded_at integer);
    CREATE TABLE IF NOT EXISTS form_submissions (id integer PRIMARY KEY AUTOINCREMENT, type text, data text, status text, submitted_at integer);
    CREATE TABLE IF NOT EXISTS activities (id integer PRIMARY KEY AUTOINCREMENT, type text, title text, user text, timestamp integer);
  `);
  await client.executeMultiple(readFileSync(join(root, 'drizzle/0001_add_crm_tables.sql'), 'utf8'));
  await client.executeMultiple(readFileSync(join(root, 'drizzle/0002_add_media_assets.sql'), 'utf8'));
  await client.executeMultiple(readFileSync(join(root, 'drizzle/0003_add_gallery_upgrade.sql'), 'utf8'));
  return client;
}

const PASSWORD_HASH = 'pbkdf2_sha512$salt$hash';
const PASSWORD_VERSION = createHash('sha256').update(PASSWORD_HASH).digest('hex');

async function seedUser(client, { email = 'admin@example.com', role = 'admin' } = {}) {
  await client.execute({
    sql: `INSERT INTO users (email, password, role, name, is_active, created_at)
          VALUES (?, ?, ?, ?, 1, unixepoch())
          ON CONFLICT(email) DO UPDATE SET role = excluded.role`,
    args: [email, PASSWORD_HASH, role, 'Test User'],
  });
  const result = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  return Number(result.rows[0].id);
}

function setDbEnv(client) {
  process.env.TURSO_DATABASE_URL = `file:${dbPath}`;
  process.env.TURSO_AUTH_TOKEN = '';
  getDb.__testClient = client;
}

async function importApi(name) {
  return import(join(root, `app/api/gallery/${name}/route.ts`));
}

function req({ method = 'GET', url = 'http://localhost/api/gallery/albums', body, headers = {} } = {}) {
  const request = new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  return request;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

import { SignJWT } from 'jose';
import { getDb } from '../../lib/db.ts';

const TEST_SECRET = new TextEncoder().encode('test-secret');

async function createToken(userId, role = 'admin') {
  return new SignJWT({ sub: String(userId), role, email: `${role}@example.com`, name: 'Test User', passwordVersion: PASSWORD_VERSION })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(TEST_SECRET);
}

describe('Gallery API authorization', () => {
  let client;
  let adminId;
  let editorId;
  let viewerId;
  let adminToken;
  let editorToken;
  let viewerToken;

  before(async () => {
    client = await setupDb();
    setDbEnv(client);
    adminId = await seedUser(client, { email: 'admin@example.com', role: 'admin' });
    editorId = await seedUser(client, { email: 'editor@example.com', role: 'editor' });
    viewerId = await seedUser(client, { email: 'viewer@example.com', role: 'viewer' });

    process.env.NEXTAUTH_SECRET = 'test-secret';
    adminToken = await createToken(adminId, 'admin');
    editorToken = await createToken(editorId, 'editor');
    viewerToken = await createToken(viewerId, 'viewer');

    // Seed categories.
    const { seedCanonicalCategories } = await import(join(root, 'lib/gallery/services/categories.ts'));
    await seedCanonicalCategories();
  });

  after(async () => {
    try { getDb.__testClient = undefined; } catch {}
    try { await client.close(); } catch {}
    try { (await import('node:fs')).unlinkSync(dbPath); } catch {}
  });

  it('GET /api/gallery/albums without auth returns 401', async () => {
    const { GET } = await importApi('albums');
    const response = await GET(req({ url: 'http://localhost/api/gallery/albums' }));
    assert.equal(response.status, 401);
  });

  it('GET /api/gallery/albums viewer only sees published albums', async () => {
    const categoryResult = await client.execute({ sql: 'SELECT id FROM activity_categories WHERE slug = ?', args: ['trail-rides'] });
    const categoryId = Number(categoryResult.rows[0].id);

    // Create a draft and a published album directly.
    await client.execute({
      sql: `INSERT INTO activity_albums (title, slug, category_id, status, privacy_review_status, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
      args: ['Published Album', 'published-album', categoryId, 'published', 'not_required', 0],
    });
    await client.execute({
      sql: `INSERT INTO activity_albums (title, slug, category_id, status, privacy_review_status, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
      args: ['Draft Album', 'draft-album', categoryId, 'draft', 'not_required', 1],
    });

    const { GET } = await importApi('albums');
    const response = await GET(req({ url: 'http://localhost/api/gallery/albums', headers: authHeaders(viewerToken) }));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.length, 1);
    assert.equal(data[0].slug, 'published-album');
  });

  it('GET /api/gallery/albums editor sees all statuses', async () => {
    const { GET } = await importApi('albums');
    const response = await GET(req({ url: 'http://localhost/api/gallery/albums', headers: authHeaders(editorToken) }));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.ok(data.length >= 2);
  });

  it('POST /api/gallery/media rejects oversized data URL', async () => {
    const { POST } = await importApi('media');
    const huge = 'data:image/jpeg;base64,' + 'a'.repeat(7 * 1024 * 1024);
    const response = await POST(req({ method: 'POST', url: 'http://localhost/api/gallery/media', body: { dataUrl: huge }, headers: authHeaders(editorToken) }));
    assert.equal(response.status, 400);
    const data = await response.json();
    assert.ok(data.error.includes('exceeds'));
  });

  it('POST /api/gallery/media rejects unsupported MIME type', async () => {
    const { POST } = await importApi('media');
    const response = await POST(req({ method: 'POST', url: 'http://localhost/api/gallery/media', body: { dataUrl: 'data:image/svg+xml;base64,abc' }, headers: authHeaders(editorToken) }));
    assert.equal(response.status, 400);
    const data = await response.json();
    assert.ok(data.error.includes('Unsupported'));
  });

  it('POST /api/gallery/albums editor creates draft', async () => {
    const categoryResult = await client.execute({ sql: 'SELECT id FROM activity_categories WHERE slug = ?', args: ['trail-rides'] });
    const categoryId = Number(categoryResult.rows[0].id);

    const { POST } = await importApi('albums');
    const response = await POST(req({
      method: 'POST',
      url: 'http://localhost/api/gallery/albums',
      body: { title: 'New Draft', slug: 'new-draft', categoryId },
      headers: authHeaders(editorToken),
    }));
    assert.equal(response.status, 201);
    const data = await response.json();
    assert.equal(data.status, 'draft');
  });

  it('PUT /api/gallery/albums publish without cover returns 400', async () => {
    const result = await client.execute({ sql: 'SELECT id FROM activity_albums WHERE slug = ?', args: ['new-draft'] });
    const id = Number(result.rows[0].id);

    const { PUT } = await importApi('albums');
    const response = await PUT(req({
      method: 'PUT',
      url: 'http://localhost/api/gallery/albums',
      body: { id, action: 'publish' },
      headers: authHeaders(adminToken),
    }));
    assert.equal(response.status, 400);
    const data = await response.json();
    assert.ok(data.error.includes('cover') || data.error.includes('media'));
  });

  it('Viewer cannot publish', async () => {
    const result = await client.execute({ sql: 'SELECT id FROM activity_albums WHERE slug = ?', args: ['new-draft'] });
    const id = Number(result.rows[0].id);

    const { PUT } = await importApi('albums');
    const response = await PUT(req({
      method: 'PUT',
      url: 'http://localhost/api/gallery/albums',
      body: { id, action: 'publish' },
      headers: authHeaders(viewerToken),
    }));
    assert.equal(response.status, 403);
  });
});
