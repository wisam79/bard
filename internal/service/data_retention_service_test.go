package service

import (
	"testing"
	"time"

	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
)

func TestNewDataRetentionService(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockFinanceRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)

	svc := NewDataRetentionService(mockSaleRepo, mockFinanceRepo, log, 365)

	assert.NotNil(t, svc)
	assert.Equal(t, 365, svc.retentionDays)
}

func TestDataRetentionService_GetRetentionSummary(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockFinanceRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewDataRetentionService(mockSaleRepo, mockFinanceRepo, log, 365)

	oldSales := []domain.Sale{
		{ID: "1", Status: "completed", Date: "2025-01-01"},
		{ID: "2", Status: "return", Date: "2025-02-01"},
		{ID: "3", Status: "cancelled", Date: "2025-03-01"},
		{ID: "4", Status: "completed", Date: "2025-04-01"},
	}

	mockSaleRepo.On("GetByDateRange", "2000-01-01", "2025-04-03").Return(oldSales, nil)

	summary, err := svc.GetRetentionSummary()

	assert.NoError(t, err)
	assert.NotNil(t, summary)
	assert.Equal(t, 365, summary.RetentionDays)
	assert.Equal(t, 4, summary.OldSalesCount)
	assert.Equal(t, 2, summary.OldCompleted)
	assert.Equal(t, 1, summary.OldReturned)
	assert.Equal(t, 1, summary.OldCancelled)
	mockSaleRepo.AssertExpectations(t)
}

func TestDataRetentionService_GetRetentionSummary_RepoError(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockFinanceRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewDataRetentionService(mockSaleRepo, mockFinanceRepo, log, 30)

	mockSaleRepo.On("GetByDateRange", "2000-01-01", "2026-03-04").Return([]domain.Sale(nil), assert.AnError)

	summary, err := svc.GetRetentionSummary()

	assert.Error(t, err)
	assert.Nil(t, summary)
	mockSaleRepo.AssertExpectations(t)
}

func TestDataRetentionService_CleanupOldData(t *testing.T) {
	mockSaleRepo := new(mocks.MockSaleRepository)
	mockFinanceRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewDataRetentionService(mockSaleRepo, mockFinanceRepo, log, 365)

	oldSales := []domain.Sale{
		{ID: "1", Status: "completed", Date: "2025-01-01"},
		{ID: "2", Status: "return", Date: "2025-02-01"},
	}

	mockSaleRepo.On("GetByDateRange", "2000-01-01", "2025-04-03").Return(oldSales, nil)

	result, err := svc.CleanupOldData()

	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.True(t, result.Duration >= 0)
	assert.NotZero(t, result.StartedAt)
	assert.NotZero(t, result.CompletedAt)
	mockSaleRepo.AssertExpectations(t)
}

func TestDataRetentionService_CleanupResult_HasErrors(t *testing.T) {
	result := &CleanupResult{
		StartedAt:   time.Now(),
		CompletedAt: time.Now(),
		Errors:      []string{"test error 1", "test error 2"},
	}

	assert.Equal(t, 2, len(result.Errors))
	assert.True(t, result.Duration >= 0)
}

func TestDataRetentionService_RetentionSummary_DefaultValues(t *testing.T) {
	summary := &RetentionSummary{
		RetentionDays: 90,
		CutoffDate:    "2026-01-03",
	}

	assert.Equal(t, 0, summary.OldSalesCount)
	assert.Equal(t, 0, summary.OldCompleted)
	assert.Equal(t, 0, summary.OldReturned)
	assert.Equal(t, 0, summary.OldCancelled)
	assert.Equal(t, 0, summary.EstimatedSizeMB)
}
