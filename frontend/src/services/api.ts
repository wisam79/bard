import type {
  Product,
  Sale,
  Customer,
  Staff,
  Expense,
  Payment,
  AppPreferences,
  DashboardStats,
  PaginatedProducts,
  PaginatedSales,
  ParkedSale,
  InstallmentPlan,
  Supplier,
  Shift,
  CashMovement,
  DatabaseExport,
} from '@/types';

declare global {
  interface Window {
    go: {
      main: {
        App: {
          GetDashboardStats(): Promise<DashboardStats>;
          GetProducts(page: number, limit: number, search: string, category: string): Promise<PaginatedProducts>;
          GetProduct(id: string): Promise<Product>;
          GetProductByBarcode(barcode: string): Promise<Product>;
          CreateProduct(product: Product): Promise<void>;
          UpdateProduct(product: Product): Promise<void>;
          DeleteProduct(id: string): Promise<void>;
          GetCategories(): Promise<string[]>;
          GetProductStats(): Promise<{ totalStock: number; totalValue: number; totalCost: number; profit: number }>;
          SearchProducts(query: string, limit: number): Promise<Product[]>;

          GetSales(page: number, limit: number, search: string, status: string): Promise<PaginatedSales>;
          GetSale(id: string): Promise<Sale>;
          CreateSale(sale: Sale): Promise<void>;
          ProcessReturn(saleID: string): Promise<Sale>;
          GetParkedSales(): Promise<ParkedSale[]>;
          ParkSale(parked: ParkedSale): Promise<void>;
          DeleteParkedSale(id: number): Promise<void>;
          GetRecentSales(limit: number): Promise<Sale[]>;
          CalculateInstallmentPlan(total: number, downPayment: number, months: number): Promise<InstallmentPlan>;

          GetCustomers(page: number, limit: number, search: string): Promise<[Customer[], number]>;
          GetCustomer(id: string): Promise<Customer>;
          CreateCustomer(customer: Customer): Promise<void>;
          UpdateCustomer(customer: Customer): Promise<void>;
          DeleteCustomer(id: string): Promise<void>;
          SearchCustomerByPhone(phone: string): Promise<Customer>;

          GetExpenses(page: number, limit: number, category: string): Promise<[Expense[], number]>;
          CreateExpense(expense: Expense): Promise<void>;
          UpdateExpense(expense: Expense): Promise<void>;
          DeleteExpense(id: string): Promise<void>;
          CreatePayment(payment: Payment): Promise<void>;
          GetPayments(saleID: string): Promise<Payment[]>;

          Login(username: string, password: string): Promise<Staff | null>;
          GetStaff(): Promise<Staff[]>;
          CreateStaff(staff: Staff): Promise<void>;
          UpdateStaff(staff: Staff): Promise<void>;
          DeleteStaff(id: string): Promise<void>;

          GetPreferences(): Promise<AppPreferences>;
          UpdatePreferences(prefs: AppPreferences): Promise<void>;
          ResetDatabase(): Promise<void>;
          ExportDatabase(): Promise<DatabaseExport>;
          ImportDatabase(data: DatabaseExport): Promise<void>;

          Minimize(): void;
          Maximize(): void;
          Close(): void;

          GetSuppliers(): Promise<Supplier[]>;
          GetSupplier(id: string): Promise<Supplier>;
          CreateSupplier(supplier: Supplier): Promise<void>;
          UpdateSupplier(supplier: Supplier): Promise<void>;
          DeleteSupplier(id: string): Promise<void>;

          GetShifts(page: number, limit: number): Promise<[Shift[], number]>;
          GetActiveShift(staffID: string): Promise<Shift | null>;
          StartShift(shift: Shift): Promise<void>;
          CloseShift(shift: Shift): Promise<void>;
          AddCashMovement(movement: CashMovement): Promise<void>;
          GetCashMovements(shiftID: string): Promise<CashMovement[]>;

          Greet(name: string): string;
        };
      };
    };
  }
}

export {};
