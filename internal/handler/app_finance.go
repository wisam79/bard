package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error) {
	return a.finance.GetExpenses(page, limit, category)
}

func (a *App) CreateExpense(token string, expense domain.Expense) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.finance.CreateExpense(&expense)
}

func (a *App) UpdateExpense(token string, expense domain.Expense) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.finance.UpdateExpense(&expense)
}

func (a *App) DeleteExpense(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermViewFinance); err != nil {
		return err
	}
	return a.finance.DeleteExpense(id)
}

func (a *App) CreatePayment(payment domain.Payment) error {
	return a.finance.CreatePayment(&payment)
}

func (a *App) GetPayments(saleID string) ([]domain.Payment, error) {
	return a.finance.GetPayments(saleID)
}

func (a *App) GetCommissionPayments(staffID string) ([]domain.CommissionPayment, error) {
	return a.commission.GetPayments(staffID)
}

func (a *App) ApproveExpense(token, expenseID, comment string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.budget.ApproveExpense(expenseID, staff.ID, staff.Name, comment)
}

func (a *App) RejectExpense(token, expenseID, comment string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.budget.RejectExpense(expenseID, staff.ID, staff.Name, comment)
}

func (a *App) GetExpenseApprovals(expenseID string) ([]domain.ExpenseApproval, error) {
	return a.budget.GetExpenseApprovals(expenseID)
}
