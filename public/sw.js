const CACHE_PREFIX = 'asca-pwa';
const CACHE_VERSION = '20260720-speed-optimization';
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

async function fetchFresh(request) {
  return fetch(request, { cache: 'reload' });
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
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, IMMUTABLE_CACHE].includes(name))
          .map((name) => caches.delete(name))
      );
    })
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => {
          const url = new URL(client.url);
          if (url.origin === self.location.origin) {
            client.navigate(client.url);
          }
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNav = event.request.mode === 'navigate';
  const { pathname } = new URL(event.request.url);

  // Always fetch pages, admin screens, APIs, Next data, manifests, and content images fresh.
  // The previous cache-first strategy stored HTML and made users open Incognito to see updates.
  if (
    isNav ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next/data/') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/_next/image')
  ) {
    event.respondWith(
      fetchFresh(event.request).catch(() => {
        if (isNav) return caches.match('/offline.html');
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  if (isImmutableAsset(event.request)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => new Response('Offline', { status: 503 }))
  );
});
