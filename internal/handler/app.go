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
	ctx            context.Context
	products       *service.ProductService
	sales          *service.SaleService
	customers      *service.CustomerService
	staff          *service.StaffService
	finance        *service.FinanceService
	settings       *service.SettingsService
	stats          *service.StatsService
	shifts         *service.ShiftService
	suppliers      *service.SupplierService
	purchaseOrders *service.PurchaseOrderService
	authMiddleware *middleware.AuthMiddleware
	rateLimiter    *middleware.RateLimiter
	audit          *audit.AuditService
	log            *logger.Logger
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
) *App {
	return &App{
		products:       products,
		sales:          sales,
		customers:      customers,
		staff:          staff,
		finance:        finance,
		settings:       settings,
		stats:          stats,
		shifts:         shifts,
		suppliers:      suppliers,
		purchaseOrders: purchaseOrders,
		authMiddleware: authMiddleware,
		rateLimiter:    rateLimiter,
		audit:          audit,
		log:            log,
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
