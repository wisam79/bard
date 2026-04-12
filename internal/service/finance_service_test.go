package service

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestFinanceService_GetExpenses(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	expenses := []domain.Expense{
		{ID: "1", Title: "Rent", Amount: 5000, Category: "Operations"},
		{ID: "2", Title: "Utilities", Amount: 500, Category: "Operations"},
	}

	mockRepo.On("GetExpenses", 1, 20, "").Return(expenses, int64(2), nil)

	result, total, err := svc.GetExpenses(1, 20, "")

	assert.NoError(t, err)
	assert.Equal(t, int64(2), total)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_GetExpenses_WithCategory(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	expenses := []domain.Expense{
		{ID: "1", Title: "Rent", Amount: 5000, Category: "Operations"},
	}

	mockRepo.On("GetExpenses", 1, 20, "Operations").Return(expenses, int64(1), nil)

	result, total, err := svc.GetExpenses(1, 20, "Operations")

	assert.NoError(t, err)
	assert.Equal(t, int64(1), total)
	assert.Equal(t, 1, len(result))
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_CreateExpense(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	expense := &domain.Expense{
		Title:    "Office Supplies",
		Amount:   200,
		Category: "Operations",
		Date:     "2026-04-12",
	}

	mockRepo.On("CreateExpense", mock.AnythingOfType("*domain.Expense")).Return(nil)

	err := svc.CreateExpense(expense)

	assert.NoError(t, err)
	assert.NotEmpty(t, expense.ID)
	assert.NotZero(t, expense.CreatedAt)
	assert.NotZero(t, expense.UpdatedAt)
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_UpdateExpense(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	expense := &domain.Expense{
		ID:     "expense-1",
		Title:  "Updated Expense",
		Amount: 300,
	}

	mockRepo.On("UpdateExpense", mock.AnythingOfType("*domain.Expense")).Return(nil)

	err := svc.UpdateExpense(expense)

	assert.NoError(t, err)
	assert.NotZero(t, expense.UpdatedAt)
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_DeleteExpense(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	mockRepo.On("DeleteExpense", "expense-1").Return(nil)

	err := svc.DeleteExpense("expense-1")

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_GetExpenseCategories(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	categories := []string{"Operations", "Marketing", "Utilities"}

	mockRepo.On("GetExpenseCategories").Return(categories, nil)

	result, err := svc.GetExpenseCategories()

	assert.NoError(t, err)
	assert.Equal(t, 3, len(result))
	assert.Contains(t, result, "Operations")
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_GetDiscounts(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	discounts := []domain.Discount{
		{ID: "1", Name: "Summer Sale", Type: "percentage", Value: 10, IsActive: true},
		{ID: "2", Name: "Bulk Discount", Type: "fixed", Value: 50, IsActive: true},
	}

	mockRepo.On("GetDiscounts").Return(discounts, nil)

	result, err := svc.GetDiscounts()

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_CreateDiscount(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	discount := &domain.Discount{
		Name:  "Holiday Discount",
		Type:  "percentage",
		Value: 15,
	}

	mockRepo.On("CreateDiscount", mock.AnythingOfType("*domain.Discount")).Return(nil)

	err := svc.CreateDiscount(discount)

	assert.NoError(t, err)
	assert.NotEmpty(t, discount.ID)
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_CreatePayment(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	payment := &domain.Payment{
		SaleID:     "sale-1",
		CustomerID: "cust-1",
		Amount:     500,
		Method:     "cash",
	}

	mockRepo.On("CreatePayment", mock.AnythingOfType("*domain.Payment")).Return(nil)

	err := svc.CreatePayment(payment)

	assert.NoError(t, err)
	assert.NotZero(t, payment.Timestamp)
	assert.NotZero(t, payment.CreatedAt)
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_GetPayments(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	payments := []domain.Payment{
		{ID: 1, SaleID: "sale-1", Amount: 500, Method: "cash"},
		{ID: 2, SaleID: "sale-1", Amount: 200, Method: "card"},
	}

	mockRepo.On("GetPayments", "sale-1").Return(payments, nil)

	result, err := svc.GetPayments("sale-1")

	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_GetExpenses_Empty(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	mockRepo.On("GetExpenses", 1, 20, "").Return([]domain.Expense{}, int64(0), nil)

	result, total, err := svc.GetExpenses(1, 20, "")

	assert.NoError(t, err)
	assert.Equal(t, int64(0), total)
	assert.Empty(t, result)
	mockRepo.AssertExpectations(t)
}

func TestFinanceService_GetDiscounts_Empty(t *testing.T) {
	mockRepo := new(mocks.MockFinanceRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewFinanceService(mockRepo, log)

	mockRepo.On("GetDiscounts").Return([]domain.Discount{}, nil)

	result, err := svc.GetDiscounts()

	assert.NoError(t, err)
	assert.Empty(t, result)
	mockRepo.AssertExpectations(t)
}
