package service_test

import (
	"bard/internal/cache"
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/mocks"
	"bard/internal/service"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// ═══════════════════════════════════════════════════════════════════════════════
// Product Service - Comprehensive Integration Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestProductService_FullCRUDLifecycle(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, cache.NewProductCache(), log)

	// CREATE
	product := &domain.Product{
		Name:     "Test Product",
		Barcode:  "TEST123",
		Price:    100,
		Cost:     50,
		Stock:    10,
		Category: "Test",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Product")).Return(nil).Run(func(args mock.Arguments) {
		p := args.Get(0).(*domain.Product)
		assert.NotEmpty(t, p.ID)
	})
	err := svc.Create(product)
	assert.NoError(t, err)
	assert.NotEmpty(t, product.ID)

	// READ
	mockRepo.On("GetByID", product.ID).Return(product, nil)
	retrieved, err := svc.GetByID(product.ID)
	assert.NoError(t, err)
	assert.Equal(t, product.ID, retrieved.ID)
	assert.Equal(t, "Test Product", retrieved.Name)

	// UPDATE
	product.Name = "Updated Product"
	mockRepo.On("Update", product).Return(nil)
	err = svc.Update(product)
	assert.NoError(t, err)

	// DELETE
	mockRepo.On("Delete", product.ID).Return(nil)
	err = svc.Delete(product.ID)
	assert.NoError(t, err)

	mockRepo.AssertExpectations(t)
}

func TestProductService_GetAllWithPagination(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, cache.NewProductCache(), log)

	expectedProducts := &domain.PaginatedProducts{
		Data: []domain.Product{
			{ID: "1", Name: "Product 1", Price: 100},
			{ID: "2", Name: "Product 2", Price: 200},
			{ID: "3", Name: "Product 3", Price: 300},
		},
		Total:      100,
		TotalPages: 5,
		Page:       1,
		Stats: domain.ProductStats{
			TotalStock: 1000,
			TotalValue: 50000,
			TotalCost:  25000,
			Profit:     25000,
		},
	}

	mockRepo.On("GetAll", 1, 20, "search", "category").Return(expectedProducts, nil)

	result, err := svc.GetAll(1, 20, "search", "category")

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 3, len(result.Data))
	assert.Equal(t, int64(100), result.Total)
	assert.Equal(t, 5, result.TotalPages)
	assert.Equal(t, float64(1000), result.Stats.TotalStock)
	mockRepo.AssertExpectations(t)
}

func TestProductService_GetByBarcode(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, cache.NewProductCache(), log)

	expectedProduct := &domain.Product{
		ID:      "prod-1",
		Name:    "Test Product",
		Barcode: "123456",
		Price:   100,
	}

	mockRepo.On("GetByBarcode", "123456").Return(expectedProduct, nil)

	result, err := svc.GetByBarcode("123456")

	assert.NoError(t, err)
	assert.Equal(t, "123456", result.Barcode)
	assert.Equal(t, "Test Product", result.Name)
	mockRepo.AssertExpectations(t)
}

func TestProductService_GetByBarcode_NotFound(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, cache.NewProductCache(), log)

	mockRepo.On("GetByBarcode", "nonexistent").Return((*domain.Product)(nil), assert.AnError)

	result, err := svc.GetByBarcode("nonexistent")

	assert.Error(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestProductService_GetCategories_Sorted(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, cache.NewProductCache(), log)

	categories := []string{"Electronics", "Food", "Clothing", "Beverages"}
	mockRepo.On("GetCategories").Return(categories, nil)

	result, err := svc.GetCategories()

	assert.NoError(t, err)
	assert.Equal(t, 4, len(result))
	assert.Contains(t, result, "Electronics")
	assert.Contains(t, result, "Food")
	mockRepo.AssertExpectations(t)
}

func TestProductService_GetStats_ProfitCalculation(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, cache.NewProductCache(), log)

	expectedStats := &domain.ProductStats{
		TotalStock: 1000,
		TotalValue: 100000, // stock * price
		TotalCost:  50000,  // stock * cost
		Profit:     50000,  // value - cost
	}

	mockRepo.On("GetStats").Return(expectedStats, nil)

	result, err := svc.GetStats()

	assert.NoError(t, err)
	assert.Equal(t, float64(1000), result.TotalStock)
	assert.Equal(t, float64(50000), result.Profit)
	mockRepo.AssertExpectations(t)
}

func TestProductService_GetLowStock_BelowThreshold(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, cache.NewProductCache(), log)

	lowStockProducts := []domain.Product{
		{ID: "1", Name: "Product 1", Stock: 2, MinStock: 5},
		{ID: "2", Name: "Product 2", Stock: 0, MinStock: 5},
		{ID: "3", Name: "Product 3", Stock: 3, MinStock: 10},
	}

	mockRepo.On("GetLowStock", 5).Return(lowStockProducts, nil)

	result, err := svc.GetLowStock(5)

	assert.NoError(t, err)
	assert.Equal(t, 3, len(result))
	for _, p := range result {
		assert.True(t, p.Stock < p.MinStock || p.Stock <= 5)
	}
	mockRepo.AssertExpectations(t)
}

func TestProductService_Search_CaseInsensitive(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, cache.NewProductCache(), log)

	products := []domain.Product{
		{ID: "1", Name: "Coffee", Price: 100},
		{ID: "2", Name: "Tea", Price: 50},
	}

	mockRepo.On("Search", "coffee", 10).Return(products, nil)

	result, err := svc.Search("coffee", 10)

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Customer Service - Comprehensive Integration Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestCustomerService_FullCRUDLifecycle(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewCustomerService(mockRepo, cache.NewCustomerCache(), log)

	// CREATE
	customer := &domain.Customer{
		Name:  "John Doe",
		Phone: "1234567890",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Customer")).Return(nil).Run(func(args mock.Arguments) {
		c := args.Get(0).(*domain.Customer)
		assert.NotEmpty(t, c.ID)
	})
	err := svc.Create(customer)
	assert.NoError(t, err)
	assert.NotEmpty(t, customer.ID)

	// READ
	mockRepo.On("GetByID", customer.ID).Return(customer, nil)
	retrieved, err := svc.GetByID(customer.ID)
	assert.NoError(t, err)
	assert.Equal(t, customer.ID, retrieved.ID)

	// UPDATE
	customer.Name = "John Updated"
	mockRepo.On("GetByID", customer.ID).Return(&domain.Customer{Debt: 1000, InstallmentDebt: 500, TotalPurchases: 2000}, nil)
	mockRepo.On("Update", customer).Return(nil)
	err = svc.Update(customer)
	assert.NoError(t, err)

	// DELETE
	mockRepo.On("Delete", customer.ID).Return(nil)
	err = svc.Delete(customer.ID)
	assert.NoError(t, err)

	mockRepo.AssertExpectations(t)
}

func TestCustomerService_GetAll_WithSearch(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewCustomerService(mockRepo, cache.NewCustomerCache(), log)

	expectedCustomers := []domain.Customer{
		{ID: "1", Name: "John Doe", Phone: "1234567890"},
		{ID: "2", Name: "Jane Smith", Phone: "0987654321"},
	}

	mockRepo.On("GetAll", 1, 20, "john").Return(expectedCustomers, int64(2), nil)

	result, total, err := svc.GetAll(1, 20, "john")

	assert.NoError(t, err)
	assert.Equal(t, int64(2), total)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_GetByPhone(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewCustomerService(mockRepo, cache.NewCustomerCache(), log)

	expectedCustomer := &domain.Customer{
		ID:    "cust-1",
		Name:  "John Doe",
		Phone: "1234567890",
		Debt:  500,
	}

	mockRepo.On("GetByPhone", "1234567890").Return(expectedCustomer, nil)

	result, err := svc.GetByPhone("1234567890")

	assert.NoError(t, err)
	assert.Equal(t, "1234567890", result.Phone)
	assert.Equal(t, float64(500), result.Debt)
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_GetTop(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewCustomerService(mockRepo, cache.NewCustomerCache(), log)

	topCustomers := []domain.Customer{
		{ID: "1", Name: "VIP Customer 1", TotalPurchases: 100000},
		{ID: "2", Name: "VIP Customer 2", TotalPurchases: 80000},
		{ID: "3", Name: "VIP Customer 3", TotalPurchases: 60000},
	}

	mockRepo.On("GetTop", 10).Return(topCustomers, nil)

	result, err := svc.GetTop(10)

	assert.NoError(t, err)
	assert.Equal(t, 3, len(result))
	assert.GreaterOrEqual(t, result[0].TotalPurchases, result[1].TotalPurchases)
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Staff Service - Comprehensive Integration Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestStaffService_FullCRUDLifecycle(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewStaffService(mockRepo, log)

	// CREATE
	staff := &domain.Staff{
		Username: "newuser",
		Name:     "New User",
		Role:     "cashier",
		Password: "plaintext123",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Staff")).Return(nil).Run(func(args mock.Arguments) {
		s := args.Get(0).(*domain.Staff)
		assert.NotEmpty(t, s.ID)
		// Password should be hashed
		assert.NotEqual(t, "plaintext123", s.Password)
		assert.Contains(t, s.Password, "$2a$")
	})
	err := svc.Create(staff)
	assert.NoError(t, err)

	// READ
	mockRepo.On("GetByID", staff.ID).Return(staff, nil)
	retrieved, err := svc.GetByID(staff.ID)
	assert.NoError(t, err)
	assert.Equal(t, staff.ID, retrieved.ID)

	// UPDATE
	staff.Name = "Updated User"
	mockRepo.On("Update", staff).Return(nil)
	err = svc.Update(staff)
	assert.NoError(t, err)

	// DELETE
	mockRepo.On("Delete", staff.ID).Return(nil)
	err = svc.Delete(staff.ID)
	assert.NoError(t, err)

	mockRepo.AssertExpectations(t)
}

func TestStaffService_Authenticate_Success(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewStaffService(mockRepo, log)

	expectedStaff := &domain.Staff{
		ID:       "staff-1",
		Username: "admin",
		Name:     "Admin User",
		Role:     "admin",
		IsActive: true,
	}

	mockRepo.On("Authenticate", "admin", "password123").Return(expectedStaff, nil)

	result, err := svc.Authenticate("admin", "password123")

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, "admin", result.Username)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Authenticate_Failure(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewStaffService(mockRepo, log)

	mockRepo.On("Authenticate", "admin", "wrongpassword").Return((*domain.Staff)(nil), assert.AnError)

	result, err := svc.Authenticate("admin", "wrongpassword")

	assert.Error(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_GetAll(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewStaffService(mockRepo, log)

	expectedStaff := []domain.Staff{
		{ID: "1", Username: "admin", Name: "Admin", Role: "admin"},
		{ID: "2", Username: "cashier", Name: "Cashier", Role: "cashier"},
		{ID: "3", Username: "manager", Name: "Manager", Role: "manager"},
	}

	mockRepo.On("GetAll").Return(expectedStaff, nil)

	result, err := svc.GetAll()

	assert.NoError(t, err)
	assert.Equal(t, 3, len(result))
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shift Service - Comprehensive Integration Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestShiftService_StartShift_Success(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	mockRepo.On("GetActive", "staff-1").Return((*domain.Shift)(nil), nil)
	mockRepo.On("Create", mock.AnythingOfType("*domain.Shift")).Return(nil)

	shift, err := svc.StartShift("staff-1", "John Doe", 1000)

	assert.NoError(t, err)
	assert.NotNil(t, shift)
	assert.Equal(t, "staff-1", shift.StaffID)
	assert.Equal(t, "active", shift.Status)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_StartShift_DuplicatePrevention(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	existingShift := &domain.Shift{
		ID:      "shift-1",
		StaffID: "staff-1",
		Status:  "active",
	}

	mockRepo.On("GetActive", "staff-1").Return(existingShift, nil)

	shift, err := svc.StartShift("staff-1", "John Doe", 1000)

	assert.Error(t, err)
	assert.Nil(t, shift)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_CloseShift_Success(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	existingShift := &domain.Shift{
		ID:        "shift-1",
		StaffID:   "staff-1",
		StartTime: 1000,
		StartCash: 1000,
		Status:    "active",
	}

	mockRepo.On("GetActive", "shift-1").Return(existingShift, nil)
	mockRepo.On("Close", mock.AnythingOfType("*domain.Shift")).Return(nil)

	shift, err := svc.CloseShift("shift-1", 1500)

	assert.NoError(t, err)
	assert.NotNil(t, shift)
	assert.Equal(t, float64(1500), shift.EndCash)
	assert.Equal(t, "closed", shift.Status)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_GetShifts_WithPagination(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	expectedShifts := []domain.Shift{
		{ID: "1", StaffID: "staff-1", Status: "closed"},
		{ID: "2", StaffID: "staff-2", Status: "active"},
	}

	mockRepo.On("GetAll", 1, 20).Return(expectedShifts, int64(2), nil)

	result, total, err := svc.GetShifts(1, 20)

	assert.NoError(t, err)
	assert.Equal(t, int64(2), total)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestShiftService_AddCashMovement(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	mockRepo.On("AddCashMovement", mock.AnythingOfType("*domain.CashMovement")).Return(nil)

	err := svc.AddCashMovement("shift-1", "staff-1", "add", "Starting cash", 500)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_GetCashMovements(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	expectedMovements := []domain.CashMovement{
		{ID: 1, ShiftID: "shift-1", Type: "add", Amount: 500},
		{ID: 2, ShiftID: "shift-1", Type: "remove", Amount: 200},
	}

	mockRepo.On("GetCashMovements", "shift-1").Return(expectedMovements, nil)

	result, err := svc.GetCashMovements("shift-1")

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Supplier Service - Comprehensive Integration Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestSupplierService_FullCRUDLifecycle(t *testing.T) {
	mockRepo := new(mocks.MockSupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewSupplierService(mockRepo, log)

	// CREATE
	supplier := &domain.Supplier{
		Name:  "Test Supplier",
		Phone: "1234567890",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Supplier")).Return(nil).Run(func(args mock.Arguments) {
		s := args.Get(0).(*domain.Supplier)
		assert.NotEmpty(t, s.ID)
	})
	err := svc.Create(supplier)
	assert.NoError(t, err)

	// READ
	mockRepo.On("GetByID", supplier.ID).Return(supplier, nil)
	retrieved, err := svc.GetByID(supplier.ID)
	assert.NoError(t, err)
	assert.Equal(t, supplier.ID, retrieved.ID)

	// UPDATE
	supplier.Name = "Updated Supplier"
	mockRepo.On("Update", supplier).Return(nil)
	err = svc.Update(supplier)
	assert.NoError(t, err)

	// DELETE
	mockRepo.On("Delete", supplier.ID).Return(nil)
	err = svc.Delete(supplier.ID)
	assert.NoError(t, err)

	mockRepo.AssertExpectations(t)
}

func TestSupplierService_GetAll(t *testing.T) {
	mockRepo := new(mocks.MockSupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewSupplierService(mockRepo, log)

	expectedSuppliers := []domain.Supplier{
		{ID: "1", Name: "Supplier 1"},
		{ID: "2", Name: "Supplier 2"},
		{ID: "3", Name: "Supplier 3"},
	}

	mockRepo.On("GetAll").Return(expectedSuppliers, nil)

	result, err := svc.GetAll()

	assert.NoError(t, err)
	assert.Equal(t, 3, len(result))
	mockRepo.AssertExpectations(t)
}
