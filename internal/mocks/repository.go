package mocks

import (
	"bard/internal/domain"
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
