import { createClient, type Client } from '@libsql/client/http';

let client: Client | null = null;

function createDbClient(url: string, authToken?: string): Client {
  // Termux arm64 has no native @libsql/android-arm64 binary. The HTTP-only
  // client avoids loading libsql native bindings entirely and uses the remote
  // Turso HTTP API. This works for https:// and http:// URLs during builds
  // and on-device commands.
  return createClient({
    url,
    authToken,
  });
}

export function getDb(): Client {
  if ((getDb as any).__testClient) return (getDb as any).__testClient;
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }

  client = createDbClient(url, authToken);

  return client;
}
