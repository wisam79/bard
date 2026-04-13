package service_test

import (
	"testing"
	"time"

	"bard/internal/domain"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFinanceService_CreateExpense(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	expense := &domain.Expense{
		Amount:   500,
		Category: "Utilities",
		Title:    "Electric bill",
		Date:     time.Now().Format("2006-01-02"),
	}

	err := env.FinanceService.CreateExpense(expense)
	require.NoError(t, err)
	assert.NotEmpty(t, expense.ID)

	expenses, total, err := env.FinanceService.GetExpenses(1, 10, "")
	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	assert.Equal(t, "Utilities", expenses[0].Category)
	assert.Equal(t, float64(500), expenses[0].Amount)
}

func TestFinanceService_CreatePayment(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	payment := &domain.Payment{
		Amount: 1000,
		Method: "cash",
		Note:   "Customer Payment",
		SaleID: "sale123",
	}

	err := env.FinanceService.CreatePayment(payment)
	require.NoError(t, err)

	// Payment should be correctly recorded
	payments, err := env.FinanceRepo.GetPayments("sale123")

	payments, err = env.FinanceService.GetPayments("sale123")
	require.NoError(t, err)
	assert.Len(t, payments, 1)
	assert.Equal(t, float64(1000), payments[0].Amount)
}
