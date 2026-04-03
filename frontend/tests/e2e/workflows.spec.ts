import { test, expect, type Page } from '@playwright/test';
import { mockWails } from './helpers/mockWails';

const login = async (page: Page) => {
  await page.goto('/');
  await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('admin');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('main-layout')).toBeVisible();
};

test.describe('Main Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await mockWails(page);
    await login(page);
  });

  test('switches views via sidebar buttons', async ({ page }) => {
    await expect(page.getByTestId('main-layout')).toHaveAttribute('data-active-view', 'dashboard');

    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('main-layout')).toHaveAttribute('data-active-view', 'products');

    await page.getByTestId('nav-customers').click();
    await expect(page.getByTestId('main-layout')).toHaveAttribute('data-active-view', 'customers');

    await page.getByTestId('nav-sales').click();
    await expect(page.getByTestId('main-layout')).toHaveAttribute('data-active-view', 'sales');
  });

  test('toggles theme from sidebar', async ({ page }) => {
    const html = page.locator('html');

    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.getByTestId('theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('logs out back to login screen', async ({ page }) => {
    await page.getByTestId('logout-button').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
  });
});
