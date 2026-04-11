package service_test

import (
	"bard/internal/domain"
	"bard/internal/errors"
	"bard/internal/logger"
	"bard/internal/mocks"
	"bard/internal/service"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// ═══════════════════════════════════════════════════════════════════════════════
// Product Service - Additional Edge Case Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestProductService_Create_WithZeroValues(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, log)

	// Zero price should be allowed (free product)
	product := &domain.Product{
		Name:    "Free Sample",
		Barcode: "FREE001",
		Price:   0,
		Stock:   100,
	}

	mockRepo.On("Create", product).Return(nil)

	err := svc.Create(product)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestProductService_Create_WithWhitespace(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, log)

	product := &domain.Product{
		Name:    "  Trimmed Name  ",
		Barcode: "  TRIM001  ",
		Price:   100,
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Product")).Return(nil)

	err := svc.Create(product)
	assert.NoError(t, err)
	assert.Equal(t, "Trimmed Name", product.Name, "Whitespace should be trimmed")
	assert.Equal(t, "TRIM001", product.Barcode, "Barcode whitespace should be trimmed")
	mockRepo.AssertExpectations(t)
}

func TestProductService_Update_NonExistentProduct(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, log)

	product := &domain.Product{
		ID:      "non-existent",
		Name:    "Test",
		Barcode: "TEST001",
		Price:   100,
	}

	mockRepo.On("Update", product).Return(errors.NewNotFoundError(domain.ModuleProduct, "Product"))

	err := svc.Update(product)
	assert.Error(t, err)
	assert.True(t, errors.IsNotFound(err))
	mockRepo.AssertExpectations(t)
}

func TestProductService_Search_EmptyQuery(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, log)

	products := []domain.Product{}
	mockRepo.On("Search", "", 10).Return(products, nil)

	result, err := svc.Search("", 10)
	assert.NoError(t, err)
	assert.Empty(t, result)
	mockRepo.AssertExpectations(t)
}

func TestProductService_GetLowStock_ZeroThreshold(t *testing.T) {
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewProductService(mockRepo, log)

	products := []domain.Product{
		{ID: "1", Name: "Product 1", Stock: 0},
	}
	mockRepo.On("GetLowStock", 0).Return(products, nil)

	result, err := svc.GetLowStock(0)
	assert.NoError(t, err)
	assert.Len(t, result, 1)
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Customer Service - Additional Edge Case Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestCustomerService_Create_WithEmptyPhone(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewCustomerService(mockRepo, log)

	customer := &domain.Customer{
		Name:  "John Doe",
		Phone: "", // Phone is optional
	}

	mockRepo.On("Create", customer).Return(nil)

	err := svc.Create(customer)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_Update_PreserveDebt(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewCustomerService(mockRepo, log)

	existingCustomer := &domain.Customer{
		ID:              "cust-1",
		Name:            "Old Name",
		Debt:            5000,
		InstallmentDebt: 3000,
		TotalPurchases:  10000,
	}

	updateCustomer := &domain.Customer{
		ID:   "cust-1",
		Name: "New Name",
		// Debt fields not provided
	}

	mockRepo.On("GetByID", "cust-1").Return(existingCustomer, nil)
	mockRepo.On("Update", mock.MatchedBy(func(c *domain.Customer) bool {
		return c.Debt == 5000 && c.InstallmentDebt == 3000 && c.TotalPurchases == 10000
	})).Return(nil)

	err := svc.Update(updateCustomer)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_GetAll_ZeroLimit(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewCustomerService(mockRepo, log)

	customers := []domain.Customer{}
	// CustomerService.GetAll passes parameters directly to repo without validation
	mockRepo.On("GetAll", 1, 0, "").Return(customers, int64(0), nil)

	result, total, err := svc.GetAll(1, 0, "")
	assert.NoError(t, err)
	assert.Empty(t, result)
	assert.Equal(t, int64(0), total)
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Staff Service - Additional Security Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestStaffService_Create_WithEmptyPassword(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewStaffService(mockRepo, log)

	staff := &domain.Staff{
		Username: "newuser",
		Name:     "New User",
		Role:     "cashier",
		Password: "", // Empty password
	}

	// Should still create staff (password might be set later)
	mockRepo.On("Create", mock.AnythingOfType("*domain.Staff")).Return(nil)

	err := svc.Create(staff)
	assert.NoError(t, err)
	assert.Empty(t, staff.Password) // Empty password preserved
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Update_PreservePassword(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewStaffService(mockRepo, log)

	existingStaff := &domain.Staff{
		ID:       "staff-1",
		Username: "admin",
		Name:     "Admin",
		Password: "$2a$10$hashedpassword",
	}

	updateStaff := &domain.Staff{
		ID:       "staff-1",
		Name:     "Updated Admin",
		Password: "", // Empty password in update
	}

	mockRepo.On("GetByID", "staff-1").Return(existingStaff, nil)
	mockRepo.On("Update", mock.MatchedBy(func(s *domain.Staff) bool {
		return s.Password == "$2a$10$hashedpassword"
	})).Return(nil)

	err := svc.Update(updateStaff)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Authenticate_InactiveStaff(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewStaffService(mockRepo, log)

	mockRepo.On("Authenticate", "inactive", "password").Return(nil, errors.ErrInvalidCredentials)

	staff, err := svc.Authenticate("inactive", "password")
	assert.Error(t, err)
	assert.Nil(t, staff)
	mockRepo.AssertExpectations(t)
}

func TestStaffService_Create_InvalidRole(t *testing.T) {
	mockRepo := new(mocks.MockStaffRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewStaffService(mockRepo, log)

	staff := &domain.Staff{
		Username: "user",
		Name:     "User",
		Role:     "", // Empty role
	}

	err := svc.Create(staff)
	assert.Error(t, err)
	assert.True(t, errors.IsValidationError(err))
}

// ═══════════════════════════════════════════════════════════════════════════════
// Finance Service - Additional Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestFinanceService_CreateExpense_NegativeAmount(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewFinanceService(mockRepo, log)

	expense := &domain.Expense{
		Title:    "Test Expense",
		Category: "Operations",
		Amount:   -100, // Negative amount
	}

	// Should still create (validation might be done at repo level)
	mockRepo.On("CreateExpense", expense).Return(nil)

	err := svc.CreateExpense(expense)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_GetExpenses_EmptyCategory(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewFinanceService(mockRepo, log)

	expenses := []domain.Expense{}
	mockRepo.On("GetExpenses", 1, 20, "").Return(expenses, int64(0), nil)

	result, total, err := svc.GetExpenses(1, 20, "")
	assert.NoError(t, err)
	assert.Empty(t, result)
	assert.Equal(t, int64(0), total)
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_CreatePayment_ZeroAmount(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewFinanceService(mockRepo, log)

	payment := &domain.Payment{
		SaleID: "sale-1",
		Amount: 0, // Zero payment
		Method: "cash",
	}

	mockRepo.On("CreatePayment", payment).Return(nil)

	err := svc.CreatePayment(payment)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Settings Service - Additional Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestSettingsService_GetPreferences_NotFound(t *testing.T) {
	mockRepo := new(mocks.MockSettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewSettingsService(mockRepo, log)

	mockRepo.On("GetPreferences").Return(nil, errors.NewNotFoundError(domain.ModuleSettings, "Preferences"))

	prefs, err := svc.GetPreferences()
	assert.Error(t, err)
	assert.Nil(t, prefs)
	assert.True(t, errors.IsNotFound(err))
	mockRepo.AssertExpectations(t)
}

func TestSettingsService_UpdatePreferences_EmptyStoreName(t *testing.T) {
	mockRepo := new(mocks.MockSettingsRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewSettingsService(mockRepo, log)

	prefs := &domain.AppPreferences{
		StoreName: "", // Empty store name
		Currency:  "د.ع",
	}

	mockRepo.On("UpdatePreferences", prefs).Return(nil)

	err := svc.UpdatePreferences(prefs)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shift Service - Additional Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestShiftService_StartShift_NegativeStartCash(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	mockRepo.On("GetActive", "staff-1").Return((*domain.Shift)(nil), nil)
	mockRepo.On("Create", mock.AnythingOfType("*domain.Shift")).Return(nil)

	shift, err := svc.StartShift("staff-1", "John Doe", -100)
	assert.NoError(t, err)
	assert.NotNil(t, shift)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_StartShift_AlreadyExists(t *testing.T) {
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
	assert.True(t, errors.IsNotFound(err) || err.(*domain.AppError).Code == "ACTIVE_SHIFT_EXISTS")
	mockRepo.AssertExpectations(t)
}

func TestShiftService_CloseShift_NonExistent(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	mockRepo.On("GetActive", "non-existent").Return((*domain.Shift)(nil), errors.NewNotFoundError(domain.ModuleStaff, "Shift"))

	shift, err := svc.CloseShift("non-existent", 1500)
	assert.Error(t, err)
	assert.Nil(t, shift)
	mockRepo.AssertExpectations(t)
}

func TestShiftService_AddCashMovement_NegativeAmount(t *testing.T) {
	mockRepo := new(mocks.MockShiftRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewShiftService(mockRepo, log)

	mockRepo.On("AddCashMovement", mock.AnythingOfType("*domain.CashMovement")).Return(nil)

	err := svc.AddCashMovement("shift-1", "staff-1", "remove", "Test", -50)
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Supplier Service - Additional Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestSupplierService_Create_EmptyName(t *testing.T) {
	mockRepo := new(mocks.MockSupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewSupplierService(mockRepo, log)

	supplier := &domain.Supplier{
		Name: "", // Empty name
	}

	err := svc.Create(supplier)
	assert.Error(t, err)
	assert.True(t, errors.IsValidationError(err))
}

func TestSupplierService_Update_NonExistent(t *testing.T) {
	mockRepo := new(mocks.MockSupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewSupplierService(mockRepo, log)

	supplier := &domain.Supplier{
		ID:   "non-existent",
		Name: "Updated Supplier",
	}

	mockRepo.On("Update", supplier).Return(errors.NewNotFoundError(domain.ModuleProduct, "Supplier"))

	err := svc.Update(supplier)
	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSupplierService_GetAll_EmptyList(t *testing.T) {
	mockRepo := new(mocks.MockSupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := service.NewSupplierService(mockRepo, log)

	suppliers := []domain.Supplier{}
	mockRepo.On("GetAll").Return(suppliers, nil)

	result, err := svc.GetAll()
	assert.NoError(t, err)
	assert.Empty(t, result)
	mockRepo.AssertExpectations(t)
}
