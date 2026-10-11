import { createClient, type Client } from '@libsql/client/http';
import { getDb } from '../../db.ts';

export type DbClient = Pick<Client, 'execute'>;

export function getDbClient(): DbClient {
  return getDb();
}

export async function withTransaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
  // A BEGIN sent via db.execute() cannot hold a transaction across HTTP calls.
  // Use the driver's dedicated transaction session for every multi-step mutation.
  const tx = await getDbClient().transaction('write');
  try {
    const result = await fn(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback().catch(() => {});
    throw error;
  } finally {
    await tx.close();
  }
}

export function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed/i.test(error.message);
}
