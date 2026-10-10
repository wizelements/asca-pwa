import { expect, test } from '@playwright/test';

test.describe('ASCA member share center', () => {
  test('renders the branded QR sharing and install flow', async ({ page, request }) => {
    const response = await page.goto('/share');
    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole('heading', { name: 'Share the ride. Grow the community.', level: 1 })
    ).toBeVisible();

    const qr = page.getByRole('img', {
      name: 'QR code for the Atlanta Saddle Club Association website',
    });
    await expect(qr).toBeVisible();
    await expect(qr).toHaveAttribute('src', '/qr/asca-site.svg');

    await expect(page.getByRole('button', { name: 'Share ASCA' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy Link' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Install ASCA|ASCA Installed/ })).toBeVisible();
    const expectedSiteUrl = new URL('/', page.url()).origin;
    await expect(page.getByRole('link', { name: 'Open Website' })).toHaveAttribute(
      'href',
      expectedSiteUrl
    );
    await expect(page.getByRole('link', { name: 'Download QR for print or flyers' })).toHaveAttribute(
      'href',
      '/qr/asca-site.svg'
    );

    const qrResponse = await request.get('/qr/asca-site.svg');
    expect(qrResponse.ok()).toBeTruthy();
    expect(qrResponse.headers()['content-type']).toContain('image/svg+xml');

    const manifestResponse = await request.get('/manifest.json');
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json();
    expect(manifest.shortcuts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Share ASCA',
          url: '/share',
        }),
      ])
    );

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
  });
});
