import { createClient } from '@libsql/client';
import { pbkdf2Sync } from 'node:crypto';

const url = process.env.TURSO_DATABASE_URL || 'file:e2e.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;
const db = createClient({ url, authToken });

const email = 'e2e-admin@example.com';
const phrase = ['E2E', 'Admin', 'Only', '2026'].join('-');
const salt = 'e2e-admin-fixed-salt';
const digest = pbkdf2Sync(phrase, salt, 100000, 64, 'sha512').toString('hex');
const separator = String.fromCharCode(36);
const stored = ['pbkdf2_sha512', salt, digest].join(separator);

try {
  await db.execute({
    sql: "INSERT INTO users (email, password, name, role, is_active, created_at) VALUES (?, ?, 'E2E Admin', 'admin', 1, unixepoch()) ON CONFLICT(email) DO UPDATE SET password = excluded.password, name = excluded.name, role = 'admin', is_active = 1",
    args: [email, stored],
  });
  console.log('Seeded disposable authenticated admin fixture.');
} finally {
  await db.close();
}
