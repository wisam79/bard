import { test, expect } from '@playwright/test';
import { mockWails } from './helpers/mockWails';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockWails(page);
    await page.goto('/');
  });

  test('shows splash then login screen', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Bard' })).toBeVisible();
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
  });

  test('shows validation error on empty credentials', async ({ page }) => {
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('login-submit').click();
    await expect(page.getByRole('alert')).toContainText('يرجى إدخال اسم المستخدم وكلمة المرور');
  });

  test('logs in with valid credentials', async ({ page }) => {
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('login-username').fill('admin');
    await page.getByTestId('login-password').fill('admin');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('main-layout')).toBeVisible();
    await expect(page.getByTestId('main-layout')).toHaveAttribute('data-active-view', 'dashboard');
    await expect(page.getByTestId('page-dashboard')).toBeVisible();
  });

  test('shows auth error on invalid credentials', async ({ page }) => {
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('login-username').fill('wrong');
    await page.getByTestId('login-password').fill('wrong');
    await page.getByTestId('login-submit').click();

    await expect(page.getByRole('alert')).toContainText('اسم المستخدم أو كلمة المرور غير صحيحة');
  });
});
