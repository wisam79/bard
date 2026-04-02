package mocks

import (
	"bard/internal/domain"
	"errors"
)

// ─── MockProductRepository ───────────────────────────────────────────────────

type MockProductRepository struct {
	Products map[string]*domain.Product
	Err      error
}

func NewMockProductRepository() *MockProductRepository {
	return &MockProductRepository{
		Products: make(map[string]*domain.Product),
	}
}

func (m *MockProductRepository) GetAll(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var items []domain.Product
	for _, p := range m.Products {
		items = append(items, *p)
	}
	return &domain.PaginatedProducts{Data: items, Total: int64(len(items))}, nil
}

func (m *MockProductRepository) GetByID(id string) (*domain.Product, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	p, ok := m.Products[id]
	if !ok {
		return nil, errors.New("product not found")
	}
	return p, nil
}

func (m *MockProductRepository) GetByBarcode(barcode string) (*domain.Product, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	for _, p := range m.Products {
		if p.Barcode == barcode {
			return p, nil
		}
	}
	return nil, errors.New("product not found by barcode")
}

func (m *MockProductRepository) Create(product *domain.Product) error {
	if m.Err != nil {
		return m.Err
	}
	m.Products[product.ID] = product
	return nil
}

func (m *MockProductRepository) Update(product *domain.Product) error {
	if m.Err != nil {
		return m.Err
	}
	m.Products[product.ID] = product
	return nil
}

func (m *MockProductRepository) Delete(id string) error {
	if m.Err != nil {
		return m.Err
	}
	delete(m.Products, id)
	return nil
}

func (m *MockProductRepository) GetCategories() ([]string, error) {
	return []string{"test"}, m.Err
}

func (m *MockProductRepository) CreateCategory(cat *domain.Category) error {
	return m.Err
}

func (m *MockProductRepository) GetStats() (*domain.ProductStats, error) {
	return &domain.ProductStats{}, m.Err
}

func (m *MockProductRepository) GetLowStock(threshold int) ([]domain.Product, error) {
	return nil, m.Err
}

func (m *MockProductRepository) Search(query string, limit int) ([]domain.Product, error) {
	return nil, m.Err
}

// ─── MockSaleRepository ──────────────────────────────────────────────────────

type MockSaleRepository struct {
	Sales          map[string]*domain.Sale
	ParkedSales    []domain.ParkedSale
	Err            error
	TransactionErr error // if set, CreateSaleWithStockUpdate returns this
}

func NewMockSaleRepository() *MockSaleRepository {
	return &MockSaleRepository{
		Sales: make(map[string]*domain.Sale),
	}
}

func (m *MockSaleRepository) GetAll(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	var items []domain.Sale
	for _, s := range m.Sales {
		items = append(items, *s)
	}
	return &domain.PaginatedSales{Data: items, Total: int64(len(items))}, nil
}

func (m *MockSaleRepository) GetByID(id string) (*domain.Sale, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	s, ok := m.Sales[id]
	if !ok {
		return nil, errors.New("sale not found")
	}
	return s, nil
}

func (m *MockSaleRepository) Create(sale *domain.Sale) error {
	if m.Err != nil {
		return m.Err
	}
	m.Sales[sale.ID] = sale
	return nil
}

func (m *MockSaleRepository) CreateSaleWithStockUpdate(sale *domain.Sale) error {
	if m.TransactionErr != nil {
		return m.TransactionErr
	}
	if m.Err != nil {
		return m.Err
	}
	m.Sales[sale.ID] = sale
	return nil
}

func (m *MockSaleRepository) Update(sale *domain.Sale) error {
	if m.Err != nil {
		return m.Err
	}
	m.Sales[sale.ID] = sale
	return nil
}

func (m *MockSaleRepository) GetByCustomerID(customerID string, page, limit int) (*domain.PaginatedSales, error) {
	return &domain.PaginatedSales{}, m.Err
}

func (m *MockSaleRepository) GetByDateRange(startDate, endDate string) ([]domain.Sale, error) {
	return nil, m.Err
}

func (m *MockSaleRepository) GetRecent(limit int) ([]domain.Sale, error) {
	return nil, m.Err
}

func (m *MockSaleRepository) GetStats(startDate, endDate string) (*domain.InvoiceStats, error) {
	return &domain.InvoiceStats{}, m.Err
}

func (m *MockSaleRepository) CreateParkedSale(parked *domain.ParkedSale) error {
	m.ParkedSales = append(m.ParkedSales, *parked)
	return m.Err
}

func (m *MockSaleRepository) GetParkedSales() ([]domain.ParkedSale, error) {
	return m.ParkedSales, m.Err
}

func (m *MockSaleRepository) DeleteParkedSale(id uint) error {
	return m.Err
}

func (m *MockSaleRepository) GetTopProducts(limit int, startDate, endDate string) ([]domain.TopProduct, error) {
	return nil, m.Err
}

// ─── MockCustomerRepository ──────────────────────────────────────────────────

type MockCustomerRepository struct {
	Customers map[string]*domain.Customer
	Err       error
}

func NewMockCustomerRepository() *MockCustomerRepository {
	return &MockCustomerRepository{
		Customers: make(map[string]*domain.Customer),
	}
}

func (m *MockCustomerRepository) GetAll(page, limit int, search string) ([]domain.Customer, int64, error) {
	if m.Err != nil {
		return nil, 0, m.Err
	}
	var items []domain.Customer
	for _, c := range m.Customers {
		items = append(items, *c)
	}
	return items, int64(len(items)), nil
}

func (m *MockCustomerRepository) GetByID(id string) (*domain.Customer, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	c, ok := m.Customers[id]
	if !ok {
		return nil, errors.New("customer not found")
	}
	return c, nil
}

func (m *MockCustomerRepository) GetByPhone(phone string) (*domain.Customer, error) {
	return nil, m.Err
}

func (m *MockCustomerRepository) Create(customer *domain.Customer) error {
	if m.Err != nil {
		return m.Err
	}
	m.Customers[customer.ID] = customer
	return nil
}

func (m *MockCustomerRepository) Update(customer *domain.Customer) error {
	if m.Err != nil {
		return m.Err
	}
	m.Customers[customer.ID] = customer
	return nil
}

func (m *MockCustomerRepository) Delete(id string) error {
	delete(m.Customers, id)
	return m.Err
}

func (m *MockCustomerRepository) UpdateDebt(id string, amount float64) error {
	return m.Err
}

func (m *MockCustomerRepository) UpdateInstallmentDebt(id string, amount float64) error {
	return m.Err
}

func (m *MockCustomerRepository) GetTop(limit int) ([]domain.Customer, error) {
	return nil, m.Err
}

// ─── MockStatsRepository ─────────────────────────────────────────────────────

type MockStatsRepository struct {
	Stats *domain.DashboardStats
	Err   error
}

func (m *MockStatsRepository) GetDashboardStats() (*domain.DashboardStats, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	if m.Stats == nil {
		return &domain.DashboardStats{}, nil
	}
	return m.Stats, nil
}
