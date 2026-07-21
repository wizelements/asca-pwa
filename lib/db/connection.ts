import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

export function getDb(url?: string, authToken?: string): Client {
  if (client) return client;

  const finalUrl = url ?? process.env.TURSO_DATABASE_URL;

  if (!finalUrl) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }

  client = createClient({
    url: finalUrl,
    authToken: authToken ?? process.env.TURSO_AUTH_TOKEN,
  });

  return client;
}

export function resetDb(): void {
  client = null;
}
