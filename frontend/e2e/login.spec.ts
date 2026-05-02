import { test, expect } from '@playwright/test';

test('Login como estudiante debe funcionar', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'lcastillo@unitru.edu.pe');
  await page.fill('input[type="password"]', 'estudiante123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);
});