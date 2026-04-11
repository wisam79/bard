package service

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/errors"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestCustomerService_GetAll(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewCustomerService(mockRepo, log)

	customers := []domain.Customer{
		{ID: "1", Name: "Customer 1", Debt: 100},
		{ID: "2", Name: "Customer 2", Debt: 200},
	}

	mockRepo.On("GetAll", 1, 20, "").Return(customers, int64(2), nil)

	result, count, err := svc.GetAll(1, 20, "")

	assert.NoError(t, err)
	assert.Equal(t, int64(2), count)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_GetByID(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewCustomerService(mockRepo, log)

	expected := &domain.Customer{ID: "test-id", Name: "Test Customer"}
	mockRepo.On("GetByID", "test-id").Return(expected, nil)

	result, err := svc.GetByID("test-id")

	assert.NoError(t, err)
	assert.Equal(t, "test-id", result.ID)
	assert.Equal(t, "Test Customer", result.Name)
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_Create(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewCustomerService(mockRepo, log)

	customer := &domain.Customer{
		Name:  "Test Customer",
		Phone: "1234567890",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Customer")).Return(nil)

	err := svc.Create(customer)

	assert.NoError(t, err)
	assert.NotEmpty(t, customer.ID)
	assert.NotZero(t, customer.CreatedAt)
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_Create_Validation(t *testing.T) {
	tests := []struct {
		name     string
		customer *domain.Customer
		wantErr  bool
	}{
		{
			name: "empty name",
			customer: &domain.Customer{
				Name:  "",
				Phone: "1234567890",
			},
			wantErr: true,
		},
		{
			name: "whitespace only name",
			customer: &domain.Customer{
				Name:  "   ",
				Phone: "1234567890",
			},
			wantErr: true,
		},
		{
			name: "valid customer",
			customer: &domain.Customer{
				Name:  "Valid Customer",
				Phone: "1234567890",
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.MockCustomerRepository)
			log := logger.New(logger.LevelInfo, false)
			svc := NewCustomerService(mockRepo, log)

			if !tt.wantErr {
				mockRepo.On("Create", mock.AnythingOfType("*domain.Customer")).Return(nil)
			}

			err := svc.Create(tt.customer)

			if tt.wantErr {
				assert.Error(t, err)
				assert.True(t, errors.IsValidationError(err))
			} else {
				assert.NoError(t, err)
			}
			mockRepo.AssertExpectations(t)
		})
	}
}

func TestCustomerService_Update(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewCustomerService(mockRepo, log)

	existingCustomer := &domain.Customer{
		ID:              "test-id",
		Name:            "Old Name",
		Debt:            500,
		InstallmentDebt: 200,
		TotalPurchases:  1000,
	}

	customer := &domain.Customer{
		ID:   "test-id",
		Name: "New Name",
	}

	mockRepo.On("GetByID", "test-id").Return(existingCustomer, nil)
	mockRepo.On("Update", mock.AnythingOfType("*domain.Customer")).Return(nil)

	err := svc.Update(customer)

	assert.NoError(t, err)
	assert.Equal(t, float64(500), customer.Debt, "Debt should be preserved")
	assert.Equal(t, float64(200), customer.InstallmentDebt, "InstallmentDebt should be preserved")
	assert.Equal(t, float64(1000), customer.TotalPurchases, "TotalPurchases should be preserved")
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_Update_PreservesFinancialFields(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewCustomerService(mockRepo, log)

	existingCustomer := &domain.Customer{
		ID:              "test-id",
		Name:            "Test Customer",
		Debt:            1000,
		InstallmentDebt: 500,
		TotalPurchases:  5000,
	}

	customer := &domain.Customer{
		ID:   "test-id",
		Name: "Updated Name",
	}

	mockRepo.On("GetByID", "test-id").Return(existingCustomer, nil)
	mockRepo.On("Update", mock.AnythingOfType("*domain.Customer")).Return(nil)

	err := svc.Update(customer)

	assert.NoError(t, err)
	assert.Equal(t, float64(1000), customer.Debt)
	assert.Equal(t, float64(500), customer.InstallmentDebt)
	assert.Equal(t, float64(5000), customer.TotalPurchases)
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_Delete(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewCustomerService(mockRepo, log)

	mockRepo.On("Delete", "test-id").Return(nil)

	err := svc.Delete("test-id")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_GetByPhone(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewCustomerService(mockRepo, log)

	expected := &domain.Customer{ID: "1", Name: "Phone Customer", Phone: "1234567890"}
	mockRepo.On("GetByPhone", "1234567890").Return(expected, nil)

	result, err := svc.GetByPhone("1234567890")

	assert.NoError(t, err)
	assert.Equal(t, "1234567890", result.Phone)
	mockRepo.AssertExpectations(t)
}

func TestCustomerService_GetTop(t *testing.T) {
	mockRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewCustomerService(mockRepo, log)

	topCustomers := []domain.Customer{
		{ID: "1", Name: "Top Customer 1", TotalPurchases: 10000},
		{ID: "2", Name: "Top Customer 2", TotalPurchases: 8000},
	}

	mockRepo.On("GetTop", 5).Return(topCustomers, nil)

	result, err := svc.GetTop(5)

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}
