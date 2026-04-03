import type { Page } from '@playwright/test';

export async function mockWails(page: Page) {
  await page.addInitScript(() => {
    const windowWithWails = window as Window &
      typeof globalThis & {
        go: {
          handler: { App: Record<string, unknown> };
          main: { App: Record<string, unknown> };
        };
        runtime: Record<string, () => void>;
      };

    const now = new Date().toISOString();

    const products = [
      {
        id: 'prod-1',
        name: 'قهوة تركية 200 غ',
        barcode: '1000001',
        price: 5000,
        cost: 3000,
        stock: 25,
        minStock: 5,
        category: 'مشروبات',
        emoji: '☕',
        wholesalePrice: 4000,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-2',
        name: 'شيبس ليز',
        barcode: '2000001',
        price: 750,
        cost: 450,
        stock: 80,
        minStock: 10,
        category: 'مأكولات',
        emoji: '🥔',
        wholesalePrice: 600,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const customers = [
      {
        id: 'cust-1',
        name: 'أحمد علي',
        phone: '0770000000',
        debt: 0,
        installmentDebt: 0,
        totalPurchases: 25000,
        lastVisit: '2026-04-03',
        points: 25,
        notes: 'عميل دائم',
        createdAt: now,
        updatedAt: now,
      },
    ];

    let recentSales = [
      {
        id: 'sale-1',
        customerId: '',
        customerName: 'عميل نقدي',
        customer: 'عميل نقدي',
        staffId: 'staff-1',
        staffName: 'المدير',
        date: '2026-04-03',
        timestamp: Date.now(),
        subtotal: 5000,
        discount: 0,
        vat: 0,
        total: 5000,
        paymentMethod: 'cash',
        status: 'completed',
        itemsCount: 1,
        items: [],
        pointsAwarded: 0,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const preferences = {
      storeName: 'Bard',
      storeAddress: 'بغداد',
      storePhone: '0770000000',
      currency: 'د.ع',
      taxRate: 0,
      theme: 'dark',
      accentColor: '#6366f1',
      enableSound: true,
      language: 'ar',
      lowStockTrigger: 5,
      adminPin: '',
      fontSize: 'medium',
      autoLockTime: 0,
      quickSell: false,
      autoPrint: false,
      autoPrintFormat: 'thermal',
      thermalPaperSize: '80mm',
      requireShift: false,
      receiptFooter: 'شكراً لزيارتكم',
      showLogo: true,
      showItems: true,
      showBarcode: true,
      showFooter: true,
    };

    const categories = ['مشروبات', 'مأكولات'];

    const buildProductStats = (items: typeof products) => {
      const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
      const totalValue = items.reduce((sum, item) => sum + item.stock * item.price, 0);
      const totalCost = items.reduce((sum, item) => sum + item.stock * item.cost, 0);
      return {
        totalStock,
        totalValue,
        totalCost,
        profit: totalValue - totalCost,
      };
    };

    const app = {
      Login: async (username: string, password: string) => {
        if (username === 'admin' && password === 'admin') {
          return {
            id: 'staff-1',
            username: 'admin',
            name: 'المدير',
            role: 'admin',
            isActive: true,
            createdAt: now,
            updatedAt: now,
          };
        }
        return null;
      },
      GetDashboardStats: async () => ({
        todaySales: 5000,
        todayOrders: 1,
        monthSales: 5000,
        monthOrders: 1,
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalDebt: 0,
        lowStockCount: 0,
        topProducts: [],
        recentSales,
      }),
      GetPreferences: async () => preferences,
      UpdatePreferences: async () => undefined,
      GetProducts: async (_page: number, limit: number, search: string, category: string) => {
        const filtered = products.filter((product) => {
          const matchesSearch =
            !search ||
            product.name.includes(search) ||
            product.barcode.includes(search);
          const matchesCategory = !category || category === 'الكل' || product.category === category;
          return matchesSearch && matchesCategory;
        });

        return {
          data: filtered.slice(0, limit),
          total: filtered.length,
          totalPages: 1,
          page: 1,
          stats: buildProductStats(filtered),
        };
      },
      GetCategories: async () => categories,
      SearchProducts: async (query: string, limit: number) =>
        products
          .filter((product) => product.name.includes(query) || product.barcode.includes(query))
          .slice(0, limit),
      GetCustomers: async () => [customers, customers.length],
      GetStaff: async () => [],
      GetSuppliers: async () => [],
      GetPurchaseOrders: async () => ({
        data: [],
        total: 0,
        totalPages: 1,
        page: 1,
      }),
      GetRecentSales: async (limit: number) => recentSales.slice(0, limit),
      CreateSale: async (sale: Record<string, unknown>) => {
        const createdSale = {
          ...recentSales[0],
          ...sale,
          id: `sale-${recentSales.length + 1}`,
          date: '2026-04-03',
          customer: (sale.customerName as string) || 'عميل نقدي',
          createdAt: now,
          updatedAt: now,
        };
        recentSales = [createdSale, ...recentSales];
      },
      CreateProduct: async () => undefined,
      UpdateProduct: async () => undefined,
      DeleteProduct: async () => undefined,
      CreateCustomer: async () => undefined,
      UpdateCustomer: async () => undefined,
      DeleteCustomer: async () => undefined,
      ResetDatabase: async () => undefined,
      ExportDatabase: async () => ({ preferences, products, customers }),
    };

    windowWithWails.go = {
      handler: { App: app },
      main: { App: app },
    };

    windowWithWails.runtime = {
      WindowMinimise: () => undefined,
      WindowToggleMaximise: () => undefined,
      Quit: () => undefined,
      EventsOn: () => undefined,
      EventsOff: () => undefined,
      EventsEmit: () => undefined,
    };

    window.confirm = () => true;
  });
}
