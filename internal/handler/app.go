package handler

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/service"
	"context"
)

// App is the main Wails handler that exposes backend services to frontend
type App struct {
	ctx       context.Context
	products  *service.ProductService
	sales     *service.SaleService
	customers *service.CustomerService
	staff     *service.StaffService
	finance   *service.FinanceService
	settings  *service.SettingsService
	stats     *service.StatsService
	shifts         *service.ShiftService
	suppliers      *service.SupplierService
	purchaseOrders *service.PurchaseOrderService
	log            *logger.Logger
}

// NewApp creates a new App handler
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
	log *logger.Logger,
) *App {
	return &App{
		products:  products,
		sales:     sales,
		customers: customers,
		staff:     staff,
		finance:   finance,
		settings:  settings,
		stats:          stats,
		shifts:         shifts,
		suppliers:      suppliers,
		purchaseOrders: purchaseOrders,
		log:            log,
	}
}

// Startup is called when the application starts
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.log.Info("Application started")
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 Dashboard & Stats
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) GetDashboardStats() (*domain.DashboardStats, error) {
	return a.stats.GetDashboardStats()
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 Products
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) GetProducts(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
	return a.products.GetAll(page, limit, search, category)
}

func (a *App) GetProduct(id string) (*domain.Product, error) {
	return a.products.GetByID(id)
}

func (a *App) GetProductByBarcode(barcode string) (*domain.Product, error) {
	return a.products.GetByBarcode(barcode)
}

func (a *App) CreateProduct(product domain.Product) error {
	return a.products.Create(&product)
}

func (a *App) UpdateProduct(product domain.Product) error {
	return a.products.Update(&product)
}

func (a *App) DeleteProduct(id string) error {
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

// ═══════════════════════════════════════════════════════════════════════════════
// 🛒 Sales
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) GetSales(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	return a.sales.GetAll(page, limit, search, status)
}

func (a *App) GetSale(id string) (*domain.Sale, error) {
	return a.sales.GetByID(id)
}

func (a *App) CreateSale(sale domain.Sale) error {
	return a.sales.Create(&sale)
}

func (a *App) ProcessReturn(saleID string) (*domain.Sale, error) {
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

// ═══════════════════════════════════════════════════════════════════════════════
// 👥 Customers
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// 💰 Finance
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error) {
	return a.finance.GetExpenses(page, limit, category)
}

func (a *App) CreateExpense(expense domain.Expense) error {
	return a.finance.CreateExpense(&expense)
}

func (a *App) UpdateExpense(expense domain.Expense) error {
	return a.finance.UpdateExpense(&expense)
}

func (a *App) DeleteExpense(id string) error {
	return a.finance.DeleteExpense(id)
}

func (a *App) CreatePayment(payment domain.Payment) error {
	return a.finance.CreatePayment(&payment)
}

func (a *App) GetPayments(saleID string) ([]domain.Payment, error) {
	return a.finance.GetPayments(saleID)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 👤 Staff & Auth
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) Login(username, password string) (*domain.Staff, error) {
	return a.staff.Authenticate(username, password)
}

func (a *App) GetStaff() ([]domain.Staff, error) {
	return a.staff.GetAll()
}

func (a *App) CreateStaff(staff domain.Staff) error {
	return a.staff.Create(&staff)
}

func (a *App) UpdateStaff(staff domain.Staff) error {
	return a.staff.Update(&staff)
}

func (a *App) DeleteStaff(id string) error {
	return a.staff.Delete(id)
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️ Settings
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) GetPreferences() (*domain.AppPreferences, error) {
	return a.settings.GetPreferences()
}

func (a *App) UpdatePreferences(prefs domain.AppPreferences) error {
	return a.settings.UpdatePreferences(&prefs)
}

func (a *App) ResetDatabase() error {
	return a.settings.ResetDatabase()
}

func (a *App) ExportDatabase() (*domain.DatabaseExport, error) {
	return a.settings.ExportDatabase()
}

func (a *App) ImportDatabase(data domain.DatabaseExport) error {
	return a.settings.ImportDatabase(&data)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🖥️ Window Controls
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) Minimize() {
	// Handled by Wails runtime in frontend
}

func (a *App) Maximize() {
	// Handled by Wails runtime in frontend
}

func (a *App) Close() {
	// Handled by Wails runtime in frontend
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 Shifts
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) GetShifts(page, limit int) ([]domain.Shift, int64, error) {
	return a.shifts.GetShifts(page, limit)
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

// ═══════════════════════════════════════════════════════════════════════════════
// 🏭 Suppliers
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) GetSuppliers() ([]domain.Supplier, error) {
	return a.suppliers.GetAll()
}

func (a *App) GetSupplier(id string) (*domain.Supplier, error) {
	return a.suppliers.GetByID(id)
}

func (a *App) CreateSupplier(supplier domain.Supplier) error {
	return a.suppliers.Create(&supplier)
}

func (a *App) UpdateSupplier(supplier domain.Supplier) error {
	return a.suppliers.Update(&supplier)
}

func (a *App) DeleteSupplier(id string) error {
	return a.suppliers.Delete(id)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 Purchase Orders
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) GetPurchaseOrders(page, limit int, status string) (*domain.PaginatedResponse[domain.PurchaseOrder], error) {
	return a.purchaseOrders.GetAll(page, limit, status)
}

func (a *App) GetPurchaseOrder(id string) (*domain.PurchaseOrder, error) {
	return a.purchaseOrders.GetByID(id)
}

func (a *App) CreatePurchaseOrder(order domain.PurchaseOrder) error {
	return a.purchaseOrders.Create(&order)
}

func (a *App) UpdatePurchaseOrder(order domain.PurchaseOrder) error {
	return a.purchaseOrders.Update(&order)
}

func (a *App) DeletePurchaseOrder(id string) error {
	return a.purchaseOrders.Delete(id)
}

func (a *App) ReceivePurchaseOrder(id string) error {
	return a.purchaseOrders.ReceiveOrder(id)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 Utility
// ═══════════════════════════════════════════════════════════════════════════════

func (a *App) Greet(name string) string {
	return "Hello " + name + "!"
}
