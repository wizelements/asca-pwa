import { expect, test } from '@playwright/test';

test.describe('ASCA PWA foundation', () => {
  test('exposes an installable manifest with branded launch metadata', async ({ page, request }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');

    const splash = page.getByTestId('pwa-launch-splash');
    await expect(splash).toBeAttached();
    await expect(splash).toBeHidden();

    const manifestResponse = await request.get('/manifest.json');
    expect(manifestResponse.ok()).toBeTruthy();
    expect(manifestResponse.headers()['content-type']).toContain('application/manifest+json');

    const manifest = await manifestResponse.json();
    expect(manifest).toMatchObject({
      id: '/',
      name: 'Atlanta Saddle Club Association',
      short_name: 'ASCA',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#1f6b3a',
      theme_color: '#1f6b3a',
      prefer_related_applications: false,
      lang: 'en-US',
      dir: 'ltr',
    });

    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sizes: '192x192', purpose: 'any' }),
        expect.objectContaining({ sizes: '512x512', purpose: 'any' }),
        expect.objectContaining({ sizes: '192x192', purpose: 'maskable' }),
        expect.objectContaining({ sizes: '512x512', purpose: 'maskable' }),
      ])
    );

    for (const asset of [
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/icon-192-maskable.png',
      '/icons/icon-512-maskable.png',
      '/icons/apple-touch-icon.png',
      '/screenshots/narrow-540x720.png',
      '/screenshots/wide-1280x720.png',
    ]) {
      const assetResponse = await request.get(asset);
      expect(assetResponse.ok(), asset).toBeTruthy();
    }
  });

  test('serves a root-scoped service worker and offline fallback', async ({ request }) => {
    const swResponse = await request.get('/sw.js');
    expect(swResponse.ok()).toBeTruthy();
    expect(swResponse.headers()['service-worker-allowed']).toBe('/');
    expect(await swResponse.text()).toContain('20261009-pwa-splash');

    const offlineResponse = await request.get('/offline.html');
    expect(offlineResponse.ok()).toBeTruthy();
    const offlineHtml = await offlineResponse.text();
    expect(offlineHtml).toContain('Atlanta Saddle Club Association');
    expect(offlineHtml).toContain('You’re offline.');
  });
});
