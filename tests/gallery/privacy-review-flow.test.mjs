import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@libsql/client';
import { unlinkSync } from 'node:fs';
import { getDb } from '../../lib/db.ts';

describe('gallery privacy and transactional publishing safety', () => {
  it('requires both privacy clearance and meaningful image descriptions', async () => {
    const { validatePublishableAlbum } = await import('../../lib/gallery/validation.ts');
    const draft = {
      title: 'Saddle Club Trail Ride',
      status: 'draft',
      privacyReviewStatus: 'pending',
      mediaCount: 1,
      coverMediaAssetId: 'photo-1',
      altTexts: ['photo'],
    };

    const pending = validatePublishableAlbum(draft);
    assert.equal(pending.ok, false);
    assert.match(pending.errors.join(' '), /privacy review/i);
    assert.match(pending.errors.join(' '), /meaningful alt text/i);

    const approvedWithBadDescriptions = validatePublishableAlbum({
      ...draft,
      privacyReviewStatus: 'approved',
    });
    assert.equal(approvedWithBadDescriptions.ok, false);
    assert.match(approvedWithBadDescriptions.errors.join(' '), /meaningful alt text/i);

    const ready = validatePublishableAlbum({
      ...draft,
      privacyReviewStatus: 'approved',
      altTexts: ['ASCA members riding horses along a wooded trail'],
    });
    assert.equal(ready.ok, true);
  });

  it('commits successful album writes and rolls back failed multi-step writes', async () => {
    const path = `/tmp/asca-gallery-tx-${process.pid}-${Date.now()}.db`;
    const client = createClient({ url: `file:${path}` });
    const original = getDb.__testClient;
    getDb.__testClient = client;
    try {
      await client.execute('CREATE TABLE tx_checks (id INTEGER PRIMARY KEY, name TEXT NOT NULL)');
      const { withTransaction } = await import('../../lib/gallery/services/db.ts');

      await withTransaction(async (tx) => {
        await tx.execute({ sql: 'INSERT INTO tx_checks (name) VALUES (?)', args: ['persisted'] });
      });
      const persisted = await client.execute('SELECT name FROM tx_checks ORDER BY id');
      assert.deepEqual(persisted.rows.map((row) => String(row.name)), ['persisted']);

      await assert.rejects(
        () => withTransaction(async (tx) => {
          await tx.execute({ sql: 'INSERT INTO tx_checks (name) VALUES (?)', args: ['must rollback'] });
          throw new Error('forced failure');
        }),
        /forced failure/
      );
      const afterFailure = await client.execute('SELECT name FROM tx_checks ORDER BY id');
      assert.deepEqual(afterFailure.rows.map((row) => String(row.name)), ['persisted']);
    } finally {
      getDb.__testClient = original;
      await client.close();
      try { unlinkSync(path); } catch {}
    }
  });
});
