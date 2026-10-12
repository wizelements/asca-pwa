import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SignJWT } from 'jose';
import { getDb } from '../../lib/db.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const dbPath = `/tmp/asca-api-test-${Date.now()}.db`;
const TEST_SECRET_TEXT = 'asca-e2e-test-secret-32-characters-minimum';
const TEST_SECRET = new TextEncoder().encode(TEST_SECRET_TEXT);
const PASSWORD_HASH = 'pbkdf2_sha512$salt$hash';
const PASSWORD_VERSION = createHash('sha256').update(PASSWORD_HASH).digest('hex');
const DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

async function setupDb() {
  try { (await import('node:fs')).unlinkSync(dbPath); } catch {}
  const client = createClient({ url: `file:${dbPath}` });
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
  await client.executeMultiple(readFileSync(join(root, 'drizzle/0004_add_soft_delete_to_gallery.sql'), 'utf8'));
  return client;
}

async function seedUser(client, { email, role }) {
  await client.execute({
    sql: 'INSERT INTO users (email, password, role, name, is_active, created_at) VALUES (?, ?, ?, ?, 1, unixepoch()) ON CONFLICT(email) DO UPDATE SET role = excluded.role',
    args: [email, PASSWORD_HASH, role, 'Test User'],
  });
  const result = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });
  return Number(result.rows[0].id);
}

function setDbEnv(client) {
  process.env.TURSO_DATABASE_URL = `file:${dbPath}`;
  process.env.TURSO_AUTH_TOKEN = '';
  process.env.NEXTAUTH_SECRET = TEST_SECRET_TEXT;
  getDb.__testClient = client;
}

async function importApi(name) {
  return import(join(root, `app/api/gallery/${name}/route.ts`));
}

function req({ method = 'GET', url = 'http://localhost/api/gallery/albums', body, headers = {} } = {}) {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function createToken(userId, role) {
  return new SignJWT({
    sub: String(userId),
    role,
    email: `${role}@example.com`,
    name: 'Test User',
    passwordVersion: PASSWORD_VERSION,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(TEST_SECRET);
}

async function seedAsset(client, id) {
  await client.execute({
    sql: 'INSERT OR REPLACE INTO media_assets (id, data_url, created_at, updated_at) VALUES (?, ?, unixepoch(), unixepoch())',
    args: [id, DATA_URL],
  });
}

describe('Gallery API authorization and integrity', () => {
  let client;
  let adminToken;
  let editorToken;
  let viewerToken;
  let categoryId;

  before(async () => {
    client = await setupDb();
    setDbEnv(client);

    const adminId = await seedUser(client, { email: 'admin@example.com', role: 'admin' });
    const editorId = await seedUser(client, { email: 'editor@example.com', role: 'editor' });
    const viewerId = await seedUser(client, { email: 'viewer@example.com', role: 'viewer' });

    adminToken = await createToken(adminId, 'admin');
    editorToken = await createToken(editorId, 'editor');
    viewerToken = await createToken(viewerId, 'viewer');

    const { seedCanonicalCategories } = await import(join(root, 'lib/gallery/services/categories.ts'));
    await seedCanonicalCategories();
    const categoryResult = await client.execute({
      sql: 'SELECT id FROM activity_categories WHERE slug = ?',
      args: ['trail-rides'],
    });
    categoryId = Number(categoryResult.rows[0].id);
  });

  after(async () => {
    try { getDb.__testClient = undefined; } catch {}
    try { await client.close(); } catch {}
    try { (await import('node:fs')).unlinkSync(dbPath); } catch {}
  });

  it('requires authentication for album administration', async () => {
    const { GET } = await importApi('albums');
    const response = await GET(req());
    assert.equal(response.status, 401);
  });

  it('viewer only sees fully eligible published albums', async () => {
    await seedAsset(client, 'asset-public');
    await client.execute({
      sql: "INSERT INTO activity_albums (title, slug, category_id, cover_media_asset_id, status, privacy_review_status, sort_order, created_at, updated_at, deleted_at) VALUES ('Published Album', 'published-album', ?, 'asset-public', 'published', 'approved', 0, unixepoch(), unixepoch(), NULL)",
      args: [categoryId],
    });
    const published = await client.execute({ sql: "SELECT id FROM activity_albums WHERE slug = 'published-album'", args: [] });
    await client.execute({
      sql: "INSERT INTO album_media_assets (album_id, media_asset_id, sort_order, caption, alt_text, created_at, updated_at) VALUES (?, 'asset-public', 0, '', 'ASCA riders on a public trail ride', unixepoch(), unixepoch())",
      args: [Number(published.rows[0].id)],
    });
    await client.execute({
      sql: "INSERT INTO activity_albums (title, slug, category_id, status, privacy_review_status, sort_order, created_at, updated_at, deleted_at) VALUES ('Draft Album', 'draft-album', ?, 'draft', 'pending', 1, unixepoch(), unixepoch(), NULL)",
      args: [categoryId],
    });

    const { GET } = await importApi('albums');
    const response = await GET(req({ headers: authHeaders(viewerToken) }));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.length, 1);
    assert.equal(data[0].slug, 'published-album');
  });

  it('editor sees draft and published administration rows', async () => {
    const { GET } = await importApi('albums');
    const response = await GET(req({ headers: authHeaders(editorToken) }));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.ok(data.some((album) => album.slug === 'published-album'));
    assert.ok(data.some((album) => album.slug === 'draft-album'));
  });

  it('reconciles the admin inventory with live eligibility, search, trash, and legacy photos', async () => {
    const { GET } = await importApi('albums');
    // Old flat-gallery photos are not albums; the inventory must count them separately.
    await client.execute({
      sql: "INSERT INTO gallery_images (title, description, category, image, alt, sort_order, published, uploaded_at) VALUES ('Old photo', '', 'Trail Rides', 'old.jpg', 'A rider', 0, 1, unixepoch())",
      args: [],
    });
    await client.execute({
      sql: "INSERT INTO activity_albums (title, slug, category_id, status, privacy_review_status, sort_order, created_at, updated_at, deleted_at) VALUES ('Recovered Old Album', 'recovered-old-album', ?, 'archived', 'pending', 0, unixepoch(), unixepoch(), unixepoch())",
      args: [categoryId],
    });
    try {
      const editor = await GET(req({ headers: authHeaders(editorToken) }));
      assert.equal(editor.status, 200);
      const editorAlbums = await editor.json();
      assert.ok(editorAlbums.some(album => album.slug === 'draft-album'));
      assert.ok(!editorAlbums.some(album => album.slug === 'recovered-old-album'));
      assert.equal(editorAlbums.find(album => album.slug === 'published-album').visibility.eligible, true);
      const blocked = editorAlbums.find(album => album.slug === 'draft-album');
      assert.equal(blocked.visibility.eligible, false);
      assert.ok(blocked.visibility.reasons.some(reason => /not published/i.test(reason)));
      assert.ok(blocked.visibility.reasons.some(reason => /privacy/i.test(reason)));

      const admin = await GET(req({
        url: 'http://localhost/api/gallery/albums?status=all&pageSize=50',
        headers: authHeaders(adminToken),
      }));
      assert.equal(admin.status, 200);
      assert.ok((await admin.json()).some(album => album.slug === 'recovered-old-album'));
      assert.equal(admin.headers.get('X-Trash-Count'), '1');
      assert.equal(admin.headers.get('X-Legacy-Photo-Count'), '1');
      assert.equal(admin.headers.get('X-Public-Album-Count'), '1');

      const privateViewer = await GET(req({
        url: 'http://localhost/api/gallery/albums?status=all',
        headers: authHeaders(viewerToken),
      }));
      assert.equal(privateViewer.status, 200);
      assert.deepEqual((await privateViewer.json()).map(album => album.slug), ['published-album']);

      const searched = await GET(req({
        url: 'http://localhost/api/gallery/albums?search=draft&pageSize=1',
        headers: authHeaders(editorToken),
      }));
      assert.equal(searched.status, 200);
      assert.equal(searched.headers.get('X-Total-Count'), '1');
      assert.equal((await searched.json())[0].slug, 'draft-album');

      const literalWildcard = await GET(req({
        url: 'http://localhost/api/gallery/albums?search=%25',
        headers: authHeaders(editorToken),
      }));
      assert.equal(literalWildcard.status, 200);
      assert.equal((await literalWildcard.json()).length, 0);
    } finally {
      await client.execute({ sql: "DELETE FROM activity_albums WHERE slug = 'recovered-old-album'", args: [] });
      await client.execute({ sql: "DELETE FROM gallery_images WHERE title = 'Old photo'", args: [] });
    }
  });

  it('explains published album missing its linked cover instead of labeling it live', async () => {
    await seedAsset(client, 'asset-unattached-cover');
    await client.execute({
      sql: "INSERT INTO activity_albums (title, slug, category_id, cover_media_asset_id, status, privacy_review_status, sort_order, created_at, updated_at, deleted_at) VALUES ('Broken Cover Album', 'broken-cover-album', ?, 'asset-unattached-cover', 'published', 'approved', 0, unixepoch(), unixepoch(), NULL)",
      args: [categoryId],
    });
    try {
      const { GET } = await importApi('albums');
      const response = await GET(req({ headers: authHeaders(adminToken) }));
      assert.equal(response.status, 200);
      const album = (await response.json()).find(row => row.slug === 'broken-cover-album');
      assert.equal(album.coverAttached, false);
      assert.equal(album.visibility.eligible, false);
      assert.ok(album.visibility.reasons.some(reason => /cover photo/i.test(reason)));
    } finally {
      await client.execute({ sql: "DELETE FROM activity_albums WHERE slug = 'broken-cover-album'", args: [] });
    }
  });

  it('rejects oversized and unsupported media uploads', async () => {
    const { POST } = await importApi('media');
    const oversized = await POST(req({
      method: 'POST',
      url: 'http://localhost/api/gallery/media',
      body: { dataUrl: 'data:image/jpeg;base64,' + 'a'.repeat(7 * 1024 * 1024) },
      headers: authHeaders(editorToken),
    }));
    assert.equal(oversized.status, 400);

    const unsupported = await POST(req({
      method: 'POST',
      url: 'http://localhost/api/gallery/media',
      body: { dataUrl: 'data:image/svg+xml;base64,abc' },
      headers: authHeaders(editorToken),
    }));
    assert.equal(unsupported.status, 400);
  });

  it('forces editor-created albums to safe draft/pending state', async () => {
    const { POST } = await importApi('albums');
    const response = await POST(req({
      method: 'POST',
      body: {
        title: 'Editor Attempt',
        slug: 'editor-attempt',
        categoryId,
        status: 'published',
        privacyReviewStatus: 'approved',
        featured: true,
      },
      headers: authHeaders(editorToken),
    }));
    assert.equal(response.status, 201);
    const data = await response.json();
    assert.equal(data.status, 'draft');
    assert.equal(data.privacyReviewStatus, 'pending');
    assert.equal(data.featured, false);
  });

  it('blocks editors from protected publication fields and actions', async () => {
    const row = await client.execute({ sql: "SELECT id FROM activity_albums WHERE slug = 'editor-attempt'", args: [] });
    const id = Number(row.rows[0].id);
    const { PUT } = await importApi('albums');

    const protectedField = await PUT(req({
      method: 'PUT',
      body: { id, status: 'published' },
      headers: authHeaders(editorToken),
    }));
    assert.equal(protectedField.status, 403);

    const protectedAction = await PUT(req({
      method: 'PUT',
      body: { id, action: 'publish' },
      headers: authHeaders(editorToken),
    }));
    assert.equal(protectedAction.status, 403);
  });

  it('persists add/remove/reorder/alt/caption updates atomically', async () => {
    await seedAsset(client, 'asset-first');
    await seedAsset(client, 'asset-second');

    const { POST, PUT, GET } = await importApi('albums');
    const createdResponse = await POST(req({
      method: 'POST',
      body: {
        title: 'Editable Album',
        slug: 'editable-album',
        categoryId,
        coverMediaAssetId: 'asset-first',
        media: [{
          mediaAssetId: 'asset-first',
          altText: 'First ASCA test photo',
          caption: 'First caption',
          sortOrder: 0,
        }],
      },
      headers: authHeaders(editorToken),
    }));
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json();

    const updateResponse = await PUT(req({
      method: 'PUT',
      body: {
        id: created.id,
        coverMediaAssetId: 'asset-second',
        mediaUpdates: {
          add: [{
            mediaAssetId: 'asset-second',
            altText: 'Second ASCA test photo',
            caption: 'Second caption',
            sortOrder: 10,
          }],
          remove: ['asset-first'],
          reorder: [{ mediaAssetId: 'asset-second', sortOrder: 0 }],
          metadata: [{
            mediaAssetId: 'asset-second',
            altText: 'Updated second ASCA test photo',
            caption: 'Updated second caption',
          }],
        },
      },
      headers: authHeaders(editorToken),
    }));
    assert.equal(updateResponse.status, 200);

    const detailResponse = await GET(req({
      url: `http://localhost/api/gallery/albums?id=${created.id}`,
      headers: authHeaders(editorToken),
    }));
    assert.equal(detailResponse.status, 200);
    const detail = await detailResponse.json();
    assert.equal(detail.coverMediaAssetId, 'asset-second');
    assert.equal(detail.media.length, 1);
    assert.equal(detail.media[0].mediaAssetId, 'asset-second');
    assert.equal(detail.media[0].altText, 'Updated second ASCA test photo');
    assert.equal(detail.media[0].caption, 'Updated second caption');
  });

  it('requires admin privacy clearance and valid final state before publishing', async () => {
    const row = await client.execute({ sql: "SELECT id FROM activity_albums WHERE slug = 'editable-album'", args: [] });
    const id = Number(row.rows[0].id);
    const { PUT } = await importApi('albums');

    const pendingPublish = await PUT(req({
      method: 'PUT',
      body: { id, action: 'publish' },
      headers: authHeaders(adminToken),
    }));
    assert.equal(pendingPublish.status, 400);

    const privacy = await PUT(req({
      method: 'PUT',
      body: { id, action: 'setPrivacy', privacyReviewStatus: 'approved' },
      headers: authHeaders(adminToken),
    }));
    assert.equal(privacy.status, 200);

    const publish = await PUT(req({
      method: 'PUT',
      body: { id, action: 'publish' },
      headers: authHeaders(adminToken),
    }));
    assert.equal(publish.status, 200);
    const published = await publish.json();
    assert.equal(published.status, 'published');
  });

  it('keeps archive reversible and trash separately recoverable', async () => {
    const row = await client.execute({ sql: "SELECT id FROM activity_albums WHERE slug = 'editable-album'", args: [] });
    const id = Number(row.rows[0].id);
    const { PUT, DELETE, GET } = await importApi('albums');

    const archive = await PUT(req({
      method: 'PUT',
      body: { id, action: 'archive' },
      headers: authHeaders(adminToken),
    }));
    assert.equal(archive.status, 200);

    const restore = await PUT(req({
      method: 'PUT',
      body: { id, action: 'restore' },
      headers: authHeaders(adminToken),
    }));
    assert.equal(restore.status, 200);
    assert.equal((await restore.json()).status, 'draft');

    const trash = await DELETE(req({
      method: 'DELETE',
      url: `http://localhost/api/gallery/albums?id=${id}`,
      headers: authHeaders(adminToken),
    }));
    assert.equal(trash.status, 200);

    const trashList = await GET(req({
      url: 'http://localhost/api/gallery/albums?status=trash',
      headers: authHeaders(adminToken),
    }));
    assert.equal(trashList.status, 200);
    assert.ok((await trashList.json()).some((album) => album.id === id));

    const restoreTrash = await PUT(req({
      method: 'PUT',
      body: { id, action: 'restoreTrash' },
      headers: authHeaders(adminToken),
    }));
    assert.equal(restoreTrash.status, 200);
    assert.equal((await restoreTrash.json()).status, 'draft');
  });

  it('refuses to delete media assets still referenced by gallery content', async () => {
    const { DELETE } = await importApi('media');
    const response = await DELETE(req({
      method: 'DELETE',
      url: 'http://localhost/api/gallery/media?id=asset-second',
      headers: authHeaders(editorToken),
    }));
    assert.equal(response.status, 409);
    const data = await response.json();
    assert.match(data.error, /still in use/i);
  });
  it('suggests grounded photo alt text but never bypasses privacy review', async () => {
    const { POST } = await importApi('describe');
    const photoRequest = {
      method: 'POST',
      url: 'http://localhost/api/gallery/describe',
      headers: authHeaders(editorToken),
      body: {
        dataUrl: DATA_URL,
        context: { title: 'ASCA Trail Ride', category: 'Trail Rides', summary: 'A riding day' },
      },
    };
    const viewer = await POST(req({ ...photoRequest, headers: authHeaders(viewerToken) }));
    assert.equal(viewer.status, 403);

    const oldUrl = process.env.OPEE_ASCA_VISION_URL;
    const oldToken = process.env.OPEE_ASCA_VISION_TOKEN;
    const oldFetch = globalThis.fetch;
    try {
      delete process.env.OPEE_ASCA_VISION_URL;
      delete process.env.OPEE_ASCA_VISION_TOKEN;
      const missingConfig = await POST(req(photoRequest));
      assert.equal(missingConfig.status, 503);
      assert.match((await missingConfig.json()).error, /not connected/i);

      process.env.OPEE_ASCA_VISION_URL = 'https://vision.opee.invalid/v1/chat/completions';
      process.env.OPEE_ASCA_VISION_TOKEN = 'synthetic-test-token';
      const malformedUrl = process.env.OPEE_ASCA_VISION_URL;
      process.env.OPEE_ASCA_VISION_URL = 'http://127.0.0.1:18790/v1/chat/completions';
      const insecureConfig = await POST(req(photoRequest));
      assert.equal(insecureConfig.status, 503);
      process.env.OPEE_ASCA_VISION_URL = malformedUrl;
      let called = 0;
      globalThis.fetch = async (url, options) => {
        assert.equal(url, 'https://vision.opee.invalid/v1/chat/completions');
        assert.equal(options.headers.Authorization, 'Bearer synthetic-test-token');
        const payload = JSON.parse(options.body);
        assert.equal(payload.stream, false);
        assert.equal(payload.model, undefined); // OPEE makes its own model-selection decision
        assert.ok(payload.messages[1].content[0].text.includes('ASCA Trail Ride'));
        assert.ok(payload.messages[1].content[1].image_url.url.startsWith('data:image/png;base64,'));
        called++;
        return new Response(JSON.stringify({
          choices: [{ message: { content: 'Saddle club participants standing beside horses on a sunlit trail.' } }],
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      };
      const response = await POST(req(photoRequest));
      assert.equal(response.status, 200);
      const suggestion = await response.json();
      assert.match(suggestion.description, /participants standing beside horses/);
      assert.equal(suggestion.reviewRequired, true);
      assert.equal(suggestion.provider, 'opee');
      assert.equal(called, 1);

      // AI-generated text is only returned to an editor; it never approves or publishes.
      const draft = await client.execute({
        sql: "SELECT status, privacy_review_status FROM activity_albums WHERE slug = 'editor-attempt'",
      });
      assert.equal(String(draft.rows[0].status), 'draft');
      assert.equal(String(draft.rows[0].privacy_review_status), 'pending');
    } finally {
      globalThis.fetch = oldFetch;
      if (oldUrl === undefined) delete process.env.OPEE_ASCA_VISION_URL;
      else process.env.OPEE_ASCA_VISION_URL = oldUrl;
      if (oldToken === undefined) delete process.env.OPEE_ASCA_VISION_TOKEN;
      else process.env.OPEE_ASCA_VISION_TOKEN = oldToken;
    }
  });


});
