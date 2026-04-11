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
