import '@testing-library/jest-dom';

// ─── Mock Wails runtime for all tests ─────────────────────────────────────────
// Using a plain mutable object so tests can override individual methods via:
//   window.go.handler.App.Login = vi.fn().mockResolvedValue(...)

const noop = () => {};
const resolveNull = () => Promise.resolve(null);

const MockApp: Record<string, (...args: unknown[]) => unknown> = {
  // Auth
  Login: resolveNull,
  // Products
  GetProducts: resolveNull,
  GetProduct: resolveNull,
  GetProductByBarcode: resolveNull,
  CreateProduct: resolveNull,
  UpdateProduct: resolveNull,
  DeleteProduct: resolveNull,
  GetCategories: resolveNull,
  GetProductStats: resolveNull,
  GetLowStockProducts: resolveNull,
  SearchProducts: resolveNull,
  // Sales
  GetSales: resolveNull,
  GetSale: resolveNull,
  CreateSale: resolveNull,
  ProcessReturn: resolveNull,
  GetRecentSales: resolveNull,
  GetParkedSales: resolveNull,
  ParkSale: resolveNull,
  DeleteParkedSale: resolveNull,
  // Customers
  GetCustomers: resolveNull,
  GetCustomer: resolveNull,
  CreateCustomer: resolveNull,
  UpdateCustomer: resolveNull,
  DeleteCustomer: resolveNull,
  // Stats
  GetDashboardStats: resolveNull,
  // Settings
  GetPreferences: resolveNull,
  UpdatePreferences: resolveNull,
  // Staff
  GetStaff: resolveNull,
  CreateStaff: resolveNull,
  UpdateStaff: resolveNull,
  DeleteStaff: resolveNull,
  // Finance
  GetExpenses: resolveNull,
  CreateExpense: resolveNull,
  // Misc
  Greet: () => '',
};

Object.defineProperty(window, 'go', {
  value: {
    handler: { App: MockApp },
    main: { App: MockApp },
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(window, 'runtime', {
  value: {
    EventsOn: noop,
    EventsOff: noop,
    EventsEmit: noop,
    WindowMinimise: noop,
    WindowMaximise: noop,
    WindowToggleMaximise: noop,
    Quit: noop,
  },
  writable: true,
  configurable: true,
});
