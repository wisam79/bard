package handler

import (
	"bard/internal/domain"
)

func (a *App) GetActiveShift(staffID string) (*domain.Shift, error) {
	return a.shifts.GetActiveShift(staffID)
}

func (a *App) StartShift(token string, staffID, staffName string, startCash float64) (*domain.Shift, error) {
	if _, ok := a.authMiddleware.GetStaff(token); !ok {
		return nil, &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "Unauthorized"}
	}
	return a.shifts.StartShift(staffID, staffName, startCash)
}

func (a *App) CloseShift(token string, shiftID string, endCash float64) (*domain.Shift, error) {
	if _, ok := a.authMiddleware.GetStaff(token); !ok {
		return nil, &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "Unauthorized"}
	}
	return a.shifts.CloseShift(shiftID, endCash)
}

func (a *App) AddCashMovement(shiftID, staffID, movementType, reason string, amount float64) error {
	return a.shifts.AddCashMovement(shiftID, staffID, movementType, reason, amount)
}

func (a *App) GetCashMovements(shiftID string) ([]domain.CashMovement, error) {
	return a.shifts.GetCashMovements(shiftID)
}
