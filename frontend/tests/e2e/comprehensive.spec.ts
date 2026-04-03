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

test.describe('Sales Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockWails(page);
    await login(page);
    await page.getByTestId('nav-sales').click();
    await expect(page.getByTestId('main-layout')).toHaveAttribute('data-active-view', 'sales');
  });

  test('adds a product to cart', async ({ page }) => {
    await page.getByTestId('product-card-prod-1').click();
    await expect(page.getByTestId('cart-item-prod-1')).toBeVisible();
  });

  test('opens payment modal when cart has items', async ({ page }) => {
    await page.getByTestId('product-card-prod-1').click();
    await expect(page.getByTestId('cart-item-prod-1')).toBeVisible();

    await page.getByTestId('checkout-button').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('إتمام عملية البيع')).toBeVisible();
  });
});
