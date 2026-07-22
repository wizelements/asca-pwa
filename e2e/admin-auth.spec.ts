import { expect, test } from '@playwright/test';

test('unauthenticated admin is redirected to the labeled login form', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole('heading', { name: 'ASCA Admin' })).toBeVisible();
  await expect(page.getByLabel('Email')).toHaveAttribute('type', 'email');
  await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});
