# ASCA PWA Configuration & Setup Guide

---

## 1. PWA Manifest

File: `public/manifest.json`

```json
{
  "name": "Atlanta Saddle Club Association",
  "short_name": "ASCA",
  "description": "We Ride To Inspire - Join our premier equestrian community for training, events, and connections",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#1a1a1a",
  "theme_color": "#f5d800",
  "categories": ["community", "events", "sports"],
  "screenshots": [
    {
      "src": "/screenshots/narrow-540.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "ASCA App Home Screen"
    },
    {
      "src": "/screenshots/wide-1280.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "ASCA App on Desktop"
    }
  ],
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "View Events",
      "short_name": "Events",
      "description": "See upcoming ASCA events",
      "url": "/calendar",
      "icons": [
        {
          "src": "/icons/event-96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Join ASCA",
      "short_name": "Join",
      "description": "Start your ASCA membership",
      "url": "/get-involved",
      "icons": [
        {
          "src": "/icons/join-96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Donate",
      "short_name": "Donate",
      "description": "Support ASCA's mission",
      "url": "/donate",
      "icons": [
        {
          "src": "/icons/donate-96.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "share_target": {
    "action": "/api/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

---

## 2. Next.js PWA Configuration

File: `next.config.js`

```javascript
import withPWA from 'next-pwa';
import runtimeCaching from 'next-pwa/cache';

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // Service worker disabled in development for easier debugging
  register: true,
  skipWaiting: false,
  // Don't immediately activate new SW; wait for user confirmation
  reloadOnOnline: true,
  // Reload page when connection restored
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // API routes: Network first, cache fallback
      {
        urlPattern: /^https:\/\/[^/]*\/api\//i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      // CMS API (Strapi): Network first
      {
        urlPattern: /^https:\/\/strapi-api\.[^/]*\/graphql/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'cms-api',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 24 * 60 * 60,
          },
        },
      },
      // Google Fonts: Cache first
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      // Next.js images: Cache first
      {
        urlPattern: /\/_next\/image/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-images',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      // External images: Cache first with update
      {
        urlPattern: /^https:\/\/images\./i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
      // Static assets: Cache first
      {
        urlPattern: /\.(?:js|css|woff2?)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-assets',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      // HTML pages: Network first
      {
        urlPattern: /\.html$/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'html-pages',
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
        },
      },
    ],
  },
});

export default withPWAConfig({
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  images: {
    remotePatterns: [
      { hostname: '*.supabase.co' },
      { hostname: 'strapi-api.example.com' },
      { hostname: 'images.example.com' },
    ],
  },
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
  ],
});
```

---

## 3. Service Worker Registration

File: `src/app/layout.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { registerServiceWorker, checkForUpdates } from '@/lib/serviceWorker';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Register SW
    registerServiceWorker();

    // Check for updates every 6 hours
    const interval = setInterval(checkForUpdates, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <html>
      <head>
        <meta name="theme-color" content="#f5d800" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 4. Advanced Service Worker Code

File: `public/sw.js`

```javascript
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Critical assets to cache on install
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// INSTALL EVENT: Cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching critical assets');
      return cache.addAll(CRITICAL_ASSETS);
    })
  );
  // Activate immediately (aggressive for updates)
  self.skipWaiting();
});

// ACTIVATE EVENT: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete if version doesn't match
            return !cacheName.includes(CACHE_VERSION);
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
  // Notify all clients about update
  notifyClients({
    type: 'SW_UPDATED',
    message: 'App updated. Refresh to see changes.',
  });
});

// FETCH EVENT: Implement caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests, chrome extensions, etc.
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // HTML pages: Network first, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return (
            caches
              .match(request)
              .then((cached) => cached || caches.match('/offline.html'))
          );
        })
    );
  }

  // API requests: Network first with timeout
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(networkFirstWithTimeout(request, 5000));
  }

  // CMS API: Network first
  if (url.hostname.includes('strapi')) {
    return event.respondWith(networkFirstWithTimeout(request, 5000));
  }

  // Images: Cache first, fall back to placeholder
  if (request.destination === 'image') {
    return event.respondWith(cacheFirstWithFallback(request, '/icons/placeholder.png'));
  }

  // Fonts: Cache first (forever)
  if (request.destination === 'font') {
    return event.respondWith(cacheFirst(request, 'fonts'));
  }

  // Static assets (JS, CSS): Cache first
  if (/\.(?:js|css|woff2?)$/.test(url.pathname)) {
    return event.respondWith(cacheFirst(request, 'static'));
  }

  // Default: Network first
  event.respondWith(networkFirst(request));
});

// SYNC EVENT: Retry failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'offline-sync') {
    event.waitUntil(syncOfflineQueue());
  }
});

// MESSAGE EVENT: Handle postMessage from client
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      Promise.all(cacheNames.map((name) => caches.delete(name)));
    });
  }
});

// PUSH EVENT: Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    tag: data.tag || 'asca-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// NOTIFICATION CLICK: Handle clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const actionId = event.action;
  const clickedData = event.notification.data;

  // Determine where to navigate
  const url = clickedData.actionUrl || clickedData.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Find existing window or open new one
      const matchedClient = clientList.find((client) =>
        client.url.includes(url)
      );

      if (matchedClient) {
        return matchedClient.focus();
      } else {
        return clients.openWindow(url);
      }
    })
  );
});

// ──────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────

function networkFirst(request, timeout = 5000) {
  return Promise.race([
    fetch(request).then((response) => {
      // Always update cache with fresh response
      if (response.status === 200) {
        caches.open(API_CACHE).then((cache) => {
          cache.put(request, response.clone());
        });
      }
      return response;
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
  ]).catch(() =>
    caches.match(request).then((cached) => cached || cacheError(request))
  );
}

function networkFirstWithTimeout(request, timeout) {
  return networkFirst(request, timeout);
}

function cacheFirst(request, cacheName = DYNAMIC_CACHE) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request).then((response) => {
      if (response.status === 200) {
        caches.open(cacheName).then((cache) => {
          cache.put(request, response.clone());
        });
      }
      return response;
    });
  });
}

function cacheFirstWithFallback(request, fallbackUrl) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;

    return fetch(request)
      .then((response) => {
        if (response.status === 200) {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      })
      .catch(() => caches.match(fallbackUrl));
  });
}

function cacheError() {
  return caches.match('/offline.html');
}

async function syncOfflineQueue() {
  try {
    const cache = await caches.open('offline-queue');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await fetch(request.clone());
        if (response.ok) {
          await cache.delete(request);
        }
      } catch (error) {
        console.error('[SW] Sync failed for', request.url, error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

function notifyClients(message) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
}
```

---

## 5. Offline Fallback Page

File: `public/offline.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ASCA - Offline</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Open Sans', sans-serif;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        color: #ffffff;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .container {
        max-width: 600px;
        text-align: center;
      }

      .logo {
        width: 120px;
        height: 120px;
        margin: 0 auto 30px;
        background: #f5d800;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 60px;
      }

      h1 {
        font-family: 'Playfair Display', serif;
        font-size: 2.5rem;
        margin-bottom: 10px;
        color: #f5d800;
      }

      h2 {
        font-size: 1.25rem;
        color: #fef3c7;
        margin-bottom: 20px;
        font-weight: 300;
      }

      p {
        font-size: 1.1rem;
        line-height: 1.6;
        margin-bottom: 30px;
        color: #d1d5db;
      }

      .status {
        background: rgba(245, 216, 0, 0.1);
        border-left: 4px solid #f5d800;
        padding: 15px;
        margin: 30px 0;
        border-radius: 4px;
        text-align: left;
      }

      .status strong {
        color: #f5d800;
      }

      .offline-icon {
        font-size: 3rem;
        margin-bottom: 20px;
      }

      .actions {
        margin-top: 40px;
      }

      button {
        background: #f5d800;
        color: #1a1a1a;
        border: none;
        padding: 12px 30px;
        font-size: 1rem;
        font-weight: bold;
        border-radius: 4px;
        cursor: pointer;
        margin: 10px;
        transition: opacity 0.3s;
      }

      button:hover {
        opacity: 0.9;
      }

      button:active {
        transform: scale(0.98);
      }

      .offline-content {
        margin-top: 40px;
        background: rgba(255, 255, 255, 0.05);
        padding: 20px;
        border-radius: 8px;
      }

      .offline-content h3 {
        margin: 15px 0 10px;
        text-align: left;
        color: #fef3c7;
      }

      .offline-content ul {
        list-style: none;
        text-align: left;
      }

      .offline-content li {
        padding: 8px 0;
        color: #d1d5db;
      }

      .offline-content li:before {
        content: '✓ ';
        color: #f5d800;
        font-weight: bold;
        margin-right: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="offline-icon">📱</div>

      <h1>ASCA</h1>
      <h2>We Ride To Inspire</h2>

      <div class="status">
        <strong>You're offline</strong>
        <p>
          We couldn't reach our servers. Check your internet connection and try
          again.
        </p>
      </div>

      <p>
        The ASCA app is optimized to work offline. Previously visited pages and
        content will load normally.
      </p>

      <div class="actions">
        <button onclick="window.location.reload()">↺ Retry Connection</button>
        <button onclick="window.history.back()">← Go Back</button>
      </div>

      <div class="offline-content">
        <h3>Available Offline</h3>
        <ul>
          <li>Your Profile & Settings</li>
          <li>Previously viewed Events</li>
          <li>Cached Blog Posts & Gallery</li>
          <li>Offline Form Submission</li>
        </ul>

        <h3>Coming Soon</h3>
        <ul>
          <li>Automatic Sync when online</li>
          <li>Offline Calendar Navigation</li>
        </ul>
      </div>
    </div>

    <script>
      // Check for connectivity restore
      window.addEventListener('online', () => {
        // Show update banner
        const banner = document.createElement('div');
        banner.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #22c55e;
          color: white;
          padding: 15px;
          text-align: center;
          font-weight: bold;
          z-index: 9999;
        `;
        banner.textContent = '✓ You are back online! Syncing...';
        document.body.prepend(banner);

        // Retry after 2 seconds
        setTimeout(() => window.location.reload(), 2000);
      });
    </script>
  </body>
</html>
```

---

## 6. Service Worker Utilities

File: `src/lib/serviceWorker.ts`

```typescript
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('✓ Service Worker registered');

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // New SW waiting, notify user
          showUpdatePrompt(registration);
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('✗ Service Worker registration failed:', error);
  }
}

export async function checkForUpdates() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update();
  }
}

export function showUpdatePrompt(registration: ServiceWorkerContainer) {
  const banner = document.createElement('div');
  banner.id = 'sw-update-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: #4a4b02;
    color: #f5d800;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  `;

  banner.innerHTML = `
    <span>✓ App update available</span>
    <button id="update-button" style="
      background: #f5d800;
      color: #1a1a1a;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">Update Now</button>
  `;

  document.body.appendChild(banner);

  document.getElementById('update-button').addEventListener('click', () => {
    // Tell SW to skip waiting
    const newWorker = registration.installing;
    newWorker.postMessage({ type: 'SKIP_WAITING' });

    // Reload when activated
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    banner.remove();
  });

  // Auto-remove after 10 seconds
  setTimeout(() => banner.remove(), 10000);
}

export async function getServiceWorkerStatus() {
  const registration = await navigator.serviceWorker.getRegistration();

  return {
    isRegistered: !!registration,
    isActive: registration?.active ? true : false,
    isInstalling: registration?.installing ? true : false,
    isWaiting: registration?.waiting ? true : false,
  };
}

export async function unregisterServiceWorker() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.unregister();
    console.log('✓ Service Worker unregistered');
  }
}

export async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('✓ All caches cleared');
}
```

---

## 7. PWA Installation Prompt

File: `src/components/PWAInstallPrompt.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
      // Track installation
      fetch('/api/analytics/install', { method: 'POST' });
    }
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        background: '#1a1a1a',
        border: '2px solid #f5d800',
        padding: '20px',
        borderRadius: '8px',
        zIndex: 9998,
        maxWidth: '400px',
        margin: '0 auto',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <h3 style={{ color: '#f5d800', marginBottom: '10px' }}>
        Install ASCA App
      </h3>
      <p style={{ color: '#d1d5db', marginBottom: '15px', fontSize: '0.9rem' }}>
        Get instant access to events, membership, and community updates
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleInstall}
          style={{
            flex: 1,
            background: '#f5d800',
            color: '#1a1a1a',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Install
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          style={{
            flex: 1,
            background: 'transparent',
            color: '#f5d800',
            border: '1px solid #f5d800',
            padding: '10px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
```

---

## 8. PWA Testing Checklist

### Local Testing
```bash
# 1. Build production bundle
npm run build

# 2. Serve production locally
npm start

# 3. Open DevTools (F12) > Application > Manifest
# Verify all required fields present

# 4. Open DevTools > Application > Service Workers
# Verify SW is registered and active

# 5. Test offline
# DevTools > Application > Network > Offline
# Verify offline fallback page loads

# 6. Test cache
# DevTools > Application > Cache Storage
# Verify cached assets present
```

### Installation Testing
```
1. On mobile: Tap menu > "Add to Home Screen"
2. Verify app launches in standalone mode
3. Check if splash screen displays
4. Verify icons are correct
5. Check theme color matches brand
```

### Lighthouse Audit
```bash
# Run Lighthouse PWA audit
npm run lighthouse

# Check PWA score is 90+
# Verify all PWA checks pass:
# ✓ installable
# ✓ has icons
# ✓ starts in standalone mode
# ✓ has theme color
# ✓ has splash screen
```

---

## 9. Performance Optimization

### Caching Strategy Summary
| Asset Type | Strategy | TTL |
|-----------|----------|-----|
| HTML Pages | Network First | 24h |
| API Responses | Network First | 24h |
| Images | Cache First | 7d |
| Fonts | Cache First | 1yr |
| Static (JS/CSS) | Cache First | 1yr |
| Google Fonts | Cache First | 1yr |

### Web Vitals Target
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- TTFB (Time to First Byte): < 600ms

---

**End of PWA Configuration**
