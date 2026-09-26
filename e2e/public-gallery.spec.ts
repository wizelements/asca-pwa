import { expect, test } from '@playwright/test';

test.describe('public gallery', () => {
  test('deterministic grid, album journey, lightbox, breadcrumb, and filtering', async ({ page }) => {
    const response = await page.goto('/gallery');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Photo Gallery', level: 1 })).toBeVisible();

    const fixtureCard = page.locator('a[href="/gallery/e2e-trail-ride"]');
    await expect(fixtureCard).toBeVisible();
    await expect(fixtureCard).toContainText('E2E Trail Ride');

    await page.goto('/gallery?category=trail-rides');
    await expect(page.locator('a[href="/gallery/e2e-trail-ride"]')).toBeVisible();

    await page.locator('a[href="/gallery/e2e-trail-ride"]').click();
    await expect(page).toHaveURL(/\/gallery\/e2e-trail-ride$/);
    await expect(page.getByRole('link', { name: /Back to Gallery/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'E2E Trail Ride', level: 1 })).toBeVisible();

    const imageButton = page.getByRole('button', { name: /^Open photo:/ }).first();
    await expect(imageButton).toBeVisible();
    await imageButton.click();
    await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeHidden();
  });
});
