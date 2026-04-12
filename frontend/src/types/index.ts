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
export type BusinessMode = 'retail' | 'restaurant' | 'wholesale';

export type View = 'dashboard' | 'sales' | 'products' | 'customers' | 'finance' | 'operations' | 'reports' | 'settings';

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

export interface RestaurantTable {
  id: string;
  number: number;
  name?: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: string;
  assignedWaiter?: string;
  floor?: string;
  notes?: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  tables: RestaurantTable[];
}

// ── Feature 1: Loyalty & Rewards ──

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  pointsRate: number;
  discountPct: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyRule {
  id: string;
  name: string;
  pointsPerAmount: number;
  minPurchase: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: number;
  customerId: string;
  points: number;
  type: 'earn' | 'redeem';
  referenceId?: string;
  description: string;
  staffId?: string;
  timestamp: number;
  createdAt: string;
}

export interface LoyaltyRedemption {
  id: number;
  customerId: string;
  points: number;
  rewardType: string;
  rewardValue: number;
  saleId?: string;
  staffId?: string;
  timestamp: number;
  createdAt: string;
}

// ── Feature 2: Notifications ──

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  channel: string;
  subject?: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLog {
  id: number;
  templateId: string;
  recipient: string;
  channel: string;
  status: string;
  error?: string;
  sentAt: number;
  createdAt: string;
}

export interface NotificationSettings {
  whatsappApiKey?: string;
  whatsappPhone?: string;
  enableWhatsApp: boolean;
  enableSMS: boolean;
  lowStockAlert: boolean;
  dailySummary: boolean;
  paymentReminder: boolean;
}

// ── Feature 3: Multi-Store/Branch ──

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  staffId: string;
  staffName: string;
  note?: string;
  items: StockTransferItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StockTransferItem {
  id: number;
  productId: string;
  productName: string;
  qty: number;
}

// ── Feature 4: Product Kits ──

export interface ProductKit {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  items: ProductKitItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductKitItem {
  id: number;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
}

// ── Feature 5: Recurring Invoices ──

export interface RecurringInvoice {
  id: string;
  customerId: string;
  customerName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  items: RecurringInvoiceItem[];
  lastRunDate?: string;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringInvoiceItem {
  id: number;
  productId: string;
  name: string;
  price: number;
  qty: number;
  total: number;
}

// ── Feature 6: Analytics & AI Insights ──

export interface AnalyticsInsight {
  type: string;
  title: string;
  description: string;
  severity: string;
  value?: number;
  metric?: string;
  period?: string;
}

export interface SalesForecast {
  date: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface ProfitAnalysis {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  growth: number;
}

export interface DemandForecast {
  productId: string;
  productName: string;
  currentQty: number;
  predictedDemand: number;
  daysOfStock: number;
  reorderDate: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface AnomalyDetection {
  metric: string;
  date: string;
  expected: number;
  actual: number;
  deviation: number;
  isAnomaly: boolean;
  description: string;
}

export interface AnalyticsDashboard {
  insights: AnalyticsInsight[];
  forecasts: SalesForecast[];
  profits: ProfitAnalysis[];
  demands: DemandForecast[];
  anomalies: AnomalyDetection[];
}

// ── Feature 7: Gift Cards & Vouchers ──

export interface GiftCard {
  id: string;
  code: string;
  initialBalance: number;
  balance: number;
  customerId?: string;
  purchasedBy?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCardTransaction {
  id: number;
  giftCardId: string;
  amount: number;
  type: 'redeem' | 'topup';
  saleId?: string;
  staffId?: string;
  timestamp: number;
  createdAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Feature 8: Kitchen Display System ──

export interface KitchenOrder {
  id: string;
  saleId: string;
  tableNumber?: string;
  items: KitchenOrderItem[];
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  assignedTo?: string;
  startedAt?: string;
  completedAt?: string;
  elapsedMin: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KitchenOrderItem {
  id: number;
  productId: string;
  productName: string;
  qty: number;
  note?: string;
  status: 'pending' | 'preparing' | 'ready';
}

export interface KitchenStation {
  id: string;
  name: string;
  categories: string[];
  isActive: boolean;
}

// ── Feature 9: Customer Wallet & Credit ──

export interface CustomerWallet {
  id: string;
  customerId: string;
  balance: number;
  creditLimit: number;
  autoDebitEnabled: boolean;
  autoDebitDay?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: number;
  customerId: string;
  amount: number;
  type: 'topup' | 'debit';
  referenceId?: string;
  description: string;
  staffId?: string;
  timestamp: number;
  createdAt: string;
}

// ── Feature 10: Stock Adjustments & Waste ──

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'correction' | 'count' | 'transfer' | 'damage' | 'other';
  qtyBefore: number;
  qtyAfter: number;
  delta: number;
  reason: string;
  costImpact: number;
  staffId: string;
  staffName: string;
  note?: string;
  createdAt: string;
}

export interface WasteRecord {
  id: number;
  productId: string;
  productName: string;
  qty: number;
  wasteType: 'spoilage' | 'damage' | 'expired' | 'theft' | 'other';
  costLoss: number;
  reason: string;
  staffId: string;
  staffName: string;
  date: string;
  createdAt: string;
}

export interface StockVarianceReport {
  productId: string;
  productName: string;
  systemQty: number;
  physicalQty: number;
  variance: number;
  variancePct: number;
  costImpact: number;
}

// ── Feature 11: Multi-Currency ──

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  exchangeRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyTransaction {
  id: number;
  saleId?: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  appliedRate: number;
  staffId?: string;
  timestamp: number;
  createdAt: string;
}

// ── Feature 12: Messaging (WhatsApp/SMS) ──

export interface MessagingProvider {
  id: string;
  name: string;
  type: 'whatsapp' | 'sms' | 'telegram';
  apiKey?: string;
  apiSecret?: string;
  phone?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'receipt' | 'promotion' | 'reminder' | 'custom';
  content: string;
  variables?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageLog {
  id: number;
  providerId: string;
  recipient: string;
  templateId?: string;
  content: string;
  status: 'sent' | 'failed' | 'pending';
  errorMsg?: string;
  saleId?: string;
  customerId?: string;
  staffId?: string;
  timestamp: number;
  createdAt: string;
}

// ── Feature 13: Employee Performance & Commissions ──

export interface CommissionRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  targetType: 'all' | 'category' | 'product';
  targetId?: string;
  minAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionPayment {
  id: number;
  staffId: string;
  staffName: string;
  saleId?: string;
  ruleId: string;
  amount: number;
  baseAmount: number;
  periodStart: string;
  periodEnd: string;
  status: 'pending' | 'paid';
  paidAt?: string;
  createdAt: string;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  totalSales: number;
  salesCount: number;
  avgSaleValue: number;
  totalReturns: number;
  returnsCount: number;
  commission: number;
  periodStart: string;
  periodEnd: string;
}

// ── Feature 14: Customer Segmentation & Campaigns ──

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  rules: string;
  color: string;
  customerCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSegmentMember {
  id: number;
  segmentId: string;
  customerId: string;
  addedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: 'sms' | 'whatsapp' | 'email' | 'voucher';
  segmentId: string;
  discountId?: string;
  messageTmpl?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  targetCount: number;
  sentCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Feature 15: Tax Management ──

export interface TaxRate {
  id: string;
  name: string;
  code: string;
  rate: number;
  type: 'sales' | 'purchase' | 'withholding';
  isDefault: boolean;
  isCompound: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductTax {
  id: number;
  productId: string;
  taxRateId: string;
}

export interface TaxReport {
  taxRateId: string;
  taxName: string;
  taxCode: string;
  taxRate: number;
  totalSales: number;
  totalTax: number;
  totalReturns: number;
  returnTax: number;
  netTax: number;
  periodStart: string;
  periodEnd: string;
}

// ── Feature 16: Self-Service Kiosk ──

export interface KioskLayout {
  id: string;
  name: string;
  theme: 'light' | 'dark' | 'colorful';
  showImages: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  categories: string;
  welcomeMsg: string;
  acceptCash: boolean;
  acceptCard: boolean;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KioskSession {
  id: number;
  layoutId: string;
  saleId?: string;
  startedAt: string;
  endedAt?: string;
  totalAmount: number;
  status: 'active' | 'completed' | 'abandoned';
}

// ── Feature 17: Delivery Management ──

export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  vehicleNo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryOrder {
  id: string;
  saleId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  driverId?: string;
  driverName?: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  fee: number;
  estimatedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Feature 18: Inventory Auto-Reorder ──

export interface ReorderRule {
  id: string;
  productId: string;
  productName: string;
  supplierId?: string;
  reorderPoint: number;
  reorderQty: number;
  autoOrder: boolean;
  lastOrderedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReorderAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQty: number;
  supplierId?: string;
  supplierName?: string;
  daysUntilStockout: number;
}

// ── Feature 19: Expense Budget & Approval ──

export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  spentAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseApproval {
  id: number;
  expenseId: string;
  approverId: string;
  approverName: string;
  status: 'approved' | 'rejected' | 'pending';
  comment?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  requiredLevel: 'manager' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Feature 20: Custom Report Builder ──

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'financial' | 'custom';
  dataSource: string;
  columns: string;
  filters?: string;
  sortBy?: string;
  groupBy?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'table';
  isShared: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledExport {
  id: string;
  reportId: string;
  name: string;
  format: 'pdf' | 'csv' | 'excel';
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string;
  lastRunAt?: string;
  nextRunAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
