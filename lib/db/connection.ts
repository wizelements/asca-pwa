import { createClient as createHttpClient, type Client } from '@libsql/client/http';

let client: Client | null = null;

function createDbClient(url: string, authToken?: string): Client {
  if (url.startsWith('file:')) {
    // Local file databases are used by CI/E2E and desktop development.
    const { createClient: createLocalClient } = require('@libsql/client');
    return createLocalClient({ url }) as Client;
  }

  return createHttpClient({
    url,
    ...(authToken ? { authToken } : {}),
  });
}

export function getDb(url?: string, authToken?: string): Client {
  if (client) return client;

  const finalUrl = url ?? process.env.TURSO_DATABASE_URL;
  const finalAuthToken = authToken ?? process.env.TURSO_AUTH_TOKEN;

  if (!finalUrl) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }

  client = createDbClient(finalUrl, finalAuthToken);
  return client;
}

export function resetDb(): void {
  client = null;
}
