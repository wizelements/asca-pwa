import { expect, test } from '@playwright/test';

test.describe('public gallery', () => {
  test('grid, album journey, lightbox, breadcrumb, and pagination', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page.getByRole('heading', { name: 'Photo Gallery', level: 1 })).toBeVisible();

    const albumCards = page.locator('a[href^="/gallery/"]');
    if ((await albumCards.count()) === 0) {
      test.skip(true, 'Public-preview is disabled or there are no published albums');
    }

    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    if (await pagination.count()) {
      await expect(pagination.getByLabel('Go to page 1')).toHaveAttribute('aria-current', 'page');
    }

    await albumCards.first().click();
    await expect(page.getByRole('link', { name: /Back to Gallery/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const imageButtons = page.getByRole('button', { name: /^Open image/ });
    if ((await imageButtons.count()) > 0) {
      await imageButtons.first().click();
      await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeHidden();
    }
  });
});
