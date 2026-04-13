package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) TopUpWallet(token string, customerID string, amount float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.wallet.TopUp(customerID, amount, staff.ID)
}

func (a *App) DebitWallet(token string, customerID string, amount float64, saleID string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.wallet.Debit(customerID, amount, saleID, staff.ID)
}

func (a *App) UpdateCreditLimit(token string, customerID string, creditLimit float64) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.wallet.UpdateCreditLimit(customerID, creditLimit)
}

func (a *App) GetWalletTransactions(customerID string, page, limit int) ([]domain.WalletTransaction, int64, error) {
	return a.wallet.GetTransactions(customerID, page, limit)
}
