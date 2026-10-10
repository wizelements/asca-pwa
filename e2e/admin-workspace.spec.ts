import { expect, test, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'e2e-admin@example.com';
const ADMIN_PASSWORD = ['E2E', 'Admin', 'Only', '2026'].join('-');

async function signIn(page: Page) {
  const response = await page.request.post('/api/auth', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(response.status()).toBe(200);

  const cookies = await page.context().cookies();
  expect(cookies.some((cookie) => cookie.name === 'asca_admin_session')).toBeTruthy();

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
}

async function markTourCompleteAndClose(page: Page) {
  await page.evaluate(() => localStorage.setItem('asca_admin_walkthrough_v2', 'complete'));
  const close = page.getByRole('button', { name: 'Close walkthrough' });
  if (await close.count()) await close.click();
}

test.describe('authenticated admin client workspace', () => {
  test('full walkthrough covers the complete workspace and can finish', async ({ page }) => {
    await signIn(page);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('1 of 16');

    const expectedTitles = [
      'Welcome to the ASCA Client Workspace',
      'Dashboard — your daily starting point',
      'Messages — website inquiries',
      'Contacts — relationship records',
      'Members — official member records',
      'Tasks — follow-up that cannot be forgotten',
      'Events — the public calendar',
      'Gallery albums — activity photos',
      'Horses — public horse profiles',
      'Page text — visitor-facing wording without code',
      'Page images — photography used around the site',
      'Appearance — brand settings',
      'Public site settings — homepage identity, contact, social & giving',
      'Account — protect admin access',
      'Preview — verify what visitors actually see',
      'Backups and Help — finish safely',
    ];

    for (let index = 0; index < expectedTitles.length; index += 1) {
      await expect(page.getByRole('heading', { name: expectedTitles[index] })).toBeVisible();
      await expect(dialog).toContainText((index + 1) + ' of 16');

      if (index < expectedTitles.length - 1) {
        await page.getByRole('button', { name: 'Next' }).click();
      }
    }

    await page.getByRole('button', { name: 'Finish tour' }).click();
    await expect(dialog).toBeHidden();
  });

  test('help page is a complete client operating guide', async ({ page }) => {
    await signIn(page);
    await markTourCompleteAndClose(page);

    await page.goto('/admin/help');
    await expect(page.getByRole('heading', { name: 'Client guide & walkthrough' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start full walkthrough' })).toBeVisible();

    for (const section of [
      'Dashboard',
      'Messages',
      'Contacts',
      'Members',
      'Tasks',
      'Events',
      'Gallery albums',
      'Horses',
      'Page text',
      'Page images',
      'Appearance',
      'Public site settings',
      'Account',
    ]) {
      await expect(page.getByRole('heading', { name: section, exact: true })).toBeVisible();
    }

    await expect(page.getByText('Save is not verification.')).toBeVisible();
    await expect(page.getByText('Draft before publish.')).toBeVisible();
    await expect(page.getByText('Archive before delete.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quick recipes' })).toBeVisible();
  });

  test('admin pages render one global workspace shell', async ({ page }) => {
    await signIn(page);
    await markTourCompleteAndClose(page);

    for (const route of ['/admin/albums', '/admin/horses', '/admin/categories', '/admin/media-integrity']) {
      await page.goto(route);
      await expect(page.getByRole('button', { name: 'Start admin walkthrough' })).toHaveCount(1);
      await expect(page.getByRole('link', { name: /View site/ })).toHaveCount(1);
    }
  });

  test('walkthrough can be restarted from the admin header', async ({ page }) => {
    await signIn(page);
    await markTourCompleteAndClose(page);

    await page.goto('/admin/help');
    await page.getByRole('button', { name: 'Start admin walkthrough' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome to the ASCA Client Workspace' })).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText('1 of 16');
  });
  test('mobile client can open navigation and restart the guide', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);
    await markTourCompleteAndClose(page);

    await page.goto('/admin');
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('navigation', { name: 'Admin' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Gallery albums' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Help & walkthrough' })).toBeVisible();
    await page.getByRole('dialog', { name: 'Admin navigation' }).getByRole('button', { name: 'Close navigation' }).click();
    await expect(page.getByRole('dialog', { name: 'Admin navigation' })).toHaveCount(0);

    await expect(page.getByRole('button', { name: 'Start admin walkthrough' })).toBeVisible();
    await page.getByRole('button', { name: 'Start admin walkthrough' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome to the ASCA Client Workspace' })).toBeVisible();
  });

  test('public-facing admin controls explain their real website effects', async ({ page }) => {
    await signIn(page);
    await markTourCompleteAndClose(page);

    await page.goto('/admin/media');
    await expect(page.getByRole('heading', { name: 'Page Images' })).toBeVisible();
    await expect(page.getByText('Fallback does not mean broken.')).toBeVisible();
    await expect(page.getByRole('link', { name: /View affected page/ }).first()).toBeVisible();
    await expect(page.getByText('Fallback only').first()).toBeVisible();

    await page.goto('/admin/forms');
    await expect(page.getByRole('heading', { name: 'Messages', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Where Messages come from' })).toBeVisible();
    await expect(page.locator('strong').filter({ hasText: 'Website Contact Form' })).toBeVisible();
    await expect(page.locator('strong').filter({ hasText: 'Event Updates Form' })).toBeVisible();

    await page.goto('/admin/settings');
    await expect(page.getByRole('heading', { name: 'Public Site Settings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Homepage Identity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Public Contact Email' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Social Links' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Donation Methods' })).toBeVisible();
  });

  test('public settings reject unsafe or structurally invalid values', async ({ page }) => {
    await signIn(page);
    await markTourCompleteAndClose(page);

    const unsafeSocial = await page.request.post('/api/settings', {
      data: { social: { facebook: 'javascript:alert(1)' } },
    });
    expect(unsafeSocial.status()).toBe(400);
    await expect(unsafeSocial.json()).resolves.toMatchObject({
      error: expect.stringMatching(/http:\/\/ or https:\/\//i),
    });

    const oversizedMotto = await page.request.post('/api/settings', {
      data: { siteDescription: 'A'.repeat(81) },
    });
    expect(oversizedMotto.status()).toBe(400);
    await expect(oversizedMotto.json()).resolves.toMatchObject({
      error: expect.stringMatching(/1 and 80 characters/i),
    });
  });

  test('Page Text editor exposes public destinations without mixing dynamic content editors', async ({ page }) => {
    await signIn(page);
    await markTourCompleteAndClose(page);

    await page.goto('/admin/content');
    await expect(page.getByRole('heading', { name: 'Page Text' })).toBeVisible();
    await expect(page.getByText('Safe text only.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Homepage', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About ASCA', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shared Site Copy', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /View public page/ }).first()).toBeVisible();
    await expect(page.getByText(/dynamic records such as Events, Gallery Albums, Horses, Members/i)).toBeVisible();
  });

});
