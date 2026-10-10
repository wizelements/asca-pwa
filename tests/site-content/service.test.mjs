import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { readFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDb } from '../../lib/db.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const dbPath = '/tmp/asca-site-content-test.db';
let db;

describe('client-editable site content', () => {
  before(async () => {
    try { unlinkSync(dbPath); } catch {}
    db = createClient({ url: `file:${dbPath}` });
    const migration = readFileSync(join(root, 'drizzle/0005_add_site_content.sql'), 'utf8');
    await db.executeMultiple(migration);
    process.env.TURSO_DATABASE_URL = `file:${dbPath}`;
    process.env.TURSO_AUTH_TOKEN = '';
    getDb.__testClient = db;
  });

  after(async () => {
    if (db) await db.close();
    delete getDb.__testClient;
    try { unlinkSync(dbPath); } catch {}
  });

  it('falls back to safe code defaults when no overrides exist', async () => {
    const { getSiteContent } = await import('../../lib/site-content.ts');
    const values = await getSiteContent();
    assert.equal(values['about.hero.title'], 'About ASCA');
    assert.deepEqual(values['members.reasons.items'], [
      'A shared love of horses',
      'Friendship and fellowship',
      'Trail rides and events',
      'Learning opportunities',
      'Community service',
      'Leadership opportunities',
    ]);
  });

  it('round-trips text and list overrides in one atomic batch', async () => {
    const { getSiteContent, updateSiteContent } = await import('../../lib/site-content.ts');
    await updateSiteContent({
      'about.hero.title': 'About Our Club',
      'members.reasons.items': ['Ride together', 'Serve together'],
    }, 1);

    const values = await getSiteContent();
    assert.equal(values['about.hero.title'], 'About Our Club');
    assert.deepEqual(values['members.reasons.items'], ['Ride together', 'Serve together']);
  });

  it('rejects unknown, blank, oversized, and malformed list values', async () => {
    const { updateSiteContent } = await import('../../lib/site-content.ts');
    await assert.rejects(
      () => updateSiteContent({ 'not.a.real.key': 'Nope' }, 1),
      /Unknown page text field/
    );
    await assert.rejects(
      () => updateSiteContent({ 'about.hero.title': '   ' }, 1),
      /cannot be blank/
    );
    await assert.rejects(
      () => updateSiteContent({ 'about.hero.title': 'X'.repeat(101) }, 1),
      /100 characters or fewer/
    );
    await assert.rejects(
      () => updateSiteContent({ 'members.reasons.items': 'not-a-list' }, 1),
      /must be a list/
    );
  });

  it('does not persist valid fields when the same request contains an invalid field', async () => {
    const { getSiteContent, updateSiteContent } = await import('../../lib/site-content.ts');
    const beforeValues = await getSiteContent();

    await assert.rejects(
      () => updateSiteContent({
        'about.hero.title': 'This Must Roll Back',
        'unknown.key': 'Invalid',
      }, 1),
      /Unknown page text field/
    );

    const afterValues = await getSiteContent();
    assert.equal(afterValues['about.hero.title'], beforeValues['about.hero.title']);
  });
});
