package mocks

import (
	"bard/internal/domain"
	"bard/internal/repository"

	"github.com/stretchr/testify/mock"
)

type MockProductRepository struct {
	mock.Mock
}

func (m *MockProductRepository) GetAll(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
	args := m.Called(page, limit, search, category)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PaginatedProducts), args.Error(1)
}

func (m *MockProductRepository) GetByID(id string) (*domain.Product, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Product), args.Error(1)
}

func (m *MockProductRepository) GetByBarcode(barcode string) (*domain.Product, error) {
	args := m.Called(barcode)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Product), args.Error(1)
}

func (m *MockProductRepository) Create(product *domain.Product) error {
	args := m.Called(product)
	return args.Error(0)
}

func (m *MockProductRepository) Update(product *domain.Product) error {
	args := m.Called(product)
	return args.Error(0)
}

func (m *MockProductRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockProductRepository) GetCategories() ([]string, error) {
	args := m.Called()
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockProductRepository) CreateCategory(cat *domain.Category) error {
	args := m.Called(cat)
	return args.Error(0)
}

func (m *MockProductRepository) GetStats() (*domain.ProductStats, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ProductStats), args.Error(1)
}

func (m *MockProductRepository) GetLowStock(threshold int) ([]domain.Product, error) {
	args := m.Called(threshold)
	return args.Get(0).([]domain.Product), args.Error(1)
}

func (m *MockProductRepository) Search(query string, limit int) ([]domain.Product, error) {
	args := m.Called(query, limit)
	return args.Get(0).([]domain.Product), args.Error(1)
}

// MockSaleRepository simulates SaleRepository for testing
type MockSaleRepository struct {
	mock.Mock
}

func (m *MockSaleRepository) GetAll(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	args := m.Called(page, limit, search, status)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PaginatedSales), args.Error(1)
}

func (m *MockSaleRepository) GetByID(id string) (*domain.Sale, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Sale), args.Error(1)
}

func (m *MockSaleRepository) Create(sale *domain.Sale) error {
	args := m.Called(sale)
	return args.Error(0)
}

func (m *MockSaleRepository) CreateSaleWithStockUpdate(sale *domain.Sale) error {
	args := m.Called(sale)
	return args.Error(0)
}

func (m *MockSaleRepository) Update(sale *domain.Sale) error {
	args := m.Called(sale)
	return args.Error(0)
}

func (m *MockSaleRepository) GetByCustomerID(customerID string, page, limit int) (*domain.PaginatedSales, error) {
	args := m.Called(customerID, page, limit)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PaginatedSales), args.Error(1)
}

func (m *MockSaleRepository) GetByDateRange(startDate, endDate string) ([]domain.Sale, error) {
	args := m.Called(startDate, endDate)
	return args.Get(0).([]domain.Sale), args.Error(1)
}

func (m *MockSaleRepository) GetRecent(limit int) ([]domain.Sale, error) {
	args := m.Called(limit)
	return args.Get(0).([]domain.Sale), args.Error(1)
}

func (m *MockSaleRepository) GetStats(startDate, endDate string) (*domain.InvoiceStats, error) {
	args := m.Called(startDate, endDate)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.InvoiceStats), args.Error(1)
}

func (m *MockSaleRepository) CreateParkedSale(parked *domain.ParkedSale) error {
	args := m.Called(parked)
	return args.Error(0)
}

func (m *MockSaleRepository) GetParkedSales() ([]domain.ParkedSale, error) {
	args := m.Called()
	return args.Get(0).([]domain.ParkedSale), args.Error(1)
}

func (m *MockSaleRepository) DeleteParkedSale(id uint) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockSaleRepository) GetTopProducts(limit int, startDate, endDate string) ([]domain.TopProduct, error) {
	args := m.Called(limit, startDate, endDate)
	return args.Get(0).([]domain.TopProduct), args.Error(1)
}

func (m *MockSaleRepository) ProcessReturnWithStockUpdate(originalSaleID string) (*domain.Sale, error) {
	args := m.Called(originalSaleID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Sale), args.Error(1)
}

func (m *MockSaleRepository) ProcessPartialReturnWithStockUpdate(originalSaleID string, returnItems []repository.PartialReturnItem) (*domain.Sale, error) {
	args := m.Called(originalSaleID, returnItems)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Sale), args.Error(1)
}

// MockCustomerRepository simulates CustomerRepository for testing
type MockCustomerRepository struct {
	mock.Mock
}

func (m *MockCustomerRepository) GetAll(page, limit int, search string) ([]domain.Customer, int64, error) {
	args := m.Called(page, limit, search)
	return args.Get(0).([]domain.Customer), args.Get(1).(int64), args.Error(2)
}

func (m *MockCustomerRepository) GetByID(id string) (*domain.Customer, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Customer), args.Error(1)
}

func (m *MockCustomerRepository) GetByPhone(phone string) (*domain.Customer, error) {
	args := m.Called(phone)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Customer), args.Error(1)
}

func (m *MockCustomerRepository) Create(customer *domain.Customer) error {
	args := m.Called(customer)
	return args.Error(0)
}

func (m *MockCustomerRepository) Update(customer *domain.Customer) error {
	args := m.Called(customer)
	return args.Error(0)
}

func (m *MockCustomerRepository) UpdateFields(id string, fields map[string]interface{}) error {
	args := m.Called(id, fields)
	return args.Error(0)
}

func (m *MockCustomerRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockCustomerRepository) UpdateDebt(id string, amount float64) error {
	args := m.Called(id, amount)
	return args.Error(0)
}

func (m *MockCustomerRepository) UpdateInstallmentDebt(id string, amount float64) error {
	args := m.Called(id, amount)
	return args.Error(0)
}

func (m *MockCustomerRepository) GetTop(limit int) ([]domain.Customer, error) {
	args := m.Called(limit)
	return args.Get(0).([]domain.Customer), args.Error(1)
}

// MockStaffRepository simulates StaffRepository for testing
type MockStaffRepository struct {
	mock.Mock
}

func (m *MockStaffRepository) GetAll() ([]domain.Staff, error) {
	args := m.Called()
	return args.Get(0).([]domain.Staff), args.Error(1)
}

func (m *MockStaffRepository) GetByID(id string) (*domain.Staff, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Staff), args.Error(1)
}

func (m *MockStaffRepository) GetByUsername(username string) (*domain.Staff, error) {
	args := m.Called(username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Staff), args.Error(1)
}

func (m *MockStaffRepository) Create(staff *domain.Staff) error {
	args := m.Called(staff)
	return args.Error(0)
}

func (m *MockStaffRepository) Update(staff *domain.Staff) error {
	args := m.Called(staff)
	return args.Error(0)
}

func (m *MockStaffRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockStaffRepository) Authenticate(username, password string) (*domain.Staff, error) {
	args := m.Called(username, password)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Staff), args.Error(1)
}

func (m *MockStaffRepository) UpdatePassword(id, hashedPassword string) error {
	args := m.Called(id, hashedPassword)
	return args.Error(0)
}

func (m *MockStaffRepository) UpdateFields(id string, fields map[string]interface{}) error {
	args := m.Called(id, fields)
	return args.Error(0)
}

// MockFinanceRepository simulates FinanceRepository for testing
type MockFinanceRepository struct {
	mock.Mock
}

func (m *MockFinanceRepository) GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error) {
	args := m.Called(page, limit, category)
	return args.Get(0).([]domain.Expense), args.Get(1).(int64), args.Error(2)
}

func (m *MockFinanceRepository) CreateExpense(expense *domain.Expense) error {
	args := m.Called(expense)
	return args.Error(0)
}

func (m *MockFinanceRepository) UpdateExpense(expense *domain.Expense) error {
	args := m.Called(expense)
	return args.Error(0)
}

func (m *MockFinanceRepository) DeleteExpense(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockFinanceRepository) GetExpenseCategories() ([]string, error) {
	args := m.Called()
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockFinanceRepository) GetDiscounts() ([]domain.Discount, error) {
	args := m.Called()
	return args.Get(0).([]domain.Discount), args.Error(1)
}

func (m *MockFinanceRepository) CreateDiscount(discount *domain.Discount) error {
	args := m.Called(discount)
	return args.Error(0)
}

func (m *MockFinanceRepository) UpdateDiscount(discount *domain.Discount) error {
	args := m.Called(discount)
	return args.Error(0)
}

func (m *MockFinanceRepository) DeleteDiscount(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockFinanceRepository) GetPayments(saleID string) ([]domain.Payment, error) {
	args := m.Called(saleID)
	return args.Get(0).([]domain.Payment), args.Error(1)
}

func (m *MockFinanceRepository) CreatePayment(payment *domain.Payment) error {
	args := m.Called(payment)
	return args.Error(0)
}

func (m *MockFinanceRepository) GetPaymentsByCustomerID(customerID string) ([]domain.Payment, error) {
	args := m.Called(customerID)
	return args.Get(0).([]domain.Payment), args.Error(1)
}

// MockStatsRepository simulates StatsRepository for testing
type MockStatsRepository struct {
	mock.Mock
}

func (m *MockStatsRepository) GetDashboardStats() (*domain.DashboardStats, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.DashboardStats), args.Error(1)
}

// MockSettingsRepository simulates SettingsRepository for testing
type MockSettingsRepository struct {
	mock.Mock
}

func (m *MockSettingsRepository) GetPreferences() (*domain.AppPreferences, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.AppPreferences), args.Error(1)
}

func (m *MockSettingsRepository) UpdatePreferences(prefs *domain.AppPreferences) error {
	args := m.Called(prefs)
	return args.Error(0)
}

func (m *MockSettingsRepository) ResetDatabase() error {
	args := m.Called()
	return args.Error(0)
}

func (m *MockSettingsRepository) ExportDatabase() (*domain.DatabaseExport, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.DatabaseExport), args.Error(1)
}

func (m *MockSettingsRepository) ImportDatabase(data *domain.DatabaseExport) error {
	args := m.Called(data)
	return args.Error(0)
}

// MockShiftRepository simulates ShiftRepository for testing
type MockShiftRepository struct {
	mock.Mock
}

func (m *MockShiftRepository) Create(shift *domain.Shift) error {
	args := m.Called(shift)
	return args.Error(0)
}

func (m *MockShiftRepository) GetActive(staffID string) (*domain.Shift, error) {
	args := m.Called(staffID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Shift), args.Error(1)
}

func (m *MockShiftRepository) Close(shift *domain.Shift) error {
	args := m.Called(shift)
	return args.Error(0)
}

func (m *MockShiftRepository) GetAll(page, limit int) ([]domain.Shift, int64, error) {
	args := m.Called(page, limit)
	return args.Get(0).([]domain.Shift), args.Get(1).(int64), args.Error(2)
}

func (m *MockShiftRepository) AddCashMovement(movement *domain.CashMovement) error {
	args := m.Called(movement)
	return args.Error(0)
}

func (m *MockShiftRepository) GetCashMovements(shiftID string) ([]domain.CashMovement, error) {
	args := m.Called(shiftID)
	return args.Get(0).([]domain.CashMovement), args.Error(1)
}

// MockSupplierRepository simulates SupplierRepository for testing
type MockSupplierRepository struct {
	mock.Mock
}

func (m *MockSupplierRepository) GetAll() ([]domain.Supplier, error) {
	args := m.Called()
	return args.Get(0).([]domain.Supplier), args.Error(1)
}

func (m *MockSupplierRepository) GetByID(id string) (*domain.Supplier, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Supplier), args.Error(1)
}

func (m *MockSupplierRepository) Create(supplier *domain.Supplier) error {
	args := m.Called(supplier)
	return args.Error(0)
}

func (m *MockSupplierRepository) Update(supplier *domain.Supplier) error {
	args := m.Called(supplier)
	return args.Error(0)
}

func (m *MockSupplierRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

// MockPurchaseOrderRepository simulates PurchaseOrderRepository for testing
type MockPurchaseOrderRepository struct {
	mock.Mock
}

func (m *MockPurchaseOrderRepository) GetAll(page, limit int, status string) ([]domain.PurchaseOrder, int64, error) {
	args := m.Called(page, limit, status)
	return args.Get(0).([]domain.PurchaseOrder), args.Get(1).(int64), args.Error(2)
}

func (m *MockPurchaseOrderRepository) GetByID(id string) (*domain.PurchaseOrder, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PurchaseOrder), args.Error(1)
}

func (m *MockPurchaseOrderRepository) Create(order *domain.PurchaseOrder) error {
	args := m.Called(order)
	return args.Error(0)
}

func (m *MockPurchaseOrderRepository) Update(order *domain.PurchaseOrder) error {
	args := m.Called(order)
	return args.Error(0)
}

func (m *MockPurchaseOrderRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockPurchaseOrderRepository) UpdateStatus(id string, status string) error {
	args := m.Called(id, status)
	return args.Error(0)
}

func (m *MockPurchaseOrderRepository) CreateWithStockUpdate(order *domain.PurchaseOrder) error {
	args := m.Called(order)
	return args.Error(0)
}

func (m *MockPurchaseOrderRepository) ReceiveWithStockUpdate(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service Layer Mocks
// ═══════════════════════════════════════════════════════════════════════════════

// MockProductService simulates ProductService for testing
type MockProductService struct {
	mock.Mock
}

func (m *MockProductService) GetAll(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
	args := m.Called(page, limit, search, category)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PaginatedProducts), args.Error(1)
}

func (m *MockProductService) GetByID(id string) (*domain.Product, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Product), args.Error(1)
}

func (m *MockProductService) GetByBarcode(barcode string) (*domain.Product, error) {
	args := m.Called(barcode)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Product), args.Error(1)
}

func (m *MockProductService) Create(product *domain.Product) error {
	args := m.Called(product)
	return args.Error(0)
}

func (m *MockProductService) Update(product *domain.Product) error {
	args := m.Called(product)
	return args.Error(0)
}

func (m *MockProductService) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockProductService) GetCategories() ([]string, error) {
	args := m.Called()
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockProductService) GetStats() (*domain.ProductStats, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ProductStats), args.Error(1)
}

func (m *MockProductService) GetLowStock(threshold int) ([]domain.Product, error) {
	args := m.Called(threshold)
	return args.Get(0).([]domain.Product), args.Error(1)
}

func (m *MockProductService) Search(query string, limit int) ([]domain.Product, error) {
	args := m.Called(query, limit)
	return args.Get(0).([]domain.Product), args.Error(1)
}

// MockSaleService simulates SaleService for testing
type MockSaleService struct {
	mock.Mock
}

func (m *MockSaleService) GetAll(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	args := m.Called(page, limit, search, status)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PaginatedSales), args.Error(1)
}

func (m *MockSaleService) GetByID(id string) (*domain.Sale, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Sale), args.Error(1)
}

func (m *MockSaleService) Create(sale *domain.Sale) error {
	args := m.Called(sale)
	return args.Error(0)
}

func (m *MockSaleService) ProcessReturn(saleID string) (*domain.Sale, error) {
	args := m.Called(saleID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Sale), args.Error(1)
}

func (m *MockSaleService) GetParkedSales() ([]domain.ParkedSale, error) {
	args := m.Called()
	return args.Get(0).([]domain.ParkedSale), args.Error(1)
}

func (m *MockSaleService) ParkSale(parked *domain.ParkedSale) error {
	args := m.Called(parked)
	return args.Error(0)
}

func (m *MockSaleService) DeleteParkedSale(id uint) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockSaleService) GetRecent(limit int) ([]domain.Sale, error) {
	args := m.Called(limit)
	return args.Get(0).([]domain.Sale), args.Error(1)
}

func (m *MockSaleService) CalculateInstallmentPlan(total, downPayment float64, months int) (*domain.InstallmentPlan, error) {
	args := m.Called(total, downPayment, months)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.InstallmentPlan), args.Error(1)
}

// MockCustomerService simulates CustomerService for testing
type MockCustomerService struct {
	mock.Mock
}

func (m *MockCustomerService) GetAll(page, limit int, search string) ([]domain.Customer, int64, error) {
	args := m.Called(page, limit, search)
	return args.Get(0).([]domain.Customer), args.Get(1).(int64), args.Error(2)
}

func (m *MockCustomerService) GetByID(id string) (*domain.Customer, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Customer), args.Error(1)
}

func (m *MockCustomerService) GetByPhone(phone string) (*domain.Customer, error) {
	args := m.Called(phone)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Customer), args.Error(1)
}

func (m *MockCustomerService) Create(customer *domain.Customer) error {
	args := m.Called(customer)
	return args.Error(0)
}

func (m *MockCustomerService) Update(customer *domain.Customer) error {
	args := m.Called(customer)
	return args.Error(0)
}

func (m *MockCustomerService) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

// MockStaffService simulates StaffService for testing
type MockStaffService struct {
	mock.Mock
}

func (m *MockStaffService) GetAll() ([]domain.Staff, error) {
	args := m.Called()
	return args.Get(0).([]domain.Staff), args.Error(1)
}

func (m *MockStaffService) GetByID(id string) (*domain.Staff, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Staff), args.Error(1)
}

func (m *MockStaffService) Authenticate(username, password string) (*domain.Staff, error) {
	args := m.Called(username, password)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Staff), args.Error(1)
}

func (m *MockStaffService) Create(staff *domain.Staff) error {
	args := m.Called(staff)
	return args.Error(0)
}

func (m *MockStaffService) Update(staff *domain.Staff) error {
	args := m.Called(staff)
	return args.Error(0)
}

func (m *MockStaffService) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

// MockFinanceService simulates FinanceService for testing
type MockFinanceService struct {
	mock.Mock
}

func (m *MockFinanceService) GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error) {
	args := m.Called(page, limit, category)
	return args.Get(0).([]domain.Expense), args.Get(1).(int64), args.Error(2)
}

func (m *MockFinanceService) CreateExpense(expense *domain.Expense) error {
	args := m.Called(expense)
	return args.Error(0)
}

func (m *MockFinanceService) UpdateExpense(expense *domain.Expense) error {
	args := m.Called(expense)
	return args.Error(0)
}

func (m *MockFinanceService) DeleteExpense(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockFinanceService) GetExpenseCategories() ([]string, error) {
	args := m.Called()
	return args.Get(0).([]string), args.Error(1)
}

func (m *MockFinanceService) GetDiscounts() ([]domain.Discount, error) {
	args := m.Called()
	return args.Get(0).([]domain.Discount), args.Error(1)
}

func (m *MockFinanceService) CreateDiscount(discount *domain.Discount) error {
	args := m.Called(discount)
	return args.Error(0)
}

func (m *MockFinanceService) CreatePayment(payment *domain.Payment) error {
	args := m.Called(payment)
	return args.Error(0)
}

func (m *MockFinanceService) GetPayments(saleID string) ([]domain.Payment, error) {
	args := m.Called(saleID)
	return args.Get(0).([]domain.Payment), args.Error(1)
}

// MockSettingsService simulates SettingsService for testing
type MockSettingsService struct {
	mock.Mock
}

func (m *MockSettingsService) GetPreferences() (*domain.AppPreferences, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.AppPreferences), args.Error(1)
}

func (m *MockSettingsService) UpdatePreferences(prefs *domain.AppPreferences) error {
	args := m.Called(prefs)
	return args.Error(0)
}

func (m *MockSettingsService) ResetDatabase() error {
	args := m.Called()
	return args.Error(0)
}

func (m *MockSettingsService) ExportDatabase() (*domain.DatabaseExport, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.DatabaseExport), args.Error(1)
}

func (m *MockSettingsService) ImportDatabase(data *domain.DatabaseExport) error {
	args := m.Called(data)
	return args.Error(0)
}

// MockStatsService simulates StatsService for testing
type MockStatsService struct {
	mock.Mock
}

func (m *MockStatsService) GetDashboardStats() (*domain.DashboardStats, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.DashboardStats), args.Error(1)
}

// MockShiftService simulates ShiftService for testing
type MockShiftService struct {
	mock.Mock
}

func (m *MockShiftService) GetActiveShift(staffID string) (*domain.Shift, error) {
	args := m.Called(staffID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Shift), args.Error(1)
}

func (m *MockShiftService) StartShift(staffID, staffName string, startCash float64) (*domain.Shift, error) {
	args := m.Called(staffID, staffName, startCash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Shift), args.Error(1)
}

func (m *MockShiftService) CloseShift(shiftID string, endCash float64) (*domain.Shift, error) {
	args := m.Called(shiftID, endCash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Shift), args.Error(1)
}

func (m *MockShiftService) AddCashMovement(shiftID, staffID, movementType, reason string, amount float64) error {
	args := m.Called(shiftID, staffID, movementType, reason, amount)
	return args.Error(0)
}

func (m *MockShiftService) GetCashMovements(shiftID string) ([]domain.CashMovement, error) {
	args := m.Called(shiftID)
	return args.Get(0).([]domain.CashMovement), args.Error(1)
}

// MockSupplierService simulates SupplierService for testing
type MockSupplierService struct {
	mock.Mock
}

func (m *MockSupplierService) GetAll() ([]domain.Supplier, error) {
	args := m.Called()
	return args.Get(0).([]domain.Supplier), args.Error(1)
}

func (m *MockSupplierService) GetByID(id string) (*domain.Supplier, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Supplier), args.Error(1)
}

func (m *MockSupplierService) Create(supplier *domain.Supplier) error {
	args := m.Called(supplier)
	return args.Error(0)
}

func (m *MockSupplierService) Update(supplier *domain.Supplier) error {
	args := m.Called(supplier)
	return args.Error(0)
}

func (m *MockSupplierService) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

// MockPurchaseOrderService simulates PurchaseOrderService for testing
type MockPurchaseOrderService struct {
	mock.Mock
}

func (m *MockPurchaseOrderService) GetAll(page, limit int, status string) (*domain.PaginatedResponse[domain.PurchaseOrder], error) {
	args := m.Called(page, limit, status)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PaginatedResponse[domain.PurchaseOrder]), args.Error(1)
}

func (m *MockPurchaseOrderService) GetByID(id string) (*domain.PurchaseOrder, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.PurchaseOrder), args.Error(1)
}

func (m *MockPurchaseOrderService) Create(order *domain.PurchaseOrder) error {
	args := m.Called(order)
	return args.Error(0)
}

func (m *MockPurchaseOrderService) Update(order *domain.PurchaseOrder) error {
	args := m.Called(order)
	return args.Error(0)
}

func (m *MockPurchaseOrderService) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockPurchaseOrderService) ReceiveOrder(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

type MockLoyaltyRepository struct {
	mock.Mock
}

func (m *MockLoyaltyRepository) GetTiers() ([]domain.LoyaltyTier, error) {
	args := m.Called()
	return args.Get(0).([]domain.LoyaltyTier), args.Error(1)
}
func (m *MockLoyaltyRepository) CreateTier(tier *domain.LoyaltyTier) error {
	args := m.Called(tier)
	return args.Error(0)
}
func (m *MockLoyaltyRepository) UpdateTier(tier *domain.LoyaltyTier) error {
	args := m.Called(tier)
	return args.Error(0)
}
func (m *MockLoyaltyRepository) DeleteTier(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockLoyaltyRepository) GetRules() ([]domain.LoyaltyRule, error) {
	args := m.Called()
	return args.Get(0).([]domain.LoyaltyRule), args.Error(1)
}
func (m *MockLoyaltyRepository) CreateRule(rule *domain.LoyaltyRule) error {
	args := m.Called(rule)
	return args.Error(0)
}
func (m *MockLoyaltyRepository) UpdateRule(rule *domain.LoyaltyRule) error {
	args := m.Called(rule)
	return args.Error(0)
}
func (m *MockLoyaltyRepository) GetActiveRule() (*domain.LoyaltyRule, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.LoyaltyRule), args.Error(1)
}
func (m *MockLoyaltyRepository) CreateTransaction(tx *domain.LoyaltyTransaction) error {
	args := m.Called(tx)
	return args.Error(0)
}
func (m *MockLoyaltyRepository) GetTransactionsByCustomer(customerID string) ([]domain.LoyaltyTransaction, error) {
	args := m.Called(customerID)
	return args.Get(0).([]domain.LoyaltyTransaction), args.Error(1)
}
func (m *MockLoyaltyRepository) CreateRedemption(redemption *domain.LoyaltyRedemption) error {
	args := m.Called(redemption)
	return args.Error(0)
}
func (m *MockLoyaltyRepository) GetRedemptionsByCustomer(customerID string) ([]domain.LoyaltyRedemption, error) {
	args := m.Called(customerID)
	return args.Get(0).([]domain.LoyaltyRedemption), args.Error(1)
}

type MockNotificationRepository struct {
	mock.Mock
}

func (m *MockNotificationRepository) GetTemplates() ([]domain.NotificationTemplate, error) {
	args := m.Called()
	return args.Get(0).([]domain.NotificationTemplate), args.Error(1)
}
func (m *MockNotificationRepository) CreateTemplate(t *domain.NotificationTemplate) error {
	args := m.Called(t)
	return args.Error(0)
}
func (m *MockNotificationRepository) UpdateTemplate(t *domain.NotificationTemplate) error {
	args := m.Called(t)
	return args.Error(0)
}
func (m *MockNotificationRepository) DeleteTemplate(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockNotificationRepository) GetSettings() (*domain.NotificationSettings, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.NotificationSettings), args.Error(1)
}
func (m *MockNotificationRepository) UpdateSettings(s *domain.NotificationSettings) error {
	args := m.Called(s)
	return args.Error(0)
}
func (m *MockNotificationRepository) CreateLog(log *domain.NotificationLog) error {
	args := m.Called(log)
	return args.Error(0)
}
func (m *MockNotificationRepository) GetLogs(page, limit int) ([]domain.NotificationLog, int64, error) {
	args := m.Called(page, limit)
	return args.Get(0).([]domain.NotificationLog), args.Get(1).(int64), args.Error(2)
}

type MockBranchRepository struct {
	mock.Mock
}

func (m *MockBranchRepository) GetAll() ([]domain.Branch, error) {
	args := m.Called()
	return args.Get(0).([]domain.Branch), args.Error(1)
}
func (m *MockBranchRepository) GetByID(id string) (*domain.Branch, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Branch), args.Error(1)
}
func (m *MockBranchRepository) Create(branch *domain.Branch) error {
	args := m.Called(branch)
	return args.Error(0)
}
func (m *MockBranchRepository) Update(branch *domain.Branch) error {
	args := m.Called(branch)
	return args.Error(0)
}
func (m *MockBranchRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockBranchRepository) CreateStockTransfer(transfer *domain.StockTransfer) error {
	args := m.Called(transfer)
	return args.Error(0)
}
func (m *MockBranchRepository) GetStockTransfers(page, limit int, status string) ([]domain.StockTransfer, int64, error) {
	args := m.Called(page, limit, status)
	return args.Get(0).([]domain.StockTransfer), args.Get(1).(int64), args.Error(2)
}
func (m *MockBranchRepository) GetStockTransferByID(id string) (*domain.StockTransfer, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.StockTransfer), args.Error(1)
}
func (m *MockBranchRepository) UpdateStockTransferStatus(id, status string) error {
	args := m.Called(id, status)
	return args.Error(0)
}

type MockKitRepository struct {
	mock.Mock
}

func (m *MockKitRepository) GetAll() ([]domain.ProductKit, error) {
	args := m.Called()
	return args.Get(0).([]domain.ProductKit), args.Error(1)
}
func (m *MockKitRepository) GetByID(id string) (*domain.ProductKit, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ProductKit), args.Error(1)
}
func (m *MockKitRepository) Create(kit *domain.ProductKit) error {
	args := m.Called(kit)
	return args.Error(0)
}
func (m *MockKitRepository) Update(kit *domain.ProductKit) error {
	args := m.Called(kit)
	return args.Error(0)
}
func (m *MockKitRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

type MockRecurringInvoiceRepository struct {
	mock.Mock
}

func (m *MockRecurringInvoiceRepository) GetAll(page, limit int, status string) ([]domain.RecurringInvoice, int64, error) {
	args := m.Called(page, limit, status)
	return args.Get(0).([]domain.RecurringInvoice), args.Get(1).(int64), args.Error(2)
}
func (m *MockRecurringInvoiceRepository) GetByID(id string) (*domain.RecurringInvoice, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.RecurringInvoice), args.Error(1)
}
func (m *MockRecurringInvoiceRepository) Create(invoice *domain.RecurringInvoice) error {
	args := m.Called(invoice)
	return args.Error(0)
}
func (m *MockRecurringInvoiceRepository) Update(invoice *domain.RecurringInvoice) error {
	args := m.Called(invoice)
	return args.Error(0)
}
func (m *MockRecurringInvoiceRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockRecurringInvoiceRepository) GetDueInvoices() ([]domain.RecurringInvoice, error) {
	args := m.Called()
	return args.Get(0).([]domain.RecurringInvoice), args.Error(1)
}
func (m *MockRecurringInvoiceRepository) MarkRun(id string, saleID string) error {
	args := m.Called(id, saleID)
	return args.Error(0)
}

type MockGiftCardRepository struct {
	mock.Mock
}

func (m *MockGiftCardRepository) GetAll(page, limit int) ([]domain.GiftCard, int64, error) {
	args := m.Called(page, limit)
	return args.Get(0).([]domain.GiftCard), args.Get(1).(int64), args.Error(2)
}
func (m *MockGiftCardRepository) GetByID(id string) (*domain.GiftCard, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.GiftCard), args.Error(1)
}
func (m *MockGiftCardRepository) GetByCode(code string) (*domain.GiftCard, error) {
	args := m.Called(code)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.GiftCard), args.Error(1)
}
func (m *MockGiftCardRepository) Create(card *domain.GiftCard) error {
	args := m.Called(card)
	return args.Error(0)
}
func (m *MockGiftCardRepository) Update(card *domain.GiftCard) error {
	args := m.Called(card)
	return args.Error(0)
}
func (m *MockGiftCardRepository) Delete(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockGiftCardRepository) CreateTransaction(tx *domain.GiftCardTransaction) error {
	args := m.Called(tx)
	return args.Error(0)
}
func (m *MockGiftCardRepository) GetTransactions(cardID string) ([]domain.GiftCardTransaction, error) {
	args := m.Called(cardID)
	return args.Get(0).([]domain.GiftCardTransaction), args.Error(1)
}
func (m *MockGiftCardRepository) GetVouchers() ([]domain.Voucher, error) {
	args := m.Called()
	return args.Get(0).([]domain.Voucher), args.Error(1)
}
func (m *MockGiftCardRepository) GetVoucherByCode(code string) (*domain.Voucher, error) {
	args := m.Called(code)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Voucher), args.Error(1)
}
func (m *MockGiftCardRepository) CreateVoucher(v *domain.Voucher) error {
	args := m.Called(v)
	return args.Error(0)
}
func (m *MockGiftCardRepository) UpdateVoucher(v *domain.Voucher) error {
	args := m.Called(v)
	return args.Error(0)
}
func (m *MockGiftCardRepository) DeleteVoucher(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockGiftCardRepository) IncrementVoucherUsage(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

type MockKitchenRepository struct {
	mock.Mock
}

func (m *MockKitchenRepository) GetPendingOrders() ([]domain.KitchenOrder, error) {
	args := m.Called()
	return args.Get(0).([]domain.KitchenOrder), args.Error(1)
}
func (m *MockKitchenRepository) GetOrderByID(id string) (*domain.KitchenOrder, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.KitchenOrder), args.Error(1)
}
func (m *MockKitchenRepository) GetOrderBySaleID(saleID string) (*domain.KitchenOrder, error) {
	args := m.Called(saleID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.KitchenOrder), args.Error(1)
}
func (m *MockKitchenRepository) CreateOrder(order *domain.KitchenOrder) error {
	args := m.Called(order)
	return args.Error(0)
}
func (m *MockKitchenRepository) UpdateOrder(order *domain.KitchenOrder) error {
	args := m.Called(order)
	return args.Error(0)
}
func (m *MockKitchenRepository) UpdateOrderItemStatus(orderID string, itemID uint, status string) error {
	args := m.Called(orderID, itemID, status)
	return args.Error(0)
}
func (m *MockKitchenRepository) GetStations() ([]domain.KitchenStation, error) {
	args := m.Called()
	return args.Get(0).([]domain.KitchenStation), args.Error(1)
}
func (m *MockKitchenRepository) CreateStation(station *domain.KitchenStation) error {
	args := m.Called(station)
	return args.Error(0)
}
func (m *MockKitchenRepository) UpdateStation(station *domain.KitchenStation) error {
	args := m.Called(station)
	return args.Error(0)
}
func (m *MockKitchenRepository) DeleteStation(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

type MockWalletRepository struct {
	mock.Mock
}

func (m *MockWalletRepository) GetByCustomerID(customerID string) (*domain.CustomerWallet, error) {
	args := m.Called(customerID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.CustomerWallet), args.Error(1)
}
func (m *MockWalletRepository) Create(wallet *domain.CustomerWallet) error {
	args := m.Called(wallet)
	return args.Error(0)
}
func (m *MockWalletRepository) Update(wallet *domain.CustomerWallet) error {
	args := m.Called(wallet)
	return args.Error(0)
}
func (m *MockWalletRepository) CreateTransaction(tx *domain.WalletTransaction) error {
	args := m.Called(tx)
	return args.Error(0)
}
func (m *MockWalletRepository) GetTransactions(customerID string, page, limit int) ([]domain.WalletTransaction, int64, error) {
	args := m.Called(customerID, page, limit)
	return args.Get(0).([]domain.WalletTransaction), args.Get(1).(int64), args.Error(2)
}

type MockStockAdjustmentRepository struct {
	mock.Mock
}

func (m *MockStockAdjustmentRepository) CreateAdjustment(adj *domain.StockAdjustment) error {
	args := m.Called(adj)
	return args.Error(0)
}
func (m *MockStockAdjustmentRepository) GetAdjustments(page, limit int, adjType string) ([]domain.StockAdjustment, int64, error) {
	args := m.Called(page, limit, adjType)
	return args.Get(0).([]domain.StockAdjustment), args.Get(1).(int64), args.Error(2)
}
func (m *MockStockAdjustmentRepository) CreateWasteRecord(record *domain.WasteRecord) error {
	args := m.Called(record)
	return args.Error(0)
}
func (m *MockStockAdjustmentRepository) GetWasteRecords(page, limit int, wasteType string) ([]domain.WasteRecord, int64, error) {
	args := m.Called(page, limit, wasteType)
	return args.Get(0).([]domain.WasteRecord), args.Get(1).(int64), args.Error(2)
}
func (m *MockStockAdjustmentRepository) GetWasteSummary(startDate, endDate string) ([]domain.WasteRecord, error) {
	args := m.Called(startDate, endDate)
	return args.Get(0).([]domain.WasteRecord), args.Error(1)
}

type MockCurrencyRepository struct{ mock.Mock }

func (m *MockCurrencyRepository) GetAll() ([]domain.Currency, error) {
	args := m.Called()
	return args.Get(0).([]domain.Currency), args.Error(1)
}
func (m *MockCurrencyRepository) GetByID(id string) (*domain.Currency, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Currency), args.Error(1)
}
func (m *MockCurrencyRepository) GetByCode(code string) (*domain.Currency, error) {
	args := m.Called(code)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Currency), args.Error(1)
}
func (m *MockCurrencyRepository) Create(c *domain.Currency) error {
	args := m.Called(c)
	return args.Error(0)
}
func (m *MockCurrencyRepository) Update(c *domain.Currency) error {
	args := m.Called(c)
	return args.Error(0)
}
func (m *MockCurrencyRepository) Delete(id string) error { args := m.Called(id); return args.Error(0) }
func (m *MockCurrencyRepository) CreateTransaction(tx *domain.CurrencyTransaction) error {
	args := m.Called(tx)
	return args.Error(0)
}
func (m *MockCurrencyRepository) GetTransactions(saleID string) ([]domain.CurrencyTransaction, error) {
	args := m.Called(saleID)
	return args.Get(0).([]domain.CurrencyTransaction), args.Error(1)
}
func (m *MockCurrencyRepository) GetBaseCurrency() (*domain.Currency, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Currency), args.Error(1)
}

type MockMessagingRepository struct{ mock.Mock }

func (m *MockMessagingRepository) GetProviders() ([]domain.MessagingProvider, error) {
	args := m.Called()
	return args.Get(0).([]domain.MessagingProvider), args.Error(1)
}
func (m *MockMessagingRepository) GetProviderByID(id string) (*domain.MessagingProvider, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.MessagingProvider), args.Error(1)
}
func (m *MockMessagingRepository) CreateProvider(p *domain.MessagingProvider) error {
	args := m.Called(p)
	return args.Error(0)
}
func (m *MockMessagingRepository) UpdateProvider(p *domain.MessagingProvider) error {
	args := m.Called(p)
	return args.Error(0)
}
func (m *MockMessagingRepository) DeleteProvider(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockMessagingRepository) GetTemplates() ([]domain.MessageTemplate, error) {
	args := m.Called()
	return args.Get(0).([]domain.MessageTemplate), args.Error(1)
}
func (m *MockMessagingRepository) CreateTemplate(t *domain.MessageTemplate) error {
	args := m.Called(t)
	return args.Error(0)
}
func (m *MockMessagingRepository) UpdateTemplate(t *domain.MessageTemplate) error {
	args := m.Called(t)
	return args.Error(0)
}
func (m *MockMessagingRepository) DeleteTemplate(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockMessagingRepository) CreateLog(l *domain.MessageLog) error {
	args := m.Called(l)
	return args.Error(0)
}
func (m *MockMessagingRepository) GetLogs(page, limit int) ([]domain.MessageLog, int64, error) {
	args := m.Called(page, limit)
	return args.Get(0).([]domain.MessageLog), args.Get(1).(int64), args.Error(2)
}

type MockCommissionRepository struct{ mock.Mock }

func (m *MockCommissionRepository) GetRules() ([]domain.CommissionRule, error) {
	args := m.Called()
	return args.Get(0).([]domain.CommissionRule), args.Error(1)
}
func (m *MockCommissionRepository) GetRuleByID(id string) (*domain.CommissionRule, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.CommissionRule), args.Error(1)
}
func (m *MockCommissionRepository) CreateRule(r *domain.CommissionRule) error {
	args := m.Called(r)
	return args.Error(0)
}
func (m *MockCommissionRepository) UpdateRule(r *domain.CommissionRule) error {
	args := m.Called(r)
	return args.Error(0)
}
func (m *MockCommissionRepository) DeleteRule(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockCommissionRepository) CreatePayment(p *domain.CommissionPayment) error {
	args := m.Called(p)
	return args.Error(0)
}
func (m *MockCommissionRepository) GetPaymentsByStaff(staffID string) ([]domain.CommissionPayment, error) {
	args := m.Called(staffID)
	return args.Get(0).([]domain.CommissionPayment), args.Error(1)
}
func (m *MockCommissionRepository) GetPaymentsByPeriod(s, e string) ([]domain.CommissionPayment, error) {
	args := m.Called(s, e)
	return args.Get(0).([]domain.CommissionPayment), args.Error(1)
}
func (m *MockCommissionRepository) UpdatePaymentStatus(id uint, status string) error {
	args := m.Called(id, status)
	return args.Error(0)
}

type MockSegmentRepository struct{ mock.Mock }

func (m *MockSegmentRepository) GetSegments() ([]domain.CustomerSegment, error) {
	args := m.Called()
	return args.Get(0).([]domain.CustomerSegment), args.Error(1)
}
func (m *MockSegmentRepository) GetSegmentByID(id string) (*domain.CustomerSegment, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.CustomerSegment), args.Error(1)
}
func (m *MockSegmentRepository) CreateSegment(s *domain.CustomerSegment) error {
	args := m.Called(s)
	return args.Error(0)
}
func (m *MockSegmentRepository) UpdateSegment(s *domain.CustomerSegment) error {
	args := m.Called(s)
	return args.Error(0)
}
func (m *MockSegmentRepository) DeleteSegment(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockSegmentRepository) AddMember(m2 *domain.CustomerSegmentMember) error {
	args := m.Called(m2)
	return args.Error(0)
}
func (m *MockSegmentRepository) RemoveMember(s, c string) error {
	args := m.Called(s, c)
	return args.Error(0)
}
func (m *MockSegmentRepository) GetSegmentMembers(s string) ([]domain.CustomerSegmentMember, error) {
	args := m.Called(s)
	return args.Get(0).([]domain.CustomerSegmentMember), args.Error(1)
}
func (m *MockSegmentRepository) GetCampaigns() ([]domain.Campaign, error) {
	args := m.Called()
	return args.Get(0).([]domain.Campaign), args.Error(1)
}
func (m *MockSegmentRepository) GetCampaignByID(id string) (*domain.Campaign, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Campaign), args.Error(1)
}
func (m *MockSegmentRepository) CreateCampaign(c *domain.Campaign) error {
	args := m.Called(c)
	return args.Error(0)
}
func (m *MockSegmentRepository) UpdateCampaign(c *domain.Campaign) error {
	args := m.Called(c)
	return args.Error(0)
}
func (m *MockSegmentRepository) DeleteCampaign(id string) error {
	args := m.Called(id)
	return args.Error(0)
}

type MockTaxRepository struct{ mock.Mock }

func (m *MockTaxRepository) GetTaxRates() ([]domain.TaxRate, error) {
	args := m.Called()
	return args.Get(0).([]domain.TaxRate), args.Error(1)
}
func (m *MockTaxRepository) GetTaxRateByID(id string) (*domain.TaxRate, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.TaxRate), args.Error(1)
}
func (m *MockTaxRepository) GetTaxRateByCode(code string) (*domain.TaxRate, error) {
	args := m.Called(code)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.TaxRate), args.Error(1)
}
func (m *MockTaxRepository) CreateTaxRate(r *domain.TaxRate) error {
	args := m.Called(r)
	return args.Error(0)
}
func (m *MockTaxRepository) UpdateTaxRate(r *domain.TaxRate) error {
	args := m.Called(r)
	return args.Error(0)
}
func (m *MockTaxRepository) DeleteTaxRate(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockTaxRepository) CreateProductTax(p *domain.ProductTax) error {
	args := m.Called(p)
	return args.Error(0)
}
func (m *MockTaxRepository) DeleteProductTax(pID, tID string) error {
	args := m.Called(pID, tID)
	return args.Error(0)
}
func (m *MockTaxRepository) GetProductTaxes(pID string) ([]domain.ProductTax, error) {
	args := m.Called(pID)
	return args.Get(0).([]domain.ProductTax), args.Error(1)
}
func (m *MockTaxRepository) GetDefaultTaxRate() (*domain.TaxRate, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.TaxRate), args.Error(1)
}

type MockKioskRepository struct{ mock.Mock }

func (m *MockKioskRepository) GetLayouts() ([]domain.KioskLayout, error) {
	args := m.Called()
	return args.Get(0).([]domain.KioskLayout), args.Error(1)
}
func (m *MockKioskRepository) GetLayoutByID(id string) (*domain.KioskLayout, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.KioskLayout), args.Error(1)
}
func (m *MockKioskRepository) CreateLayout(l *domain.KioskLayout) error {
	args := m.Called(l)
	return args.Error(0)
}
func (m *MockKioskRepository) UpdateLayout(l *domain.KioskLayout) error {
	args := m.Called(l)
	return args.Error(0)
}
func (m *MockKioskRepository) DeleteLayout(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockKioskRepository) CreateSession(s *domain.KioskSession) error {
	args := m.Called(s)
	return args.Error(0)
}
func (m *MockKioskRepository) UpdateSession(s *domain.KioskSession) error {
	args := m.Called(s)
	return args.Error(0)
}
func (m *MockKioskRepository) GetActiveSessions() ([]domain.KioskSession, error) {
	args := m.Called()
	return args.Get(0).([]domain.KioskSession), args.Error(1)
}

type MockDeliveryRepository struct{ mock.Mock }

func (m *MockDeliveryRepository) GetDrivers() ([]domain.DeliveryDriver, error) {
	args := m.Called()
	return args.Get(0).([]domain.DeliveryDriver), args.Error(1)
}
func (m *MockDeliveryRepository) GetDriverByID(id string) (*domain.DeliveryDriver, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.DeliveryDriver), args.Error(1)
}
func (m *MockDeliveryRepository) CreateDriver(d *domain.DeliveryDriver) error {
	args := m.Called(d)
	return args.Error(0)
}
func (m *MockDeliveryRepository) UpdateDriver(d *domain.DeliveryDriver) error {
	args := m.Called(d)
	return args.Error(0)
}
func (m *MockDeliveryRepository) DeleteDriver(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockDeliveryRepository) GetOrders(page, limit int, status string) ([]domain.DeliveryOrder, int64, error) {
	args := m.Called(page, limit, status)
	return args.Get(0).([]domain.DeliveryOrder), args.Get(1).(int64), args.Error(2)
}
func (m *MockDeliveryRepository) GetOrderByID(id string) (*domain.DeliveryOrder, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.DeliveryOrder), args.Error(1)
}
func (m *MockDeliveryRepository) GetOrderBySaleID(s string) (*domain.DeliveryOrder, error) {
	args := m.Called(s)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.DeliveryOrder), args.Error(1)
}
func (m *MockDeliveryRepository) CreateOrder(o *domain.DeliveryOrder) error {
	args := m.Called(o)
	return args.Error(0)
}
func (m *MockDeliveryRepository) UpdateOrder(o *domain.DeliveryOrder) error {
	args := m.Called(o)
	return args.Error(0)
}

type MockReorderRepository struct{ mock.Mock }

func (m *MockReorderRepository) GetRules() ([]domain.ReorderRule, error) {
	args := m.Called()
	return args.Get(0).([]domain.ReorderRule), args.Error(1)
}
func (m *MockReorderRepository) GetRuleByID(id string) (*domain.ReorderRule, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ReorderRule), args.Error(1)
}
func (m *MockReorderRepository) GetRuleByProductID(p string) (*domain.ReorderRule, error) {
	args := m.Called(p)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ReorderRule), args.Error(1)
}
func (m *MockReorderRepository) CreateRule(r *domain.ReorderRule) error {
	args := m.Called(r)
	return args.Error(0)
}
func (m *MockReorderRepository) UpdateRule(r *domain.ReorderRule) error {
	args := m.Called(r)
	return args.Error(0)
}
func (m *MockReorderRepository) DeleteRule(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockReorderRepository) GetAlerts() ([]domain.ReorderAlert, error) {
	args := m.Called()
	return args.Get(0).([]domain.ReorderAlert), args.Error(1)
}

type MockBudgetRepository struct{ mock.Mock }

func (m *MockBudgetRepository) GetBudgets() ([]domain.Budget, error) {
	args := m.Called()
	return args.Get(0).([]domain.Budget), args.Error(1)
}
func (m *MockBudgetRepository) GetBudgetByID(id string) (*domain.Budget, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Budget), args.Error(1)
}
func (m *MockBudgetRepository) CreateBudget(b *domain.Budget) error {
	args := m.Called(b)
	return args.Error(0)
}
func (m *MockBudgetRepository) UpdateBudget(b *domain.Budget) error {
	args := m.Called(b)
	return args.Error(0)
}
func (m *MockBudgetRepository) DeleteBudget(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockBudgetRepository) CreateExpenseApproval(a *domain.ExpenseApproval) error {
	args := m.Called(a)
	return args.Error(0)
}
func (m *MockBudgetRepository) GetExpenseApprovals(e string) ([]domain.ExpenseApproval, error) {
	args := m.Called(e)
	return args.Get(0).([]domain.ExpenseApproval), args.Error(1)
}
func (m *MockBudgetRepository) GetApprovalWorkflows() ([]domain.ApprovalWorkflow, error) {
	args := m.Called()
	return args.Get(0).([]domain.ApprovalWorkflow), args.Error(1)
}
func (m *MockBudgetRepository) CreateApprovalWorkflow(w *domain.ApprovalWorkflow) error {
	args := m.Called(w)
	return args.Error(0)
}
func (m *MockBudgetRepository) UpdateApprovalWorkflow(w *domain.ApprovalWorkflow) error {
	args := m.Called(w)
	return args.Error(0)
}
func (m *MockBudgetRepository) DeleteApprovalWorkflow(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockBudgetRepository) GetSpentForBudget(id string) (float64, error) {
	args := m.Called(id)
	return args.Get(0).(float64), args.Error(1)
}

type MockReportBuilderRepository struct{ mock.Mock }

func (m *MockReportBuilderRepository) GetTemplates() ([]domain.ReportTemplate, error) {
	args := m.Called()
	return args.Get(0).([]domain.ReportTemplate), args.Error(1)
}
func (m *MockReportBuilderRepository) GetTemplateByID(id string) (*domain.ReportTemplate, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.ReportTemplate), args.Error(1)
}
func (m *MockReportBuilderRepository) CreateTemplate(t *domain.ReportTemplate) error {
	args := m.Called(t)
	return args.Error(0)
}
func (m *MockReportBuilderRepository) UpdateTemplate(t *domain.ReportTemplate) error {
	args := m.Called(t)
	return args.Error(0)
}
func (m *MockReportBuilderRepository) DeleteTemplate(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockReportBuilderRepository) GetScheduledExports() ([]domain.ScheduledExport, error) {
	args := m.Called()
	return args.Get(0).([]domain.ScheduledExport), args.Error(1)
}
func (m *MockReportBuilderRepository) CreateScheduledExport(e *domain.ScheduledExport) error {
	args := m.Called(e)
	return args.Error(0)
}
func (m *MockReportBuilderRepository) UpdateScheduledExport(e *domain.ScheduledExport) error {
	args := m.Called(e)
	return args.Error(0)
}
func (m *MockReportBuilderRepository) DeleteScheduledExport(id string) error {
	args := m.Called(id)
	return args.Error(0)
}
func (m *MockReportBuilderRepository) GetDueExports() ([]domain.ScheduledExport, error) {
	args := m.Called()
	return args.Get(0).([]domain.ScheduledExport), args.Error(1)
}
