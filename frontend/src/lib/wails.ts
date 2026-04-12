import {
  AddCashMovement as AddCashMovementBinding,
  CalculateInstallmentPlan as CalculateInstallmentPlanBinding,
  CloseShift as CloseShiftBinding,
  CreateCustomer as CreateCustomerBinding,
  CreateExpense as CreateExpenseBinding,
  CreatePayment as CreatePaymentBinding,
  CreateProduct as CreateProductBinding,
  CreatePurchaseOrder as CreatePurchaseOrderBinding,
  CreateSale as CreateSaleBinding,
  CreateStaff as CreateStaffBinding,
  CreateSupplier as CreateSupplierBinding,
  DeleteCustomer as DeleteCustomerBinding,
  DeleteExpense as DeleteExpenseBinding,
  DeleteParkedSale as DeleteParkedSaleBinding,
  DeleteProduct as DeleteProductBinding,
  DeletePurchaseOrder as DeletePurchaseOrderBinding,
  DeleteStaff as DeleteStaffBinding,
  DeleteSupplier as DeleteSupplierBinding,
  ExportDatabase as ExportDatabaseBinding,
  GetActiveShift as GetActiveShiftBinding,
  GetCashMovements as GetCashMovementsBinding,
  GetCategories as GetCategoriesBinding,
  GetCustomer as GetCustomerBinding,
  GetCustomers as GetCustomersBinding,
  GetDashboardStats as GetDashboardStatsBinding,
  GetExpenses as GetExpensesBinding,
  GetParkedSales as GetParkedSalesBinding,
  GetPayments as GetPaymentsBinding,
  GetPreferences as GetPreferencesBinding,
  GetProduct as GetProductBinding,
  GetProductByBarcode as GetProductByBarcodeBinding,
  GetProductStats as GetProductStatsBinding,
  GetProducts as GetProductsBinding,
  GetPurchaseOrder as GetPurchaseOrderBinding,
  GetPurchaseOrders as GetPurchaseOrdersBinding,
  GetRecentSales as GetRecentSalesBinding,
  GetSale as GetSaleBinding,
  GetSales as GetSalesBinding,
  GetStaff as GetStaffBinding,
  GetSupplier as GetSupplierBinding,
  GetSuppliers as GetSuppliersBinding,
  ImportDatabase as ImportDatabaseBinding,
  Login as LoginBinding,
  ParkSale as ParkSaleBinding,
  ProcessReturn as ProcessReturnBinding,
  ReceivePurchaseOrder as ReceivePurchaseOrderBinding,
  ResetDatabase as ResetDatabaseBinding,
  SearchCustomerByPhone as SearchCustomerByPhoneBinding,
  SearchProducts as SearchProductsBinding,
  StartShift as StartShiftBinding,
  UpdateCustomer as UpdateCustomerBinding,
  UpdateExpense as UpdateExpenseBinding,
  UpdatePreferences as UpdatePreferencesBinding,
  UpdateProduct as UpdateProductBinding,
  UpdatePurchaseOrder as UpdatePurchaseOrderBinding,
  UpdateStaff as UpdateStaffBinding,
  UpdateSupplier as UpdateSupplierBinding,
} from '../../wailsjs/go/handler/App';
import {
  Quit,
  WindowMinimise,
  WindowToggleMaximise,
} from '../../wailsjs/runtime/runtime';
import type {
  AppPreferences,
  CashMovement,
  Customer,
  DashboardStats,
  DatabaseExport,
  Expense,
  InstallmentPlan,
  PaginatedProducts,
  PaginatedResponse,
  PaginatedSales,
  ParkedSale,
  Payment,
  Product,
  ProductStats,
  PurchaseOrder,
  Sale,
  Shift,
  Staff,
  Supplier,
} from '@/types';

export const _wailsApp = {
  AddCashMovement: AddCashMovementBinding,
  CalculateInstallmentPlan:
    CalculateInstallmentPlanBinding as unknown as (
      total: number,
      downPayment: number,
      months: number,
    ) => Promise<InstallmentPlan>,
  CloseShift: CloseShiftBinding as unknown as (
    shiftID: string,
    endCash: number,
  ) => Promise<Shift>,
  CreateCustomer: CreateCustomerBinding as unknown as (
    customer: Customer,
  ) => Promise<void>,
  CreateExpense: CreateExpenseBinding as unknown as (
    expense: Expense,
  ) => Promise<void>,
  CreatePayment: CreatePaymentBinding as unknown as (
    payment: Payment,
  ) => Promise<void>,
  CreateProduct: CreateProductBinding as unknown as (
    product: Product,
  ) => Promise<void>,
  CreatePurchaseOrder: CreatePurchaseOrderBinding as unknown as (
    order: PurchaseOrder,
  ) => Promise<void>,
  CreateSale: CreateSaleBinding as unknown as (sale: Sale) => Promise<void>,
  CreateStaff: CreateStaffBinding as unknown as (staff: Staff) => Promise<void>,
  CreateSupplier: CreateSupplierBinding as unknown as (
    supplier: Supplier,
  ) => Promise<void>,
  DeleteCustomer: DeleteCustomerBinding,
  DeleteExpense: DeleteExpenseBinding,
  DeleteParkedSale: DeleteParkedSaleBinding,
  DeleteProduct: DeleteProductBinding,
  DeletePurchaseOrder: DeletePurchaseOrderBinding,
  DeleteStaff: DeleteStaffBinding,
  DeleteSupplier: DeleteSupplierBinding,
  ExportDatabase: ExportDatabaseBinding as unknown as () => Promise<DatabaseExport>,
  GetActiveShift: GetActiveShiftBinding as unknown as (
    staffID: string,
  ) => Promise<Shift | null>,
  GetCashMovements: GetCashMovementsBinding as unknown as (
    shiftID: string,
  ) => Promise<CashMovement[]>,
  GetCategories: GetCategoriesBinding,
  GetCustomer: GetCustomerBinding as unknown as (id: string) => Promise<Customer>,
  GetCustomers: GetCustomersBinding as unknown as (
    page: number,
    limit: number,
    search: string,
  ) => Promise<[Customer[], number]>,
  GetDashboardStats: GetDashboardStatsBinding as unknown as () => Promise<DashboardStats>,
  GetExpenses: GetExpensesBinding as unknown as (
    page: number,
    limit: number,
    category: string,
  ) => Promise<[Expense[], number]>,
  GetParkedSales: GetParkedSalesBinding as unknown as () => Promise<ParkedSale[]>,
  GetPayments: GetPaymentsBinding as unknown as (
    saleID: string,
  ) => Promise<Payment[]>,
  GetPreferences: GetPreferencesBinding as unknown as () => Promise<AppPreferences>,
  GetProduct: GetProductBinding as unknown as (id: string) => Promise<Product>,
  GetProductByBarcode: GetProductByBarcodeBinding as unknown as (
    barcode: string,
  ) => Promise<Product>,
  GetProductStats: GetProductStatsBinding as unknown as () => Promise<ProductStats>,
  GetProducts: GetProductsBinding as unknown as (
    page: number,
    limit: number,
    search: string,
    category: string,
  ) => Promise<PaginatedProducts>,
  GetPurchaseOrder: GetPurchaseOrderBinding as unknown as (
    id: string,
  ) => Promise<PurchaseOrder>,
  GetPurchaseOrders: GetPurchaseOrdersBinding as unknown as (
    page: number,
    limit: number,
    status: string,
  ) => Promise<PaginatedResponse<PurchaseOrder>>,
  GetRecentSales: GetRecentSalesBinding as unknown as (
    limit: number,
  ) => Promise<Sale[]>,
  GetSale: GetSaleBinding as unknown as (id: string) => Promise<Sale>,
  GetSales: GetSalesBinding as unknown as (
    page: number,
    limit: number,
    search: string,
    status: string,
  ) => Promise<PaginatedSales>,
  GetStaff: GetStaffBinding as unknown as () => Promise<Staff[]>,
  GetSupplier: GetSupplierBinding as unknown as (
    id: string,
  ) => Promise<Supplier>,
  GetSuppliers: GetSuppliersBinding as unknown as () => Promise<Supplier[]>,
  ImportDatabase: ImportDatabaseBinding as unknown as (
    data: DatabaseExport,
  ) => Promise<void>,
  Login: LoginBinding as unknown as (
    username: string,
    password: string,
  ) => Promise<Staff | null>,
  ParkSale: ParkSaleBinding as unknown as (sale: ParkedSale) => Promise<void>,
  ProcessReturn: ProcessReturnBinding as unknown as (
    saleID: string,
  ) => Promise<Sale>,
  ReceivePurchaseOrder: ReceivePurchaseOrderBinding,
  ResetDatabase: ResetDatabaseBinding,
  SearchCustomerByPhone: SearchCustomerByPhoneBinding as unknown as (
    phone: string,
  ) => Promise<Customer>,
  SearchProducts: SearchProductsBinding as unknown as (
    query: string,
    limit: number,
  ) => Promise<Product[]>,
  StartShift: StartShiftBinding as unknown as (
    staffID: string,
    staffName: string,
    startCash: number,
  ) => Promise<Shift>,
  UpdateCustomer: UpdateCustomerBinding as unknown as (
    customer: Customer,
  ) => Promise<void>,
  UpdateExpense: UpdateExpenseBinding as unknown as (
    expense: Expense,
  ) => Promise<void>,
  UpdatePreferences: UpdatePreferencesBinding as unknown as (
    prefs: AppPreferences,
  ) => Promise<void>,
  UpdateProduct: UpdateProductBinding as unknown as (
    product: Product,
  ) => Promise<void>,
  UpdatePurchaseOrder: UpdatePurchaseOrderBinding as unknown as (
    order: PurchaseOrder,
  ) => Promise<void>,
  UpdateStaff: UpdateStaffBinding as unknown as (staff: Staff) => Promise<void>,
  UpdateSupplier: UpdateSupplierBinding as unknown as (
    supplier: Supplier,
  ) => Promise<void>,
};

export const wailsApp: Record<string, any> = _wailsApp;

export const wailsWindow = {
  minimise: WindowMinimise,
  toggleMaximise: WindowToggleMaximise,
  quit: Quit,
};
