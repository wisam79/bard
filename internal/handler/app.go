package handler

import (
	"bard/internal/audit"
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/middleware"
	"bard/internal/service"
	"context"
	"fmt"
)

type App struct {
	ctx             context.Context
	products        *service.ProductService
	sales           *service.SaleService
	customers       *service.CustomerService
	staff           *service.StaffService
	finance         *service.FinanceService
	settings        *service.SettingsService
	stats           *service.StatsService
	shifts          *service.ShiftService
	suppliers       *service.SupplierService
	purchaseOrders  *service.PurchaseOrderService
	authMiddleware  *middleware.AuthMiddleware
	rateLimiter     *middleware.RateLimiter
	audit           *audit.AuditService
	log             *logger.Logger
	loyalty         *service.LoyaltyService
	notification    *service.NotificationService
	branch          *service.BranchService
	kit             *service.KitService
	recurring       *service.RecurringInvoiceService
	analytics       *service.AnalyticsService
	giftCard        *service.GiftCardService
	kitchen         *service.KitchenService
	wallet          *service.WalletService
	stockAdjustment *service.StockAdjustmentService
	currency        *service.CurrencyService
	messaging       *service.MessagingService
	commission      *service.CommissionService
	campaign        *service.CampaignService
	tax             *service.TaxService
	kiosk           *service.KioskService
	delivery        *service.DeliveryService
	reorder         *service.ReorderService
	budget          *service.BudgetService
	reportBuilder   *service.ReportBuilderService
}

func NewApp(
	products *service.ProductService,
	sales *service.SaleService,
	customers *service.CustomerService,
	staff *service.StaffService,
	finance *service.FinanceService,
	settings *service.SettingsService,
	stats *service.StatsService,
	shifts *service.ShiftService,
	suppliers *service.SupplierService,
	purchaseOrders *service.PurchaseOrderService,
	authMiddleware *middleware.AuthMiddleware,
	rateLimiter *middleware.RateLimiter,
	audit *audit.AuditService,
	log *logger.Logger,
	loyalty *service.LoyaltyService,
	notification *service.NotificationService,
	branch *service.BranchService,
	kit *service.KitService,
	recurring *service.RecurringInvoiceService,
	analytics *service.AnalyticsService,
	giftCard *service.GiftCardService,
	kitchen *service.KitchenService,
	wallet *service.WalletService,
	stockAdjustment *service.StockAdjustmentService,
	currency *service.CurrencyService,
	messaging *service.MessagingService,
	commission *service.CommissionService,
	campaign *service.CampaignService,
	tax *service.TaxService,
	kiosk *service.KioskService,
	delivery *service.DeliveryService,
	reorder *service.ReorderService,
	budget *service.BudgetService,
	reportBuilder *service.ReportBuilderService,
) *App {
	return &App{
		products:        products,
		sales:           sales,
		customers:       customers,
		staff:           staff,
		finance:         finance,
		settings:        settings,
		stats:           stats,
		shifts:          shifts,
		suppliers:       suppliers,
		purchaseOrders:  purchaseOrders,
		authMiddleware:  authMiddleware,
		rateLimiter:     rateLimiter,
		audit:           audit,
		log:             log,
		loyalty:         loyalty,
		notification:    notification,
		branch:          branch,
		kit:             kit,
		recurring:       recurring,
		analytics:       analytics,
		giftCard:        giftCard,
		kitchen:         kitchen,
		wallet:          wallet,
		stockAdjustment: stockAdjustment,
		currency:        currency,
		messaging:       messaging,
		commission:      commission,
		campaign:        campaign,
		tax:             tax,
		kiosk:           kiosk,
		delivery:        delivery,
		reorder:         reorder,
		budget:          budget,
		reportBuilder:   reportBuilder,
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.log.Info("Application started")
}

func (a *App) checkPermission(token, permission string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "UNAUTHORIZED",
			Message: "لم يتم تسجيل الدخول",
		}
	}
	if !middleware.RequirePermission(staff, permission) {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "FORBIDDEN",
			Message: fmt.Sprintf("صلاحية مطلوبة: %s", permission),
		}
	}
	return nil
}

func (a *App) requireAdmin(token string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "UNAUTHORIZED",
			Message: "لم يتم تسجيل الدخول",
		}
	}
	if staff.Role != "admin" {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "FORBIDDEN",
			Message: "هذه العملية تتطلب صلاحيات المدير",
		}
	}
	return nil
}

func (a *App) GetDashboardStats() (*domain.DashboardStats, error) {
	return a.stats.GetDashboardStats()
}

func (a *App) GetProducts(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
	return a.products.GetAll(page, limit, search, category)
}

func (a *App) GetProduct(id string) (*domain.Product, error) {
	return a.products.GetByID(id)
}

func (a *App) GetProductByBarcode(barcode string) (*domain.Product, error) {
	return a.products.GetByBarcode(barcode)
}

func (a *App) CreateProduct(token string, product domain.Product) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.products.Create(&product)
}

func (a *App) UpdateProduct(token string, product domain.Product) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.products.Update(&product)
}

func (a *App) DeleteProduct(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
		return err
	}
	a.log.Info("Product deleted", "id", id)
	return a.products.Delete(id)
}

func (a *App) GetCategories() ([]string, error) {
	return a.products.GetCategories()
}

func (a *App) GetProductStats() (*domain.ProductStats, error) {
	return a.products.GetStats()
}

func (a *App) SearchProducts(query string, limit int) ([]domain.Product, error) {
	return a.products.Search(query, limit)
}

func (a *App) GetSales(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	return a.sales.GetAll(page, limit, search, status)
}

func (a *App) GetSale(id string) (*domain.Sale, error) {
	return a.sales.GetByID(id)
}

func (a *App) CreateSale(sale domain.Sale) error {
	return a.sales.Create(&sale)
}

func (a *App) ProcessReturn(token string, saleID string) (*domain.Sale, error) {
	if err := a.checkPermission(token, middleware.PermDeleteSale); err != nil {
		return nil, err
	}
	return a.sales.ProcessReturn(saleID)
}

func (a *App) GetParkedSales() ([]domain.ParkedSale, error) {
	return a.sales.GetParkedSales()
}

func (a *App) ParkSale(parked domain.ParkedSale) error {
	return a.sales.ParkSale(&parked)
}

func (a *App) DeleteParkedSale(id uint) error {
	return a.sales.DeleteParkedSale(id)
}

func (a *App) GetRecentSales(limit int) ([]domain.Sale, error) {
	return a.sales.GetRecent(limit)
}

func (a *App) CalculateInstallmentPlan(total, downPayment float64, months int) (*domain.InstallmentPlan, error) {
	return a.sales.CalculateInstallmentPlan(total, downPayment, months)
}

func (a *App) GetCustomers(page, limit int, search string) ([]domain.Customer, int64, error) {
	return a.customers.GetAll(page, limit, search)
}

func (a *App) GetCustomer(id string) (*domain.Customer, error) {
	return a.customers.GetByID(id)
}

func (a *App) CreateCustomer(customer domain.Customer) error {
	return a.customers.Create(&customer)
}

func (a *App) UpdateCustomer(customer domain.Customer) error {
	return a.customers.Update(&customer)
}

func (a *App) DeleteCustomer(id string) error {
	return a.customers.Delete(id)
}

func (a *App) SearchCustomerByPhone(phone string) (*domain.Customer, error) {
	return a.customers.GetByPhone(phone)
}

func (a *App) GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error) {
	return a.finance.GetExpenses(page, limit, category)
}

func (a *App) CreateExpense(token string, expense domain.Expense) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.finance.CreateExpense(&expense)
}

func (a *App) UpdateExpense(token string, expense domain.Expense) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.finance.UpdateExpense(&expense)
}

func (a *App) DeleteExpense(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.finance.DeleteExpense(id)
}

func (a *App) CreatePayment(payment domain.Payment) error {
	return a.finance.CreatePayment(&payment)
}

func (a *App) GetPayments(saleID string) ([]domain.Payment, error) {
	return a.finance.GetPayments(saleID)
}

func (a *App) GetPreferences() (*domain.AppPreferences, error) {
	return a.settings.GetPreferences()
}

func (a *App) UpdatePreferences(token string, prefs domain.AppPreferences) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.settings.UpdatePreferences(&prefs)
}

func (a *App) ResetDatabase(token string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	if staff, ok := a.authMiddleware.GetStaff(token); ok {
		a.audit.LogSensitiveAction(a.ctx, audit.ActionBackup, audit.EntitySettings, "reset", staff.ID, staff.Name, "Database reset")
	}
	a.log.Warn("Database reset by admin")
	err := a.settings.ResetDatabase()
	if err == nil {
		// Invalidate all caches
	}
	return err
}

func (a *App) ExportDatabase(token string) (*domain.DatabaseExport, error) {
	if err := a.checkPermission(token, middleware.PermExportReports); err != nil {
		return nil, err
	}
	return a.settings.ExportDatabase()
}

func (a *App) ImportDatabase(token string, data domain.DatabaseExport) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	a.log.Warn("Database import by admin")
	return a.settings.ImportDatabase(&data)
}

func (a *App) Login(username, password string) (*domain.Staff, error) {
	allowed, retryAfter := a.rateLimiter.Allow(username)
	if !allowed {
		return nil, &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "TOO_MANY_ATTEMPTS",
			Message: fmt.Sprintf("محاولات كثيرة جداً. حاول بعد %.0f دقيقة", retryAfter.Minutes()),
		}
	}

	staff, err := a.staff.Authenticate(username, password)
	if err != nil {
		a.rateLimiter.Record(username)
		return nil, err
	}

	a.rateLimiter.Reset(username)
	token := a.authMiddleware.CreateSession(staff)
	staff.Token = token
	return staff, nil
}

func (a *App) Logout(token string) error {
	a.authMiddleware.DestroySession(token)
	return nil
}

func (a *App) GetStaff(token string) ([]domain.Staff, error) {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return nil, err
	}
	return a.staff.GetAll()
}

func (a *App) CreateStaff(token string, staff domain.Staff) error {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return err
	}
	return a.staff.Create(&staff)
}

func (a *App) UpdateStaff(token string, staff domain.Staff) error {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return err
	}
	return a.staff.Update(&staff)
}

func (a *App) DeleteStaff(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return err
	}
	return a.staff.Delete(id)
}

func (a *App) GetActiveShift(staffID string) (*domain.Shift, error) {
	return a.shifts.GetActiveShift(staffID)
}

func (a *App) StartShift(staffID, staffName string, startCash float64) (*domain.Shift, error) {
	return a.shifts.StartShift(staffID, staffName, startCash)
}

func (a *App) CloseShift(shiftID string, endCash float64) (*domain.Shift, error) {
	return a.shifts.CloseShift(shiftID, endCash)
}

func (a *App) AddCashMovement(shiftID, staffID, movementType, reason string, amount float64) error {
	return a.shifts.AddCashMovement(shiftID, staffID, movementType, reason, amount)
}

func (a *App) GetCashMovements(shiftID string) ([]domain.CashMovement, error) {
	return a.shifts.GetCashMovements(shiftID)
}

func (a *App) GetSuppliers() ([]domain.Supplier, error) {
	return a.suppliers.GetAll()
}

func (a *App) GetSupplier(id string) (*domain.Supplier, error) {
	return a.suppliers.GetByID(id)
}

func (a *App) CreateSupplier(token string, supplier domain.Supplier) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.suppliers.Create(&supplier)
}

func (a *App) UpdateSupplier(token string, supplier domain.Supplier) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.suppliers.Update(&supplier)
}

func (a *App) DeleteSupplier(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
		return err
	}
	return a.suppliers.Delete(id)
}

func (a *App) GetPurchaseOrders(page, limit int, status string) (*domain.PaginatedResponse[domain.PurchaseOrder], error) {
	return a.purchaseOrders.GetAll(page, limit, status)
}

func (a *App) GetPurchaseOrder(id string) (*domain.PurchaseOrder, error) {
	return a.purchaseOrders.GetByID(id)
}

func (a *App) CreatePurchaseOrder(token string, order domain.PurchaseOrder) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.purchaseOrders.Create(&order)
}

func (a *App) UpdatePurchaseOrder(token string, order domain.PurchaseOrder) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.purchaseOrders.Update(&order)
}

func (a *App) DeletePurchaseOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
		return err
	}
	return a.purchaseOrders.Delete(id)
}

func (a *App) ReceivePurchaseOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermReceiveOrder); err != nil {
		return err
	}
	return a.purchaseOrders.ReceiveOrder(id)
}

func (a *App) ChangePassword(token, oldPassword, newPassword string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "UNAUTHORIZED",
			Message: "لم يتم تسجيل الدخول",
		}
	}

	a.audit.LogStaffAction(a.ctx, audit.ActionPasswordChange, staff.ID, staff.ID, staff.Name, "Password changed")
	return a.staff.UpdatePassword(staff.ID, oldPassword, newPassword)
}

// ── Feature 1: Loyalty & Rewards ──

func (a *App) GetLoyaltyTiers() ([]domain.LoyaltyTier, error) {
	return a.loyalty.GetTiers()
}

func (a *App) CreateLoyaltyTier(token string, tier domain.LoyaltyTier) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.CreateTier(&tier)
}

func (a *App) UpdateLoyaltyTier(token string, tier domain.LoyaltyTier) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.UpdateTier(&tier)
}

func (a *App) DeleteLoyaltyTier(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.DeleteTier(id)
}

func (a *App) GetLoyaltyRules() ([]domain.LoyaltyRule, error) {
	return a.loyalty.GetRules()
}

func (a *App) CreateLoyaltyRule(token string, rule domain.LoyaltyRule) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.CreateRule(&rule)
}

func (a *App) UpdateLoyaltyRule(token string, rule domain.LoyaltyRule) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.loyalty.UpdateRule(&rule)
}

func (a *App) GetLoyaltyTransactions(customerID string) ([]domain.LoyaltyTransaction, error) {
	return a.loyalty.GetTransactions(customerID)
}

func (a *App) RedeemLoyaltyPoints(token string, customerID string, points int, rewardType string, rewardValue float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.loyalty.RedeemPoints(customerID, points, rewardType, rewardValue, staff.ID)
}

// ── Feature 2: Notifications ──

func (a *App) GetNotificationTemplates() ([]domain.NotificationTemplate, error) {
	return a.notification.GetTemplates()
}

func (a *App) CreateNotificationTemplate(token string, t domain.NotificationTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.notification.CreateTemplate(&t)
}

func (a *App) UpdateNotificationTemplate(token string, t domain.NotificationTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.notification.UpdateTemplate(&t)
}

func (a *App) DeleteNotificationTemplate(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.notification.DeleteTemplate(id)
}

func (a *App) GetNotificationSettings() (*domain.NotificationSettings, error) {
	return a.notification.GetSettings()
}

func (a *App) UpdateNotificationSettings(token string, s domain.NotificationSettings) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.notification.UpdateSettings(&s)
}

func (a *App) GetNotificationLogs(page, limit int) ([]domain.NotificationLog, int64, error) {
	return a.notification.GetLogs(page, limit)
}

// ── Feature 3: Multi-Store/Branch ──

func (a *App) GetBranches() ([]domain.Branch, error) {
	return a.branch.GetAll()
}

func (a *App) GetBranch(id string) (*domain.Branch, error) {
	return a.branch.GetByID(id)
}

func (a *App) CreateBranch(token string, branch domain.Branch) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.branch.Create(&branch)
}

func (a *App) UpdateBranch(token string, branch domain.Branch) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.branch.Update(&branch)
}

func (a *App) DeleteBranch(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.branch.Delete(id)
}

func (a *App) GetStockTransfers(page, limit int, status string) ([]domain.StockTransfer, int64, error) {
	return a.branch.GetStockTransfers(page, limit, status)
}

func (a *App) CreateStockTransfer(token string, transfer domain.StockTransfer) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.branch.CreateStockTransfer(&transfer)
}

func (a *App) ApproveStockTransfer(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.branch.ApproveStockTransfer(id)
}

func (a *App) CompleteStockTransfer(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.branch.CompleteStockTransfer(id)
}

// ── Feature 4: Product Kits ──

func (a *App) GetProductKits() ([]domain.ProductKit, error) {
	return a.kit.GetAll()
}

func (a *App) GetProductKit(id string) (*domain.ProductKit, error) {
	return a.kit.GetByID(id)
}

func (a *App) CreateProductKit(token string, kit domain.ProductKit) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.kit.Create(&kit)
}

func (a *App) UpdateProductKit(token string, kit domain.ProductKit) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.kit.Update(&kit)
}

func (a *App) DeleteProductKit(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
		return err
	}
	return a.kit.Delete(id)
}

// ── Feature 5: Recurring Invoices ──

func (a *App) GetRecurringInvoices(page, limit int, status string) ([]domain.RecurringInvoice, int64, error) {
	return a.recurring.GetAll(page, limit, status)
}

func (a *App) GetRecurringInvoice(id string) (*domain.RecurringInvoice, error) {
	return a.recurring.GetByID(id)
}

func (a *App) CreateRecurringInvoice(token string, invoice domain.RecurringInvoice) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.recurring.Create(&invoice)
}

func (a *App) UpdateRecurringInvoice(token string, invoice domain.RecurringInvoice) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.recurring.Update(&invoice)
}

func (a *App) DeleteRecurringInvoice(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteSale); err != nil {
		return err
	}
	return a.recurring.Delete(id)
}

func (a *App) PauseRecurringInvoice(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.recurring.Pause(id)
}

func (a *App) ResumeRecurringInvoice(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.recurring.Resume(id)
}

// ── Feature 6: Analytics & AI Insights ──

func (a *App) GetAnalyticsDashboard() (*domain.AnalyticsDashboard, error) {
	return a.analytics.GetDashboard()
}

func (a *App) GetSalesForecast(days int) ([]domain.SalesForecast, error) {
	return a.analytics.GetSalesForecast(days)
}

func (a *App) GetProfitAnalysis(months int) ([]domain.ProfitAnalysis, error) {
	return a.analytics.GetProfitAnalysis(months)
}

func (a *App) GetDemandForecast() ([]domain.DemandForecast, error) {
	return a.analytics.GetDemandForecast()
}

func (a *App) DetectAnomalies() ([]domain.AnomalyDetection, error) {
	return a.analytics.DetectAnomalies()
}

// ── Feature 7: Gift Cards & Vouchers ──

func (a *App) GetGiftCards(page, limit int) ([]domain.GiftCard, int64, error) {
	return a.giftCard.GetAll(page, limit)
}

func (a *App) GetGiftCardByCode(code string) (*domain.GiftCard, error) {
	return a.giftCard.GetByCode(code)
}

func (a *App) CreateGiftCard(token string, card domain.GiftCard) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.Create(&card)
}

func (a *App) UpdateGiftCard(token string, card domain.GiftCard) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.Update(&card)
}

func (a *App) DeleteGiftCard(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.Delete(id)
}

func (a *App) RedeemGiftCard(token string, code string, amount float64, saleID string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.giftCard.Redeem(code, amount, saleID, staff.ID)
}

func (a *App) TopUpGiftCard(token string, id string, amount float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.giftCard.TopUp(id, amount, staff.ID)
}

func (a *App) GetGiftCardTransactions(cardID string) ([]domain.GiftCardTransaction, error) {
	return a.giftCard.GetTransactions(cardID)
}

func (a *App) GetVouchers() ([]domain.Voucher, error) {
	return a.giftCard.GetVouchers()
}

func (a *App) CreateVoucher(token string, v domain.Voucher) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.CreateVoucher(&v)
}

func (a *App) UpdateVoucher(token string, v domain.Voucher) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.UpdateVoucher(&v)
}

func (a *App) DeleteVoucher(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.giftCard.DeleteVoucher(id)
}

func (a *App) ApplyVoucher(code string) (*domain.Voucher, error) {
	return a.giftCard.ApplyVoucher(code)
}

// ── Feature 8: Kitchen Display System ──

func (a *App) GetKitchenOrders() ([]domain.KitchenOrder, error) {
	return a.kitchen.GetPendingOrders()
}

func (a *App) GetKitchenOrder(id string) (*domain.KitchenOrder, error) {
	return a.kitchen.GetOrderByID(id)
}

func (a *App) CreateKitchenOrder(token string, order domain.KitchenOrder) (*domain.KitchenOrder, error) {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return nil, err
	}
	return a.kitchen.CreateOrder(order.SaleID, order.TableNumber, order.Priority, order.Note, order.Items)
}

func (a *App) StartKitchenOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.kitchen.StartOrder(id)
}

func (a *App) CompleteKitchenOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.kitchen.CompleteOrder(id)
}

func (a *App) CancelKitchenOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteSale); err != nil {
		return err
	}
	return a.kitchen.CancelOrder(id)
}

func (a *App) UpdateKitchenItemStatus(token string, orderID string, itemID uint, status string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.kitchen.UpdateItemStatus(orderID, itemID, status)
}

func (a *App) GetKitchenStations() ([]domain.KitchenStation, error) {
	return a.kitchen.GetStations()
}

func (a *App) CreateKitchenStation(token string, station domain.KitchenStation) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.kitchen.CreateStation(&station)
}

func (a *App) DeleteKitchenStation(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.kitchen.DeleteStation(id)
}

// ── Feature 9: Customer Wallet & Credit ──

func (a *App) GetCustomerWallet(customerID string) (*domain.CustomerWallet, error) {
	return a.wallet.GetByCustomerID(customerID)
}

func (a *App) CreateCustomerWallet(token string, customerID string, creditLimit float64) (*domain.CustomerWallet, error) {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return nil, err
	}
	return a.wallet.CreateWallet(customerID, creditLimit)
}

func (a *App) TopUpWallet(token string, customerID string, amount float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.wallet.TopUp(customerID, amount, staff.ID)
}

func (a *App) DebitWallet(token string, customerID string, amount float64, saleID string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.wallet.Debit(customerID, amount, saleID, staff.ID)
}

func (a *App) UpdateCreditLimit(token string, customerID string, creditLimit float64) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.wallet.UpdateCreditLimit(customerID, creditLimit)
}

func (a *App) SetAutoDebit(token string, customerID string, enabled bool, day int) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.wallet.SetAutoDebit(customerID, enabled, day)
}

func (a *App) GetWalletTransactions(customerID string, page, limit int) ([]domain.WalletTransaction, int64, error) {
	return a.wallet.GetTransactions(customerID, page, limit)
}

// ── Feature 10: Stock Adjustments & Waste ──

func (a *App) CreateStockAdjustment(token string, productID, adjType, reason string, newQty float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.stockAdjustment.CreateAdjustment(productID, adjType, reason, newQty, staff.ID, staff.Name)
}

func (a *App) GetStockAdjustments(page, limit int, adjType string) ([]domain.StockAdjustment, int64, error) {
	return a.stockAdjustment.GetAdjustments(page, limit, adjType)
}

func (a *App) CreateWasteRecord(token string, productID, wasteType, reason string, qty float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.stockAdjustment.CreateWasteRecord(productID, wasteType, reason, qty, staff.ID, staff.Name)
}

func (a *App) GetWasteRecords(page, limit int, wasteType string) ([]domain.WasteRecord, int64, error) {
	return a.stockAdjustment.GetWasteRecords(page, limit, wasteType)
}

func (a *App) GetWasteSummary(startDate, endDate string) ([]domain.WasteRecord, error) {
	return a.stockAdjustment.GetWasteSummary(startDate, endDate)
}

func (a *App) GetStockVarianceReport() ([]domain.StockVarianceReport, error) {
	return a.stockAdjustment.GetStockVarianceReport()
}

// ── Feature 11: Multi-Currency ──

func (a *App) GetCurrencies() ([]domain.Currency, error) {
	return a.currency.GetAll()
}

func (a *App) GetCurrencyByCode(code string) (*domain.Currency, error) {
	return a.currency.GetByCode(code)
}

func (a *App) GetBaseCurrency() (*domain.Currency, error) {
	return a.currency.GetBaseCurrency()
}

func (a *App) CreateCurrency(token string, currency domain.Currency) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.currency.Create(&currency)
}

func (a *App) UpdateCurrency(token string, currency domain.Currency) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.currency.Update(&currency)
}

func (a *App) DeleteCurrency(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.currency.Delete(id)
}

func (a *App) ConvertCurrency(amount float64, fromCode, toCode string) (float64, error) {
	converted, _, _, err := a.currency.Convert(amount, fromCode, toCode)
	return converted, err
}

func (a *App) UpdateExchangeRate(token string, code string, rate float64) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.currency.UpdateExchangeRate(code, rate)
}

func (a *App) GetCurrencyTransactions(saleID string) ([]domain.CurrencyTransaction, error) {
	return a.currency.GetTransactions(saleID)
}

// ── Feature 12: Messaging (WhatsApp/SMS) ──

func (a *App) GetMessagingProviders() ([]domain.MessagingProvider, error) {
	return a.messaging.GetProviders()
}

func (a *App) CreateMessagingProvider(token string, provider domain.MessagingProvider) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.messaging.CreateProvider(&provider)
}

func (a *App) UpdateMessagingProvider(token string, provider domain.MessagingProvider) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.messaging.UpdateProvider(&provider)
}

func (a *App) DeleteMessagingProvider(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.messaging.DeleteProvider(id)
}

func (a *App) GetMessageTemplates() ([]domain.MessageTemplate, error) {
	return a.messaging.GetTemplates()
}

func (a *App) CreateMessageTemplate(token string, template domain.MessageTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.messaging.CreateTemplate(&template)
}

func (a *App) UpdateMessageTemplate(token string, template domain.MessageTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.messaging.UpdateTemplate(&template)
}

func (a *App) DeleteMessageTemplate(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.messaging.DeleteTemplate(id)
}

func (a *App) SendMessage(token, providerID, recipient, content, saleID, customerID string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.messaging.SendMessage(providerID, recipient, content, saleID, customerID, staff.ID)
}

func (a *App) GetMessageLogs(page, limit int) ([]domain.MessageLog, int64, error) {
	return a.messaging.GetLogs(page, limit)
}

// ── Feature 13: Employee Performance & Commissions ──

func (a *App) GetCommissionRules() ([]domain.CommissionRule, error) {
	return a.commission.GetRules()
}

func (a *App) CreateCommissionRule(token string, rule domain.CommissionRule) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.commission.CreateRule(&rule)
}

func (a *App) UpdateCommissionRule(token string, rule domain.CommissionRule) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.commission.UpdateRule(&rule)
}

func (a *App) DeleteCommissionRule(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.commission.DeleteRule(id)
}

func (a *App) GetStaffPerformance(staffID, periodStart, periodEnd string) (*domain.StaffPerformance, error) {
	return a.commission.GetStaffPerformance(staffID, periodStart, periodEnd)
}

func (a *App) GetAllStaffPerformance(periodStart, periodEnd string) ([]domain.StaffPerformance, error) {
	return a.commission.GetAllStaffPerformance(periodStart, periodEnd)
}

func (a *App) GetCommissionPayments(staffID string) ([]domain.CommissionPayment, error) {
	return a.commission.GetPayments(staffID)
}

func (a *App) MarkCommissionPaid(token string, id uint) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.commission.MarkPaymentPaid(id)
}

// ── Feature 14: Customer Segmentation & Campaigns ──

func (a *App) GetCustomerSegments() ([]domain.CustomerSegment, error) {
	return a.campaign.GetSegments()
}

func (a *App) CreateCustomerSegment(token string, segment domain.CustomerSegment) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.CreateSegment(&segment)
}

func (a *App) UpdateCustomerSegment(token string, segment domain.CustomerSegment) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.UpdateSegment(&segment)
}

func (a *App) DeleteCustomerSegment(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.DeleteSegment(id)
}

func (a *App) AddCustomerToSegment(token, segmentID, customerID string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.AddCustomerToSegment(segmentID, customerID)
}

func (a *App) RemoveCustomerFromSegment(token, segmentID, customerID string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.RemoveCustomerFromSegment(segmentID, customerID)
}

func (a *App) AutoSegmentCustomers(token string) (int, error) {
	if err := a.requireAdmin(token); err != nil {
		return 0, err
	}
	return a.campaign.AutoSegmentCustomers()
}

func (a *App) GetCampaigns() ([]domain.Campaign, error) {
	return a.campaign.GetCampaigns()
}

func (a *App) CreateCampaign(token string, campaign domain.Campaign) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.CreateCampaign(&campaign)
}

func (a *App) UpdateCampaign(token string, campaign domain.Campaign) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.UpdateCampaign(&campaign)
}

func (a *App) DeleteCampaign(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.DeleteCampaign(id)
}

func (a *App) StartCampaign(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.StartCampaign(id)
}

// ── Feature 15: Tax Management ──

func (a *App) GetTaxRates() ([]domain.TaxRate, error) {
	return a.tax.GetTaxRates()
}

func (a *App) CreateTaxRate(token string, rate domain.TaxRate) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.tax.CreateTaxRate(&rate)
}

func (a *App) UpdateTaxRate(token string, rate domain.TaxRate) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.tax.UpdateTaxRate(&rate)
}

func (a *App) DeleteTaxRate(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.tax.DeleteTaxRate(id)
}

func (a *App) GetDefaultTaxRate() (*domain.TaxRate, error) {
	return a.tax.GetDefaultTaxRate()
}

func (a *App) AssignProductTax(token, productID, taxRateID string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.tax.AssignProductTax(productID, taxRateID)
}

func (a *App) RemoveProductTax(token, productID, taxRateID string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.tax.RemoveProductTax(productID, taxRateID)
}

func (a *App) GetProductTaxes(productID string) ([]domain.ProductTax, error) {
	return a.tax.GetProductTaxes(productID)
}

func (a *App) GetTaxReport(periodStart, periodEnd string) ([]domain.TaxReport, error) {
	return a.tax.GetTaxReport(periodStart, periodEnd)
}

// ── Feature 16: Self-Service Kiosk ──

func (a *App) GetKioskLayouts() ([]domain.KioskLayout, error) {
	return a.kiosk.GetLayouts()
}

func (a *App) GetKioskLayout(id string) (*domain.KioskLayout, error) {
	return a.kiosk.GetLayoutByID(id)
}

func (a *App) CreateKioskLayout(token string, layout domain.KioskLayout) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.kiosk.CreateLayout(&layout)
}

func (a *App) UpdateKioskLayout(token string, layout domain.KioskLayout) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.kiosk.UpdateLayout(&layout)
}

func (a *App) DeleteKioskLayout(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.kiosk.DeleteLayout(id)
}

func (a *App) StartKioskSession(layoutID string) (*domain.KioskSession, error) {
	return a.kiosk.StartSession(layoutID)
}

func (a *App) EndKioskSession(sessionID uint, saleID string, totalAmount float64) error {
	return a.kiosk.EndSession(sessionID, saleID, totalAmount)
}

func (a *App) GetActiveKioskSessions() ([]domain.KioskSession, error) {
	return a.kiosk.GetActiveSessions()
}

// ── Feature 17: Delivery Management ──

func (a *App) GetDeliveryDrivers() ([]domain.DeliveryDriver, error) {
	return a.delivery.GetDrivers()
}

func (a *App) CreateDeliveryDriver(token string, driver domain.DeliveryDriver) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.CreateDriver(&driver)
}

func (a *App) UpdateDeliveryDriver(token string, driver domain.DeliveryDriver) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.UpdateDriver(&driver)
}

func (a *App) DeleteDeliveryDriver(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.DeleteDriver(id)
}

func (a *App) GetDeliveryOrders(page, limit int, status string) ([]domain.DeliveryOrder, int64, error) {
	return a.delivery.GetOrders(page, limit, status)
}

func (a *App) CreateDeliveryOrder(token string, order domain.DeliveryOrder) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.delivery.CreateOrder(&order)
}

func (a *App) AssignDeliveryDriver(token, orderID, driverID string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.AssignDriver(orderID, driverID)
}

func (a *App) UpdateDeliveryStatus(token, orderID, status string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.UpdateOrderStatus(orderID, status)
}

// ── Feature 18: Inventory Auto-Reorder ──

func (a *App) GetReorderRules() ([]domain.ReorderRule, error) {
	return a.reorder.GetRules()
}

func (a *App) CreateReorderRule(token string, rule domain.ReorderRule) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.reorder.CreateRule(&rule)
}

func (a *App) UpdateReorderRule(token string, rule domain.ReorderRule) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.reorder.UpdateRule(&rule)
}

func (a *App) DeleteReorderRule(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.reorder.DeleteRule(id)
}

func (a *App) GetReorderAlerts() ([]domain.ReorderAlert, error) {
	return a.reorder.GetAlerts()
}

func (a *App) AutoReorder(token string) (int, error) {
	if err := a.requireAdmin(token); err != nil {
		return 0, err
	}
	return a.reorder.AutoReorder()
}

// ── Feature 19: Expense Budget & Approval ──

func (a *App) GetBudgets() ([]domain.Budget, error) {
	return a.budget.GetBudgets()
}

func (a *App) CreateBudget(token string, budget domain.Budget) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.CreateBudget(&budget)
}

func (a *App) UpdateBudget(token string, budget domain.Budget) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.UpdateBudget(&budget)
}

func (a *App) DeleteBudget(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.DeleteBudget(id)
}

func (a *App) GetApprovalWorkflows() ([]domain.ApprovalWorkflow, error) {
	return a.budget.GetApprovalWorkflows()
}

func (a *App) CreateApprovalWorkflow(token string, wf domain.ApprovalWorkflow) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.CreateApprovalWorkflow(&wf)
}

func (a *App) DeleteApprovalWorkflow(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.DeleteApprovalWorkflow(id)
}

func (a *App) ApproveExpense(token, expenseID, comment string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.budget.ApproveExpense(expenseID, staff.ID, staff.Name, comment)
}

func (a *App) RejectExpense(token, expenseID, comment string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.budget.RejectExpense(expenseID, staff.ID, staff.Name, comment)
}

func (a *App) GetExpenseApprovals(expenseID string) ([]domain.ExpenseApproval, error) {
	return a.budget.GetExpenseApprovals(expenseID)
}

func (a *App) CheckBudgetLimit(category string, amount float64) (bool, float64, error) {
	return a.budget.CheckBudgetLimit(category, amount)
}

// ── Feature 20: Custom Report Builder ──

func (a *App) GetReportTemplates() ([]domain.ReportTemplate, error) {
	return a.reportBuilder.GetTemplates()
}

func (a *App) GetReportTemplate(id string) (*domain.ReportTemplate, error) {
	return a.reportBuilder.GetTemplateByID(id)
}

func (a *App) CreateReportTemplate(token string, template domain.ReportTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.reportBuilder.CreateTemplate(&template)
}

func (a *App) UpdateReportTemplate(token string, template domain.ReportTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.reportBuilder.UpdateTemplate(&template)
}

func (a *App) DeleteReportTemplate(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.reportBuilder.DeleteTemplate(id)
}

func (a *App) GenerateReport(templateID string) (interface{}, error) {
	return a.reportBuilder.GenerateReport(templateID)
}

func (a *App) GetScheduledExports() ([]domain.ScheduledExport, error) {
	return a.reportBuilder.GetScheduledExports()
}

func (a *App) CreateScheduledExport(token string, export domain.ScheduledExport) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.reportBuilder.CreateScheduledExport(&export)
}

func (a *App) UpdateScheduledExport(token string, export domain.ScheduledExport) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.reportBuilder.UpdateScheduledExport(&export)
}

func (a *App) DeleteScheduledExport(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.reportBuilder.DeleteScheduledExport(id)
}
