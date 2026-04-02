import { test, expect } from '@playwright/test';

test.describe('Beidar POS App End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Mock Wails APIs here to prevent crashing in a normal browser env
    await page.evaluate(() => {
      window.go = {
        main: {
          App: {
            GetPreferences: async () => ({
              storeName: 'متجر اختبار',
              storeAddress: 'بغداد',
              storePhone: '0770000000',
              currency: 'IQD',
              taxRate: 0,
              receiptFooter: 'شكرا',
              theme: 'dark'
            }),
            GetDashboardStats: async () => ({
              dailySales: 1000,
              monthlySales: 30000,
              weeklySales: 7000,
              totalCustomers: 10,
              totalProducts: 50,
              lowStockProducts: 2,
              totalDebt: 500,
              salesGrowth: 5.5,
              customersGrowth: 2.1
            }),
            GetProducts: async () => ({ data: [], total: 0, totalPages: 1, page: 1 }),
            GetSales: async () => ({ data: [], total: 0, totalPages: 1, page: 1 }),
            GetCustomers: async () => ({ data: [], total: 0, totalPages: 1, page: 1 }),
            GetSuppliers: async () => ({ data: [], total: 0, totalPages: 1, page: 1 }),
            GetPurchaseOrders: async () => ({ data: [], total: 0, totalPages: 1, page: 1 }),
          }
        }
      } as any;
    });
  });

  test('should display splash screen and go to login', async ({ page }) => {
    // The splash screen should show up initially
    await expect(page.getByText('بيدر')).toBeVisible();

    // After 1.5 seconds, it should go to login screen
    // We wait for the login screen to appear
    await expect(page.getByText('تسجيل الدخول')).toBeVisible({ timeout: 5000 });
  });

  test('should handle valid login flow', async ({ page }) => {
    // Wait for the login screen
    await expect(page.getByText('تسجيل الدخول')).toBeVisible({ timeout: 5000 });

    // Fill in the login form
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button:has-text("تسجيل الدخول")');

    // Should redirect to dashboard
    await expect(page.getByText('لوحة التحكم').first()).toBeVisible({ timeout: 5000 });
  });
});
