import { expect, test, type Page } from '@playwright/test';

const ADMIN_EMAIL = 'e2e-admin@example.com';
const ADMIN_PASSWORD = 'E2E-Admin-Only!2026';

async function signIn(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
}

test.describe('authenticated admin client workspace', () => {
  test('full walkthrough covers the complete workspace and can finish', async ({ page }) => {
    await signIn(page);

    const dialog = page.getByRole('dialog', { name: /Welcome to the ASCA Client Workspace/ });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('1 of 15');

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
      'Page images — photography used around the site',
      'Appearance — brand settings',
      'Social & donations — public links and payment handles',
      'Account — protect admin access',
      'Preview — verify what visitors actually see',
      'Backups and Help — finish safely',
    ];

    for (let index = 0; index < expectedTitles.length; index += 1) {
      await expect(page.getByRole('heading', { name: expectedTitles[index] })).toBeVisible();
      await expect(dialog).toContainText((index + 1) + ' of 15');

      if (index < expectedTitles.length - 1) {
        await page.getByRole('button', { name: 'Next' }).click();
      }
    }

    await page.getByRole('button', { name: 'Finish tour' }).click();
    await expect(dialog).toBeHidden();
  });

  test('help page is a complete client operating guide', async ({ page }) => {
    await signIn(page);
    await page.getByRole('button', { name: 'Close walkthrough' }).click();

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
      'Page images',
      'Appearance',
      'Social & donations',
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
    await page.getByRole('button', { name: 'Close walkthrough' }).click();

    for (const route of ['/admin/albums', '/admin/horses', '/admin/categories', '/admin/media-integrity']) {
      await page.goto(route);
      await expect(page.getByRole('button', { name: 'Walkthrough' })).toHaveCount(1);
      await expect(page.getByRole('link', { name: /View site/ })).toHaveCount(1);
    }
  });

  test('walkthrough can be restarted from the admin header', async ({ page }) => {
    await signIn(page);

    const initialDialog = page.getByRole('dialog');
    if (await initialDialog.count()) {
      await page.getByRole('button', { name: 'Finish tour' }).click().catch(async () => {
        await page.getByRole('button', { name: 'Close walkthrough' }).click();
      });
    }

    await page.goto('/admin/help');
    await page.getByRole('button', { name: 'Walkthrough' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome to the ASCA Client Workspace' })).toBeVisible();
  });
});
