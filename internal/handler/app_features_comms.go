package handler

import (
	"bard/internal/domain"
)

func (a *App) GetCommissionRules() ([]domain.CommissionRule, error) {
	return a.commission.GetRules()
}

func (a *App) CreateCommissionRule(token string, rule domain.CommissionRule) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.commission.CreateRule(&rule)
}

func (a *App) UpdateCommissionRule(token string, rule domain.CommissionRule) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.commission.UpdateRule(&rule)
}

func (a *App) DeleteCommissionRule(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.commission.DeleteRule(id)
}

func (a *App) MarkCommissionPaid(token string, id uint) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.commission.MarkPaymentPaid(id)
}
