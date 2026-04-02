import {
  Product, PaginatedProducts,
  Sale, PaginatedSales,
  Customer, PaginatedCustomers,
  Expense, PaginatedExpenses,
  Staff, Payment,
  AppPreferences, DashboardStats,
  CartItem
} from './index';

declare global {
  interface Window {
    go: {
      main: {
        App: {
          GetDashboardStats: () => Promise<DashboardStats>;
          GetProducts: (page: number, limit: number, search: string, category: string) => Promise<PaginatedProducts>;
          GetProduct: (id: string) => Promise<Product>;
          GetProductByBarcode: (barcode: string) => Promise<Product>;
          CreateProduct: (product: Partial<Product>) => Promise<void>;
          UpdateProduct: (product: Partial<Product>) => Promise<void>;
          DeleteProduct: (id: string) => Promise<void>;
          GetCategories: () => Promise<string[]>;
          GetProductStats: () => Promise<{ totalProducts: number; lowStockCount: number; outOfStockCount: number; totalValue: number }>;
          SearchProducts: (query: string, limit: number) => Promise<Product[]>;
          GetSales: (page: number, limit: number, search: string, status: string) => Promise<PaginatedSales>;
          GetSale: (id: string) => Promise<Sale>;
          CreateSale: (sale: Partial<Sale>) => Promise<void>;
          ProcessReturn: (saleId: string) => Promise<Sale>;
          GetParkedSales: () => Promise<Sale[]>;
          ParkSale: (parked: Partial<Sale>) => Promise<void>;
          DeleteParkedSale: (id: number) => Promise<void>;
          GetRecentSales: (limit: number) => Promise<Sale[]>;
          CalculateInstallmentPlan: (total: number, downPayment: number, months: number) => Promise<{ amount: number; months: number; monthlyPayment: number }>;
          GetCustomers: (page: number, limit: number, search: string) => Promise<PaginatedCustomers>;
          GetCustomer: (id: string) => Promise<Customer>;
          CreateCustomer: (customer: Partial<Customer>) => Promise<void>;
          UpdateCustomer: (customer: Partial<Customer>) => Promise<void>;
          DeleteCustomer: (id: string) => Promise<void>;
          SearchCustomerByPhone: (phone: string) => Promise<Customer>;
          GetExpenses: (page: number, limit: number, category: string) => Promise<PaginatedExpenses>;
          CreateExpense: (expense: Partial<Expense>) => Promise<void>;
          UpdateExpense: (expense: Partial<Expense>) => Promise<void>;
          DeleteExpense: (id: string) => Promise<void>;
          CreatePayment: (payment: Partial<Payment>) => Promise<void>;
          GetPayments: (saleId: string) => Promise<Payment[]>;
          Login: (username: string, password: string) => Promise<Staff>;
          GetStaff: () => Promise<Staff[]>;
          CreateStaff: (staff: Partial<Staff>) => Promise<void>;
          UpdateStaff: (staff: Partial<Staff>) => Promise<void>;
          DeleteStaff: (id: string) => Promise<void>;
          GetPreferences: () => Promise<AppPreferences>;
          UpdatePreferences: (prefs: Partial<AppPreferences>) => Promise<void>;
          ResetDatabase: () => Promise<void>;
          ExportDatabase: () => Promise<string>;
          ImportDatabase: (data: string) => Promise<void>;
          Greet: (name: string) => Promise<string>;
        };
      };
    };
    runtime: {
      EventsOn: (event: string, callback: (data: unknown) => void) => void;
      EventsOff: (event: string) => void;
      WindowMinimise: () => void;
      WindowMaximise: () => void;
      WindowUnmaximise: () => void;
      Quit: () => void;
    };
  }
}

export {};
