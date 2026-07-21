import { createClient, type Client } from '@libsql/client';
import { getDb } from '../../db.ts';

export type DbClient = Client;

export function getDbClient(): DbClient {
  return getDb();
}

export async function withTransaction<T>(fn: (tx: Client) => Promise<T>): Promise<T> {
  const db = getDbClient();
  await db.execute('BEGIN');
  try {
    const result = await fn(db);
    await db.execute('COMMIT');
    return result;
  } catch (error) {
    await db.execute('ROLLBACK').catch(() => {});
    throw error;
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed/i.test(error.message);
}
