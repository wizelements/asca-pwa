import { expect, test } from '@playwright/test';

test.describe('public horses', () => {
  test('grid, horse journey, lightbox, breadcrumb, and pagination', async ({ page }) => {
    const response = await page.goto('/horses');
    if (response?.status() === 404) test.skip(true, 'Public-preview feature stage is disabled');

    await expect(page.getByRole('heading', { name: 'Our Horses', level: 1 })).toBeVisible();
    const cards = page.locator('a[href^="/horses/"]');
    if ((await cards.count()) === 0) test.skip(true, 'No published horse profiles');

    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    if (await pagination.count()) {
      await expect(pagination.getByLabel('Go to page 1')).toHaveAttribute('aria-current', 'page');
    }

    await cards.first().click();
    await expect(page.getByRole('link', { name: /Back to Our Horses/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const imageButtons = page.getByRole('button', { name: /^Open (primary )?image/ });
    if ((await imageButtons.count()) > 0) {
      await imageButtons.first().click();
      await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeHidden();
    }
  });
});
