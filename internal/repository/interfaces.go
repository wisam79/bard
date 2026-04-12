package repository

import "bard/internal/domain"

// PartialReturnItem specifies which item and how much to return
type PartialReturnItem struct {
	ProductID string
	Qty       float64
}

// ProductRepository defines the interface for product data operations
type ProductRepository interface {
	GetAll(page, limit int, search, category string) (*domain.PaginatedProducts, error)
	GetByID(id string) (*domain.Product, error)
	GetByBarcode(barcode string) (*domain.Product, error)
	Create(product *domain.Product) error
	Update(product *domain.Product) error
	Delete(id string) error
	GetCategories() ([]string, error)
	CreateCategory(cat *domain.Category) error
	GetStats() (*domain.ProductStats, error)
	GetLowStock(threshold int) ([]domain.Product, error)
	Search(query string, limit int) ([]domain.Product, error)
}

// SaleRepository defines the interface for sale data operations
type SaleRepository interface {
	GetAll(page, limit int, search, status string) (*domain.PaginatedSales, error)
	GetByID(id string) (*domain.Sale, error)
	Create(sale *domain.Sale) error
	CreateSaleWithStockUpdate(sale *domain.Sale) error
	Update(sale *domain.Sale) error
	GetByCustomerID(customerID string, page, limit int) (*domain.PaginatedSales, error)
	GetByDateRange(startDate, endDate string) ([]domain.Sale, error)
	GetRecent(limit int) ([]domain.Sale, error)
	GetStats(startDate, endDate string) (*domain.InvoiceStats, error)
	CreateParkedSale(parked *domain.ParkedSale) error
	GetParkedSales() ([]domain.ParkedSale, error)
	DeleteParkedSale(id uint) error
	GetTopProducts(limit int, startDate, endDate string) ([]domain.TopProduct, error)
	ProcessReturnWithStockUpdate(originalSaleID string) (*domain.Sale, error)
	ProcessPartialReturnWithStockUpdate(originalSaleID string, returnItems []PartialReturnItem) (*domain.Sale, error)
}

// CustomerRepository defines the interface for customer data operations
type CustomerRepository interface {
	GetAll(page, limit int, search string) ([]domain.Customer, int64, error)
	GetByID(id string) (*domain.Customer, error)
	GetByPhone(phone string) (*domain.Customer, error)
	Create(customer *domain.Customer) error
	Update(customer *domain.Customer) error
	UpdateFields(id string, fields map[string]interface{}) error
	Delete(id string) error
	UpdateDebt(id string, amount float64) error
	UpdateInstallmentDebt(id string, amount float64) error
	GetTop(limit int) ([]domain.Customer, error)
}

// StaffRepository defines the interface for staff data operations
type StaffRepository interface {
	GetAll() ([]domain.Staff, error)
	GetByID(id string) (*domain.Staff, error)
	GetByUsername(username string) (*domain.Staff, error)
	Create(staff *domain.Staff) error
	Update(staff *domain.Staff) error
	Delete(id string) error
	Authenticate(username, password string) (*domain.Staff, error)
	UpdatePassword(id, hashedPassword string) error
	UpdateFields(id string, fields map[string]interface{}) error
}

// FinanceRepository defines the interface for finance data operations
type FinanceRepository interface {
	GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error)
	CreateExpense(expense *domain.Expense) error
	UpdateExpense(expense *domain.Expense) error
	DeleteExpense(id string) error
	GetExpenseCategories() ([]string, error)
	GetDiscounts() ([]domain.Discount, error)
	CreateDiscount(discount *domain.Discount) error
	UpdateDiscount(discount *domain.Discount) error
	DeleteDiscount(id string) error
	GetPayments(saleID string) ([]domain.Payment, error)
	CreatePayment(payment *domain.Payment) error
	GetPaymentsByCustomerID(customerID string) ([]domain.Payment, error)
}

// SettingsRepository defines the interface for settings operations
type SettingsRepository interface {
	GetPreferences() (*domain.AppPreferences, error)
	UpdatePreferences(prefs *domain.AppPreferences) error
	ResetDatabase() error
	ExportDatabase() (*domain.DatabaseExport, error)
	ImportDatabase(data *domain.DatabaseExport) error
}

// ShiftRepository defines the interface for shift operations
type ShiftRepository interface {
	Create(shift *domain.Shift) error
	GetActive(staffID string) (*domain.Shift, error)
	Close(shift *domain.Shift) error
	GetAll(page, limit int) ([]domain.Shift, int64, error)
	AddCashMovement(movement *domain.CashMovement) error
	GetCashMovements(shiftID string) ([]domain.CashMovement, error)
}

// SupplierRepository defines the interface for supplier operations
type SupplierRepository interface {
	GetAll() ([]domain.Supplier, error)
	GetByID(id string) (*domain.Supplier, error)
	Create(supplier *domain.Supplier) error
	Update(supplier *domain.Supplier) error
	Delete(id string) error
}

// PurchaseOrderRepository defines the interface for purchase orders
type PurchaseOrderRepository interface {
	GetAll(page, limit int, status string) ([]domain.PurchaseOrder, int64, error)
	GetByID(id string) (*domain.PurchaseOrder, error)
	Create(order *domain.PurchaseOrder) error
	CreateWithStockUpdate(order *domain.PurchaseOrder) error
	Update(order *domain.PurchaseOrder) error
	Delete(id string) error
	UpdateStatus(id string, status string) error
	ReceiveWithStockUpdate(id string) error
}

// StatsRepository defines the interface for statistics operations
type StatsRepository interface {
	GetDashboardStats() (*domain.DashboardStats, error)
}

// LoyaltyRepository defines the interface for loyalty operations
type LoyaltyRepository interface {
	GetTiers() ([]domain.LoyaltyTier, error)
	CreateTier(tier *domain.LoyaltyTier) error
	UpdateTier(tier *domain.LoyaltyTier) error
	DeleteTier(id string) error
	GetRules() ([]domain.LoyaltyRule, error)
	CreateRule(rule *domain.LoyaltyRule) error
	UpdateRule(rule *domain.LoyaltyRule) error
	GetActiveRule() (*domain.LoyaltyRule, error)
	CreateTransaction(tx *domain.LoyaltyTransaction) error
	GetTransactionsByCustomer(customerID string) ([]domain.LoyaltyTransaction, error)
	CreateRedemption(redemption *domain.LoyaltyRedemption) error
	GetRedemptionsByCustomer(customerID string) ([]domain.LoyaltyRedemption, error)
}

// NotificationRepository defines the interface for notification operations
type NotificationRepository interface {
	GetTemplates() ([]domain.NotificationTemplate, error)
	CreateTemplate(t *domain.NotificationTemplate) error
	UpdateTemplate(t *domain.NotificationTemplate) error
	DeleteTemplate(id string) error
	GetSettings() (*domain.NotificationSettings, error)
	UpdateSettings(s *domain.NotificationSettings) error
	CreateLog(log *domain.NotificationLog) error
	GetLogs(page, limit int) ([]domain.NotificationLog, int64, error)
}

// BranchRepository defines the interface for branch operations
type BranchRepository interface {
	GetAll() ([]domain.Branch, error)
	GetByID(id string) (*domain.Branch, error)
	Create(branch *domain.Branch) error
	Update(branch *domain.Branch) error
	Delete(id string) error
	CreateStockTransfer(transfer *domain.StockTransfer) error
	GetStockTransfers(page, limit int, status string) ([]domain.StockTransfer, int64, error)
	GetStockTransferByID(id string) (*domain.StockTransfer, error)
	UpdateStockTransferStatus(id, status string) error
}

// KitRepository defines the interface for product kit operations
type KitRepository interface {
	GetAll() ([]domain.ProductKit, error)
	GetByID(id string) (*domain.ProductKit, error)
	Create(kit *domain.ProductKit) error
	Update(kit *domain.ProductKit) error
	Delete(id string) error
}

// RecurringInvoiceRepository defines the interface for recurring invoice operations
type RecurringInvoiceRepository interface {
	GetAll(page, limit int, status string) ([]domain.RecurringInvoice, int64, error)
	GetByID(id string) (*domain.RecurringInvoice, error)
	Create(invoice *domain.RecurringInvoice) error
	Update(invoice *domain.RecurringInvoice) error
	Delete(id string) error
	GetDueInvoices() ([]domain.RecurringInvoice, error)
	MarkRun(id string, saleID string) error
}

// GiftCardRepository defines the interface for gift card operations
type GiftCardRepository interface {
	GetAll(page, limit int) ([]domain.GiftCard, int64, error)
	GetByID(id string) (*domain.GiftCard, error)
	GetByCode(code string) (*domain.GiftCard, error)
	Create(card *domain.GiftCard) error
	Update(card *domain.GiftCard) error
	Delete(id string) error
	CreateTransaction(tx *domain.GiftCardTransaction) error
	GetTransactions(cardID string) ([]domain.GiftCardTransaction, error)
	GetVouchers() ([]domain.Voucher, error)
	GetVoucherByCode(code string) (*domain.Voucher, error)
	CreateVoucher(v *domain.Voucher) error
	UpdateVoucher(v *domain.Voucher) error
	DeleteVoucher(id string) error
	IncrementVoucherUsage(id string) error
}

// KitchenRepository defines the interface for kitchen display operations
type KitchenRepository interface {
	GetPendingOrders() ([]domain.KitchenOrder, error)
	GetOrderByID(id string) (*domain.KitchenOrder, error)
	GetOrderBySaleID(saleID string) (*domain.KitchenOrder, error)
	CreateOrder(order *domain.KitchenOrder) error
	UpdateOrder(order *domain.KitchenOrder) error
	UpdateOrderItemStatus(orderID string, itemID uint, status string) error
	GetStations() ([]domain.KitchenStation, error)
	CreateStation(station *domain.KitchenStation) error
	UpdateStation(station *domain.KitchenStation) error
	DeleteStation(id string) error
}

// WalletRepository defines the interface for customer wallet operations
type WalletRepository interface {
	GetByCustomerID(customerID string) (*domain.CustomerWallet, error)
	Create(wallet *domain.CustomerWallet) error
	Update(wallet *domain.CustomerWallet) error
	CreateTransaction(tx *domain.WalletTransaction) error
	GetTransactions(customerID string, page, limit int) ([]domain.WalletTransaction, int64, error)
}

// StockAdjustmentRepository defines the interface for stock adjustment operations
type StockAdjustmentRepository interface {
	CreateAdjustment(adj *domain.StockAdjustment) error
	GetAdjustments(page, limit int, adjType string) ([]domain.StockAdjustment, int64, error)
	CreateWasteRecord(record *domain.WasteRecord) error
	GetWasteRecords(page, limit int, wasteType string) ([]domain.WasteRecord, int64, error)
	GetWasteSummary(startDate, endDate string) ([]domain.WasteRecord, error)
}

// CurrencyRepository defines the interface for multi-currency operations
type CurrencyRepository interface {
	GetAll() ([]domain.Currency, error)
	GetByID(id string) (*domain.Currency, error)
	GetByCode(code string) (*domain.Currency, error)
	Create(currency *domain.Currency) error
	Update(currency *domain.Currency) error
	Delete(id string) error
	CreateTransaction(tx *domain.CurrencyTransaction) error
	GetTransactions(saleID string) ([]domain.CurrencyTransaction, error)
	GetBaseCurrency() (*domain.Currency, error)
}

// MessagingRepository defines the interface for messaging/WhatsApp/SMS operations
type MessagingRepository interface {
	GetProviders() ([]domain.MessagingProvider, error)
	GetProviderByID(id string) (*domain.MessagingProvider, error)
	CreateProvider(p *domain.MessagingProvider) error
	UpdateProvider(p *domain.MessagingProvider) error
	DeleteProvider(id string) error
	GetTemplates() ([]domain.MessageTemplate, error)
	CreateTemplate(t *domain.MessageTemplate) error
	UpdateTemplate(t *domain.MessageTemplate) error
	DeleteTemplate(id string) error
	CreateLog(log *domain.MessageLog) error
	GetLogs(page, limit int) ([]domain.MessageLog, int64, error)
}

// CommissionRepository defines the interface for commission/performance operations
type CommissionRepository interface {
	GetRules() ([]domain.CommissionRule, error)
	GetRuleByID(id string) (*domain.CommissionRule, error)
	CreateRule(rule *domain.CommissionRule) error
	UpdateRule(rule *domain.CommissionRule) error
	DeleteRule(id string) error
	CreatePayment(payment *domain.CommissionPayment) error
	GetPaymentsByStaff(staffID string) ([]domain.CommissionPayment, error)
	GetPaymentsByPeriod(periodStart, periodEnd string) ([]domain.CommissionPayment, error)
	UpdatePaymentStatus(id uint, status string) error
}

// SegmentRepository defines the interface for customer segmentation/campaigns
type SegmentRepository interface {
	GetSegments() ([]domain.CustomerSegment, error)
	GetSegmentByID(id string) (*domain.CustomerSegment, error)
	CreateSegment(seg *domain.CustomerSegment) error
	UpdateSegment(seg *domain.CustomerSegment) error
	DeleteSegment(id string) error
	AddMember(member *domain.CustomerSegmentMember) error
	RemoveMember(segmentID, customerID string) error
	GetSegmentMembers(segmentID string) ([]domain.CustomerSegmentMember, error)
	GetCampaigns() ([]domain.Campaign, error)
	GetCampaignByID(id string) (*domain.Campaign, error)
	CreateCampaign(c *domain.Campaign) error
	UpdateCampaign(c *domain.Campaign) error
	DeleteCampaign(id string) error
}

// TaxRepository defines the interface for tax management operations
type TaxRepository interface {
	GetTaxRates() ([]domain.TaxRate, error)
	GetTaxRateByID(id string) (*domain.TaxRate, error)
	GetTaxRateByCode(code string) (*domain.TaxRate, error)
	CreateTaxRate(rate *domain.TaxRate) error
	UpdateTaxRate(rate *domain.TaxRate) error
	DeleteTaxRate(id string) error
	CreateProductTax(pt *domain.ProductTax) error
	DeleteProductTax(productID, taxRateID string) error
	GetProductTaxes(productID string) ([]domain.ProductTax, error)
	GetDefaultTaxRate() (*domain.TaxRate, error)
}

// KioskRepository defines the interface for self-service kiosk operations
type KioskRepository interface {
	GetLayouts() ([]domain.KioskLayout, error)
	GetLayoutByID(id string) (*domain.KioskLayout, error)
	CreateLayout(layout *domain.KioskLayout) error
	UpdateLayout(layout *domain.KioskLayout) error
	DeleteLayout(id string) error
	CreateSession(session *domain.KioskSession) error
	UpdateSession(session *domain.KioskSession) error
	GetActiveSessions() ([]domain.KioskSession, error)
}

// DeliveryRepository defines the interface for delivery management operations
type DeliveryRepository interface {
	GetDrivers() ([]domain.DeliveryDriver, error)
	GetDriverByID(id string) (*domain.DeliveryDriver, error)
	CreateDriver(driver *domain.DeliveryDriver) error
	UpdateDriver(driver *domain.DeliveryDriver) error
	DeleteDriver(id string) error
	GetOrders(page, limit int, status string) ([]domain.DeliveryOrder, int64, error)
	GetOrderByID(id string) (*domain.DeliveryOrder, error)
	GetOrderBySaleID(saleID string) (*domain.DeliveryOrder, error)
	CreateOrder(order *domain.DeliveryOrder) error
	UpdateOrder(order *domain.DeliveryOrder) error
}

// ReorderRepository defines the interface for auto-reorder operations
type ReorderRepository interface {
	GetRules() ([]domain.ReorderRule, error)
	GetRuleByID(id string) (*domain.ReorderRule, error)
	GetRuleByProductID(productID string) (*domain.ReorderRule, error)
	CreateRule(rule *domain.ReorderRule) error
	UpdateRule(rule *domain.ReorderRule) error
	DeleteRule(id string) error
	GetAlerts() ([]domain.ReorderAlert, error)
}

// BudgetRepository defines the interface for budget/approval operations
type BudgetRepository interface {
	GetBudgets() ([]domain.Budget, error)
	GetBudgetByID(id string) (*domain.Budget, error)
	CreateBudget(budget *domain.Budget) error
	UpdateBudget(budget *domain.Budget) error
	DeleteBudget(id string) error
	CreateExpenseApproval(approval *domain.ExpenseApproval) error
	GetExpenseApprovals(expenseID string) ([]domain.ExpenseApproval, error)
	GetApprovalWorkflows() ([]domain.ApprovalWorkflow, error)
	CreateApprovalWorkflow(wf *domain.ApprovalWorkflow) error
	UpdateApprovalWorkflow(wf *domain.ApprovalWorkflow) error
	DeleteApprovalWorkflow(id string) error
	GetSpentForBudget(budgetID string) (float64, error)
}

// ReportBuilderRepository defines the interface for custom report builder operations
type ReportBuilderRepository interface {
	GetTemplates() ([]domain.ReportTemplate, error)
	GetTemplateByID(id string) (*domain.ReportTemplate, error)
	CreateTemplate(t *domain.ReportTemplate) error
	UpdateTemplate(t *domain.ReportTemplate) error
	DeleteTemplate(id string) error
	GetScheduledExports() ([]domain.ScheduledExport, error)
	CreateScheduledExport(e *domain.ScheduledExport) error
	UpdateScheduledExport(e *domain.ScheduledExport) error
	DeleteScheduledExport(id string) error
	GetDueExports() ([]domain.ScheduledExport, error)
}
