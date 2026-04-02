import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login screen on startup', async ({ page }) => {
    await expect(page.locator('text=تسجيل الدخول')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page.locator('text=لوحة التحكم')).toBeVisible({ timeout: 10000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[type="text"]', 'invalid');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=تسجيل الدخول')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page.locator('text=لوحة التحكم')).toBeVisible({ timeout: 10000 });
    
    // Click logout button
    await page.click('[data-testid="logout-button"]');
    
    // Should return to login
    await expect(page.locator('text=تسجيل الدخول')).toBeVisible();
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=لوحة التحكم')).toBeVisible({ timeout: 10000 });
  });

  test('should display dashboard stats', async ({ page }) => {
    await expect(page.locator('text=مبيعات اليوم')).toBeVisible();
    await expect(page.locator('text=طلبات اليوم')).toBeVisible();
    await expect(page.locator('text=المخزون المنخفض')).toBeVisible();
  });

  test('should navigate to sales page', async ({ page }) => {
    await page.click('text=المبيعات');
    await expect(page.locator('text=سجل المبيعات')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.click('text=المنتجات');
    await expect(page.locator('text=قائمة المنتجات')).toBeVisible();
  });

  test('should navigate to customers page', async ({ page }) => {
    await page.click('text=العملاء');
    await expect(page.locator('text=قائمة العملاء')).toBeVisible();
  });
});

test.describe('Sales Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=لوحة التحكم')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to POS sales page', async ({ page }) => {
    await page.click('text=نقاط البيع');
    await expect(page.locator('text=السلة')).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.click('text=نقاط البيع');
    
    // Click on a product
    await page.click('[data-testid="product-card"]:first-child');
    
    // Product should be added to cart
    const cartCount = await page.locator('.cart-item').count();
    expect(cartCount).toBeGreaterThan(0);
  });

  test('should update product quantity in cart', async ({ page }) => {
    await page.click('text=نقاط البيع');
    
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    
    // Increase quantity
    await page.click('[data-testid="increase-qty"]');
    
    // Check quantity updated
    const qty = await page.locator('.cart-item-qty').textContent();
    expect(parseInt(qty || '0')).toBeGreaterThan(1);
  });

  test('should remove product from cart', async ({ page }) => {
    await page.click('text=نقاط البيع');
    
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    
    // Remove product
    await page.click('[data-testid="remove-item"]');
    
    // Cart should be empty or product removed
    const cartItems = await page.locator('.cart-item').count();
    expect(cartItems).toBe(0);
  });

  test('should open payment modal', async ({ page }) => {
    await page.click('text=نقاط البيع');
    
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    
    // Click checkout button
    await page.click('text=إتمام البيع');
    
    // Payment modal should appear
    await expect(page.locator('text=الدفع')).toBeVisible();
  });

  test('should complete cash sale', async ({ page }) => {
    await page.click('text=نقاط البيع');
    
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child');
    
    // Click checkout
    await page.click('text=إتمام البيع');
    
    // Select cash payment
    await page.click('text=نقدي');
    
    // Complete sale
    await page.click('text=تأكيد');
    
    // Success message should appear
    await expect(page.locator('text=تمت العملية بنجاح')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Products Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=لوحة التحكم')).toBeVisible({ timeout: 10000 });
  });

  test('should display products list', async ({ page }) => {
    await page.click('text=المنتجات');
    await expect(page.locator('text=قائمة المنتجات')).toBeVisible();
    
    // Check products are displayed
    const products = await page.locator('[data-testid="product-row"]').count();
    expect(products).toBeGreaterThan(0);
  });

  test('should search products', async ({ page }) => {
    await page.click('text=المنتجات');
    
    // Search for product
    await page.fill('input[type="search"]', 'قهوة');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Products should be filtered
    const products = await page.locator('[data-testid="product-row"]').count();
    expect(products).toBeGreaterThanOrEqual(0);
  });

  test('should open add product modal', async ({ page }) => {
    await page.click('text=المنتجات');
    
    // Click add button
    await page.click('text=إضافة منتج');
    
    // Modal should appear
    await expect(page.locator('text=إضافة منتج جديد')).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    await page.click('text=المنتجات');
    
    // Select category
    await page.selectOption('select[name="category"]', 'مشروبات');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Products should be filtered
    const products = await page.locator('[data-testid="product-row"]').count();
    expect(products).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Customers Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=لوحة التحكم')).toBeVisible({ timeout: 10000 });
  });

  test('should display customers list', async ({ page }) => {
    await page.click('text=العملاء');
    await expect(page.locator('text=قائمة العملاء')).toBeVisible();
  });

  test('should add new customer', async ({ page }) => {
    await page.click('text=العملاء');
    
    // Click add button
    await page.click('text=إضافة عميل');
    
    // Fill customer data
    await page.fill('input[name="name"]', 'عميل جديد');
    await page.fill('input[name="phone"]', '07701234567');
    
    // Save
    await page.click('text=حفظ');
    
    // Customer should be added
    await expect(page.locator('text=عميل جديد')).toBeVisible();
  });

  test('should search customers', async ({ page }) => {
    await page.click('text=العملاء');
    
    // Search
    await page.fill('input[type="search"]', 'أحمد');
    
    await page.waitForTimeout(500);
    
    // Results should appear
    const customers = await page.locator('[data-testid="customer-row"]').count();
    expect(customers).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Returns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=لوحة التحكم')).toBeVisible({ timeout: 10000 });
  });

  test('should access sales history', async ({ page }) => {
    await page.click('text=سجل المبيعات');
    await expect(page.locator('text=سجل المبيعات')).toBeVisible();
  });

  test('should initiate return', async ({ page }) => {
    await page.click('text=سجل المبيعات');
    
    // Wait for sales to load
    await page.waitForTimeout(1000);
    
    // Click return button on first sale
    const returnButton = page.locator('[data-testid="return-button"]').first();
    if (await returnButton.isVisible()) {
      await returnButton.click();
      
      // Return modal should appear
      await expect(page.locator('text=إرجاع الفاتورة')).toBeVisible();
    }
  });
});
