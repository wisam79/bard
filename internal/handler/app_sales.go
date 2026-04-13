package handler

import (
	"bard/internal/domain"
)

func (a *App) GetSales(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	return a.sales.GetAll(page, limit, search, status)
}

func (a *App) GetSale(id string) (*domain.Sale, error) {
	return a.sales.GetByID(id)
}

func (a *App) CreateSale(sale domain.Sale) error {
	return a.sales.Create(&sale)
}

func (a *App) GetParkedSales() ([]domain.ParkedSale, error) {
	return a.sales.GetParkedSales()
}

func (a *App) ParkSale(parked domain.ParkedSale) error {
	return a.sales.ParkSale(&parked)
}

func (a *App) DeleteParkedSale(id uint) error {
	return a.sales.DeleteParkedSale(id)
}

func (a *App) GetRecentSales(limit int) ([]domain.Sale, error) {
	return a.sales.GetRecent(limit)
}

func (a *App) CalculateInstallmentPlan(total, downPayment float64, months int) (*domain.InstallmentPlan, error) {
	return a.sales.CalculateInstallmentPlan(total, downPayment, months)
}

func (a *App) GetSalesForecast(days int) ([]domain.SalesForecast, error) {
	return a.analytics.GetSalesForecast(days)
}
