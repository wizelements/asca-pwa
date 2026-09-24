import { createClient as createHttpClient, type Client } from '@libsql/client/http';

let client: Client | null = null;

function createDbClient(url: string, authToken?: string): Client {
  if (url.startsWith('file:')) {
    // Load the native-capable client only when a local SQLite/libSQL file is
    // explicitly requested (CI, E2E, or desktop development). Keeping this
    // require inside the branch avoids loading native bindings on Termux when
    // the app is using remote Turso over HTTP.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient: createLocalClient } = require('@libsql/client');
    return createLocalClient({ url }) as Client;
  }

  return createHttpClient({
    url,
    ...(authToken ? { authToken } : {}),
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
