package service

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestSupplierService_GetAll(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	suppliers := []domain.Supplier{
		{ID: "1", Name: "Supplier 1", Phone: "111"},
		{ID: "2", Name: "Supplier 2", Phone: "222"},
	}

	mockRepo.On("GetAll").Return(suppliers, nil)

	result, err := svc.GetAll()

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestSupplierService_GetAll_Empty(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	mockRepo.On("GetAll").Return([]domain.Supplier{}, nil)

	result, err := svc.GetAll()

	assert.NoError(t, err)
	assert.Empty(t, result)
	mockRepo.AssertExpectations(t)
}

func TestSupplierService_GetByID(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	expected := &domain.Supplier{ID: "supplier-1", Name: "Test Supplier", Phone: "1234567890"}
	mockRepo.On("GetByID", "supplier-1").Return(expected, nil)

	result, err := svc.GetByID("supplier-1")

	assert.NoError(t, err)
	assert.Equal(t, "supplier-1", result.ID)
	assert.Equal(t, "Test Supplier", result.Name)
	mockRepo.AssertExpectations(t)
}

func TestSupplierService_GetByID_NotFound(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	mockRepo.On("GetByID", "nonexistent").Return((*domain.Supplier)(nil), assert.AnError)

	result, err := svc.GetByID("nonexistent")

	assert.Error(t, err)
	assert.Nil(t, result)
	mockRepo.AssertExpectations(t)
}

func TestSupplierService_Create(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	supplier := &domain.Supplier{
		Name:        "New Supplier",
		CompanyName: "Supplier Corp",
		Phone:       "1234567890",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Supplier")).Return(nil)

	err := svc.Create(supplier)

	assert.NoError(t, err)
	assert.NotEmpty(t, supplier.ID)
	assert.NotZero(t, supplier.CreatedAt)
	assert.NotZero(t, supplier.UpdatedAt)
	mockRepo.AssertExpectations(t)
}

func TestSupplierService_Create_EmptyName(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	supplier := &domain.Supplier{
		Name: "",
	}

	err := svc.Create(supplier)

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "VALIDATION_ERROR", appErr.Code)
}

func TestSupplierService_Update(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	supplier := &domain.Supplier{
		ID:          "supplier-1",
		Name:        "Updated Supplier",
		CompanyName: "Updated Corp",
	}

	mockRepo.On("Update", mock.AnythingOfType("*domain.Supplier")).Return(nil)

	err := svc.Update(supplier)

	assert.NoError(t, err)
	assert.NotZero(t, supplier.UpdatedAt)
	mockRepo.AssertExpectations(t)
}

func TestSupplierService_Update_EmptyName(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	supplier := &domain.Supplier{
		ID:   "supplier-1",
		Name: "",
	}

	err := svc.Update(supplier)

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "VALIDATION_ERROR", appErr.Code)
}

func TestSupplierService_Delete(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	mockRepo.On("Delete", "supplier-1").Return(nil)

	err := svc.Delete("supplier-1")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestSupplierService_Delete_Error(t *testing.T) {
	mockRepo := new(mocks.SupplierRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSupplierService(mockRepo, log)

	mockRepo.On("Delete", "nonexistent").Return(assert.AnError)

	err := svc.Delete("nonexistent")

	assert.Error(t, err)
	mockRepo.AssertExpectations(t)
}
