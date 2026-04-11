package service

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestPurchaseOrderService_GetAll(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	orders := []domain.PurchaseOrder{
		{ID: "1", Status: "pending", Total: 500},
		{ID: "2", Status: "received", Total: 1000},
	}

	mockRepo.On("GetAll", 1, 20, "").Return(orders, int64(2), nil)

	result, err := svc.GetAll(1, 20, "")

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 2, len(result.Data))
	assert.Equal(t, int64(2), result.Total)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_GetByID(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	expected := &domain.PurchaseOrder{ID: "test-id", Status: "pending", Total: 500}
	mockRepo.On("GetByID", "test-id").Return(expected, nil)

	result, err := svc.GetByID("test-id")

	assert.NoError(t, err)
	assert.Equal(t, "test-id", result.ID)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_Create(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	order := &domain.PurchaseOrder{
		SupplierID:   "supplier-1",
		SupplierName: "Test Supplier",
		Total:        500,
		Items: []domain.PurchaseOrderItem{
			{ProductID: "prod-1", Name: "Product 1", Qty: 10, Cost: 50, Total: 500},
		},
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.PurchaseOrder")).Return(nil)

	err := svc.Create(order)

	assert.NoError(t, err)
	assert.NotEmpty(t, order.ID)
	assert.NotZero(t, order.CreatedAt)
	assert.Equal(t, "pending", order.Status)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_Create_WithReceivedStatus(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	order := &domain.PurchaseOrder{
		SupplierID:   "supplier-1",
		SupplierName: "Test Supplier",
		Status:       "received",
		Total:        500,
		Items: []domain.PurchaseOrderItem{
			{ProductID: "prod-1", Name: "Product 1", Qty: 10, Cost: 50, Total: 500},
		},
	}

	mockRepo.On("CreateWithStockUpdate", mock.AnythingOfType("*domain.PurchaseOrder")).Return(nil)

	err := svc.Create(order)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_Update(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	order := &domain.PurchaseOrder{
		ID:     "test-id",
		Total:  600,
		Status: "pending",
	}

	mockRepo.On("Update", mock.AnythingOfType("*domain.PurchaseOrder")).Return(nil)

	err := svc.Update(order)

	assert.NoError(t, err)
	assert.NotZero(t, order.UpdatedAt)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_Delete(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	mockRepo.On("Delete", "test-id").Return(nil)

	err := svc.Delete("test-id")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_ReceiveOrder_AlreadyReceived(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	order := &domain.PurchaseOrder{
		ID:     "test-id",
		Status: "received",
	}

	mockRepo.On("GetByID", "test-id").Return(order, nil)

	err := svc.ReceiveOrder("test-id")

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "ALREADY_RECEIVED", appErr.Code)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_ReceiveOrder_EmptyOrder(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	order := &domain.PurchaseOrder{
		ID:     "test-id",
		Status: "pending",
		Items:  []domain.PurchaseOrderItem{},
	}

	mockRepo.On("GetByID", "test-id").Return(order, nil)

	err := svc.ReceiveOrder("test-id")

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "EMPTY_ORDER", appErr.Code)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_ReceiveOrder_Success(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	order := &domain.PurchaseOrder{
		ID:     "test-id",
		Status: "pending",
		Items: []domain.PurchaseOrderItem{
			{ProductID: "prod-1", Name: "Product 1", Qty: 10, Cost: 50, Total: 500},
		},
	}

	mockRepo.On("GetByID", "test-id").Return(order, nil)
	mockRepo.On("ReceiveWithStockUpdate", "test-id").Return(nil)

	err := svc.ReceiveOrder("test-id")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestPurchaseOrderService_GetAll_Pagination(t *testing.T) {
	mockRepo := new(mocks.MockPurchaseOrderRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewPurchaseOrderService(mockRepo, mockProductRepo, log)

	orders := []domain.PurchaseOrder{
		{ID: "1", Status: "pending"},
		{ID: "2", Status: "pending"},
		{ID: "3", Status: "pending"},
	}

	mockRepo.On("GetAll", 1, 2, "").Return(orders, int64(3), nil)

	result, err := svc.GetAll(1, 2, "")

	assert.NoError(t, err)
	assert.Equal(t, 1, result.Page)
	assert.Equal(t, int64(3), result.Total)
	assert.Equal(t, 2, result.TotalPages)
	mockRepo.AssertExpectations(t)
}
