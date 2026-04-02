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
