import { expect, test } from '@playwright/test';

test.describe('public horses', () => {
  test('deterministic horse grid, detail, lightbox, and breadcrumb', async ({ page }) => {
    const response = await page.goto('/horses');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Our Horses', level: 1 })).toBeVisible();

    const fixtureCard = page.locator('a[href="/horses/e2e-horse"]');
    await expect(fixtureCard).toBeVisible();
    await fixtureCard.click();

    await expect(page).toHaveURL(/\/horses\/e2e-horse$/);
    await expect(page.getByRole('link', { name: /Back to Our Horses/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'E2E Horse', level: 1 })).toBeVisible();

    const imageButton = page.getByRole('button', { name: /^Open (primary )?image/ }).first();
    await expect(imageButton).toBeVisible();
    await imageButton.click();
    await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Image viewer' })).toBeHidden();
  });
});
