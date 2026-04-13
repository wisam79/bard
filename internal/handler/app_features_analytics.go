package handler

import (
	"bard/internal/domain"
)

func (a *App) GetAnalyticsDashboard() (*domain.AnalyticsDashboard, error) {
	return a.analytics.GetDashboard()
}

func (a *App) GetProfitAnalysis(months int) ([]domain.ProfitAnalysis, error) {
	return a.analytics.GetProfitAnalysis(months)
}

func (a *App) GetDemandForecast() ([]domain.DemandForecast, error) {
	return a.analytics.GetDemandForecast()
}

func (a *App) DetectAnomalies() ([]domain.AnomalyDetection, error) {
	return a.analytics.DetectAnomalies()
}
