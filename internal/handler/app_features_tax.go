package handler

import (
	"bard/internal/domain"
)

func (a *App) GetTaxRates() ([]domain.TaxRate, error) {
	return a.tax.GetTaxRates()
}

func (a *App) CreateTaxRate(token string, rate domain.TaxRate) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.tax.CreateTaxRate(&rate)
}

func (a *App) UpdateTaxRate(token string, rate domain.TaxRate) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.tax.UpdateTaxRate(&rate)
}

func (a *App) DeleteTaxRate(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.tax.DeleteTaxRate(id)
}

func (a *App) GetDefaultTaxRate() (*domain.TaxRate, error) {
	return a.tax.GetDefaultTaxRate()
}

func (a *App) GetTaxReport(periodStart, periodEnd string) ([]domain.TaxReport, error) {
	return a.tax.GetTaxReport(periodStart, periodEnd)
}
