// Shared types between frontend and backend
// These mirror the Go domain models

export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  emoji?: string;
  image?: string;
  supplier?: string;
  wholesalePrice: number;
  description?: string;
  customDetails?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  customer?: string;
  staffId?: string;
  staffName?: string;
  date: string;
  timestamp: number;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: string;
  status: string;
  itemsCount: number;
  items: SaleItem[];
  splitDetails?: Record<string, number>;
  installmentPlan?: InstallmentPlan;
  note?: string;
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  cost: number;
  discount: number;
  returnedQty: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  debt: number;
  installmentDebt: number;
  totalPurchases: number;
  lastVisit: string;
  points: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'cashier' | 'manager';
  phone?: string;
  isActive: boolean;
  pinCode?: string;
  status?: string;
  metrics?: {
    totalSalesCount: number;
    totalSalesAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  saleId: string;
  customerId: string;
  amount: number;
  method: string;
  note?: string;
  timestamp: number;
  staffId?: string;
  instIndex?: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  notes?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
	id: string;
	supplierId: string;
	supplierName: string;
	date: string;
	total: number;
	status: 'pending' | 'received' | 'cancelled';
	items: PurchaseOrderItem[];
	createdAt: string;
	updatedAt: string;
}

export interface PurchaseOrderItem {
	id: number;
	productId: string;
	name: string;
	qty: number;
	cost: number;
	total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
}

export interface AppPreferences {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  currency: string;
  taxRate: number;
  theme: 'dark' | 'light';
  accentColor: string;
  enableSound: boolean;
  language: string;
  lowStockTrigger: number;
  adminPin: string;
  fontSize: string;
  autoLockTime: number;
  quickSell: boolean;
  autoPrint: boolean;
  autoPrintFormat: string;
  thermalPaperSize: string;
  requireShift: boolean;
  receiptFooter?: string;
  showLogo?: boolean;
  showItems?: boolean;
  showBarcode?: boolean;
  showFooter?: boolean;
}

export interface InstallmentPlan {
  totalAmount: number;
  downPayment: number;
  months: number;
  startDate: string;
  schedule: Installment[];
}

export interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: number;
}

export interface ParkedSale {
  id: number;
  items_json: string;
  customer_name: string;
  customer_id: string;
  note: string;
  total: number;
  items_count: number;
  created_at: string;
}

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  monthSales: number;
  monthOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalDebt: number;
  lowStockCount: number;
  topProducts: TopProduct[];
  recentSales: Sale[];
}

export interface TopProduct {
  productId: string;
  name: string;
  totalQty: number;
  totalAmount: number;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  totalPages: number;
  page: number;
  stats: ProductStats;
}

export interface ProductStats {
  totalStock: number;
  totalValue: number;
  totalCost: number;
  profit: number;
}

export interface PaginatedSales {
  data: Sale[];
  total: number;
  totalPages: number;
  page: number;
  stats: InvoiceStats;
}

export interface InvoiceStats {
  count: number;
  total: number;
  pending: number;
  returns: number;
}

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minQty: number;
  isActive: boolean;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  startTime: number;
  endTime?: number;
  startCash: number;
  endCash?: number;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface CashMovement {
  id: number;
  shiftId: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  staffId: string;
  timestamp: number;
  createdAt: string;
}

export interface DatabaseExport {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  staff: Staff[];
  preferences: AppPreferences;
}

// UI Types
export type View = 'dashboard' | 'sales' | 'products' | 'customers' | 'finance' | 'invoices' | 'reports' | 'settings' | 'shifts' | 'inventory';

export type PaymentMethod = 'cash' | 'card' | 'credit' | 'installment' | 'split' | 'transfer';

export type SaleStatus = 'completed' | 'pending' | 'return' | 'cancelled';

export interface CartItem {
  product: Product;
  qty: number;
  discount: number;
  total: number;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type NotifyFunction = (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;

// Print Types
export interface ReceiptData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  receiptNo: string;
  date: string;
  cashier: string;
  customerName?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paidAmount?: number;
  change?: number;
  note?: string;
  footer?: string;
  barcode?: string;
}
