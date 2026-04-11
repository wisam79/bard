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

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockWails(page);
    await login(page);
    await page.getByTestId('nav-products').click();
  });

  test('displays products list', async ({ page }) => {
    await expect(page.getByText('قهوة تركية')).toBeVisible();
    await expect(page.getByText('شيبس ليز')).toBeVisible();
  });

  test('opens add product modal', async ({ page }) => {
    await page.getByRole('button', { name: 'إضافة منتج جديد' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('filters products by category', async ({ page }) => {
    const categorySelect = page.getByRole('combobox').first();
    await categorySelect.selectOption('مشروبات');
    await expect(page.getByText('قهوة تركية')).toBeVisible();
  });

  test('searches products by name', async ({ page }) => {
    const searchInput = page.getByPlaceholder('بحث باسم المنتج أو الباركود...');
    await searchInput.fill('قهوة');
    await expect(page.getByText('قهوة تركية')).toBeVisible();
  });
});

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    await mockWails(page);
    await login(page);
    await page.getByTestId('nav-customers').click();
  });

  test('displays customers list', async ({ page }) => {
    await expect(page.getByText('أحمد علي')).toBeVisible();
  });

  test('opens add customer modal', async ({ page }) => {
    await page.getByRole('button', { name: 'إضافة عميل جديد' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockWails(page);
    await login(page);
    await page.getByTestId('nav-settings').click();
  });

  test('displays settings tabs', async ({ page }) => {
    await expect(page.getByText('إعدادات المتجر')).toBeVisible();
    await expect(page.getByText('الموظفين والصلاحيات')).toBeVisible();
    await expect(page.getByText('البيانات والنسخ الاحتياطي')).toBeVisible();
  });

  test('switches between settings tabs', async ({ page }) => {
    await page.getByText('الموظفين والصلاحيات').click();
    await expect(page.getByText('إدارة الموظفين')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockWails(page);
    await login(page);
  });

  test('displays dashboard stats', async ({ page }) => {
    await expect(page.getByTestId('page-dashboard')).toBeVisible();
    await expect(page.getByText('إجمالي المبيعات')).toBeVisible();
  });
});
