package service

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestSaleService_GetAll(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	mockCustomerRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSaleService(&gorm.DB{}, mockSaleRepo, mockProductRepo, mockCustomerRepo, log)

	paginatedSales := &domain.PaginatedSales{
		Data: []domain.Sale{
			{ID: "1", Total: 100, Status: "completed"},
			{ID: "2", Total: 200, Status: "completed"},
		},
		Total:      2,
		TotalPages: 1,
		Page:       1,
	}

	mockSaleRepo.On("GetAll", 1, 20, "", "").Return(paginatedSales, nil)

	result, err := svc.GetAll(1, 20, "", "")

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 2, len(result.Data))
	mockSaleRepo.AssertExpectations(t)
}

func TestSaleService_GetByID(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	mockCustomerRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSaleService(&gorm.DB{}, mockSaleRepo, mockProductRepo, mockCustomerRepo, log)

	expectedSale := &domain.Sale{ID: "test-id", Total: 150, Status: "completed"}
	mockSaleRepo.On("GetByID", "test-id").Return(expectedSale, nil)

	result, err := svc.GetByID("test-id")

	assert.NoError(t, err)
	assert.Equal(t, "test-id", result.ID)
	assert.Equal(t, float64(150), result.Total)
	mockSaleRepo.AssertExpectations(t)
}

func TestSaleService_GetByID_NotFound(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	mockCustomerRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSaleService(&gorm.DB{}, mockSaleRepo, mockProductRepo, mockCustomerRepo, log)

	mockSaleRepo.On("GetByID", "nonexistent").Return((*domain.Sale)(nil), &domain.AppError{
		Module: domain.ModuleSales,
		Code:   "NOT_FOUND",
	})

	result, err := svc.GetByID("nonexistent")

	assert.Error(t, err)
	assert.Nil(t, result)
	mockSaleRepo.AssertExpectations(t)
}

func TestSaleService_CalculateInstallmentPlan(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	svc := &SaleService{log: log}

	tests := []struct {
		name        string
		total       float64
		downPayment float64
		months      int
		wantErr     bool
	}{
		{
			name:        "valid plan",
			total:       1000,
			downPayment: 200,
			months:      3,
			wantErr:     false,
		},
		{
			name:        "zero months",
			total:       1000,
			downPayment: 200,
			months:      0,
			wantErr:     true,
		},
		{
			name:        "negative total",
			total:       -100,
			downPayment: 0,
			months:      3,
			wantErr:     true,
		},
		{
			name:        "negative down payment",
			total:       1000,
			downPayment: -50,
			months:      3,
			wantErr:     true,
		},
		{
			name:        "down payment exceeds total",
			total:       500,
			downPayment: 600,
			months:      3,
			wantErr:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := svc.CalculateInstallmentPlan(tt.total, tt.downPayment, tt.months)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.months, len(result.Schedule))
				assert.Equal(t, tt.total, result.TotalAmount)
				assert.Equal(t, tt.downPayment, result.DownPayment)
			}
		})
	}
}

func TestSaleService_CalculateInstallmentPlan_Rounding(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	svc := &SaleService{log: log}

	result, err := svc.CalculateInstallmentPlan(1000, 100, 3)

	assert.NoError(t, err)
	assert.NotNil(t, result)

	totalPaid := result.DownPayment
	for _, inst := range result.Schedule {
		totalPaid += inst.Amount
	}

	assert.InDelta(t, 1000, totalPaid, 0.01, "Total paid should equal total amount")
}

func TestSaleService_GetParkedSales(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	mockCustomerRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSaleService(&gorm.DB{}, mockSaleRepo, mockProductRepo, mockCustomerRepo, log)

	parkedSales := []domain.ParkedSale{
		{ID: 1, Total: 100, ItemsCount: 2},
	}

	mockSaleRepo.On("GetParkedSales").Return(parkedSales, nil)

	result, err := svc.GetParkedSales()

	assert.NoError(t, err)
	assert.Equal(t, 1, len(result))
	mockSaleRepo.AssertExpectations(t)
}

func TestSaleService_ParkSale(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	mockCustomerRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSaleService(&gorm.DB{}, mockSaleRepo, mockProductRepo, mockCustomerRepo, log)

	parked := &domain.ParkedSale{
		ItemsJSON:    "[]",
		CustomerName: "Test Customer",
		Note:         "Test note",
		Total:        100,
		ItemsCount:   2,
	}

	mockSaleRepo.On("CreateParkedSale", mock.AnythingOfType("*domain.ParkedSale")).Return(nil)

	err := svc.ParkSale(parked)

	assert.NoError(t, err)
	mockSaleRepo.AssertExpectations(t)
}

func TestSaleService_DeleteParkedSale(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	mockCustomerRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSaleService(&gorm.DB{}, mockSaleRepo, mockProductRepo, mockCustomerRepo, log)

	mockSaleRepo.On("DeleteParkedSale", uint(1)).Return(nil)

	err := svc.DeleteParkedSale(1)

	assert.NoError(t, err)
	mockSaleRepo.AssertExpectations(t)
}

func TestSaleService_GetRecent(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockProductRepo := new(mocks.MockProductRepository)
	mockCustomerRepo := new(mocks.MockCustomerRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewSaleService(&gorm.DB{}, mockSaleRepo, mockProductRepo, mockCustomerRepo, log)

	recentSales := []domain.Sale{
		{ID: "1", Total: 100},
		{ID: "2", Total: 200},
		{ID: "3", Total: 300},
	}

	mockSaleRepo.On("GetRecent", 5).Return(recentSales, nil)

	result, err := svc.GetRecent(5)

	assert.NoError(t, err)
	assert.Equal(t, 3, len(result))
	mockSaleRepo.AssertExpectations(t)
}
