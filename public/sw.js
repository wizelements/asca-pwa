const CACHE_PREFIX = 'asca-pwa';
const CACHE_VERSION = '20260924-hardening';
const STATIC_CACHE = `${CACHE_PREFIX}-${CACHE_VERSION}-static`;
const IMMUTABLE_CACHE = `${CACHE_PREFIX}-${CACHE_VERSION}-immutable`;
const STATIC_ASSETS = ['/offline.html', '/icons/icon-192.png', '/icons/icon-512.png'];

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

function isImmutableAsset(request) {
  const { pathname } = new URL(request.url);
  return pathname.startsWith('/_next/static/') || pathname.startsWith('/icons/');
}

async function networkOnly(request) {
  return fetch(request, { cache: 'no-store' });
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && isSameOrigin(request)) {
    const cache = await caches.open(IMMUTABLE_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith(CACHE_PREFIX) &&
                ![STATIC_CACHE, IMMUTABLE_CACHE].includes(name)
            )
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation = event.request.mode === 'navigate';
  const { pathname } = new URL(event.request.url);

  if (
    isNavigation ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next/data/') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/_next/image')
  ) {
    event.respondWith(
      networkOnly(event.request).catch(async () => {
        if (isNavigation) {
          return (await caches.match('/offline.html')) || new Response('Offline', { status: 503 });
        }
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  if (isImmutableAsset(event.request)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => new Response('Offline', { status: 503 })));
});
