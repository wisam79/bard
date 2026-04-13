package handler

import (
	"bard/internal/domain"
)

func (a *App) GetKioskLayouts() ([]domain.KioskLayout, error) {
	return a.kiosk.GetLayouts()
}

func (a *App) GetKioskLayout(id string) (*domain.KioskLayout, error) {
	return a.kiosk.GetLayoutByID(id)
}

func (a *App) CreateKioskLayout(token string, layout domain.KioskLayout) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.kiosk.CreateLayout(&layout)
}

func (a *App) UpdateKioskLayout(token string, layout domain.KioskLayout) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.kiosk.UpdateLayout(&layout)
}

func (a *App) DeleteKioskLayout(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.kiosk.DeleteLayout(id)
}

func (a *App) StartKioskSession(layoutID string) (*domain.KioskSession, error) {
	return a.kiosk.StartSession(layoutID)
}

func (a *App) EndKioskSession(sessionID uint, saleID string, totalAmount float64) error {
	return a.kiosk.EndSession(sessionID, saleID, totalAmount)
}

func (a *App) GetActiveKioskSessions() ([]domain.KioskSession, error) {
	return a.kiosk.GetActiveSessions()
}
