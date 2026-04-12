package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"math"
	"math/rand"
	"time"
)

type AnalyticsService struct {
	saleRepo     repository.SaleRepository
	productRepo  repository.ProductRepository
	customerRepo repository.CustomerRepository
	log          *logger.Logger
}

func NewAnalyticsService(
	saleRepo repository.SaleRepository,
	productRepo repository.ProductRepository,
	customerRepo repository.CustomerRepository,
	log *logger.Logger,
) *AnalyticsService {
	return &AnalyticsService{saleRepo: saleRepo, productRepo: productRepo, customerRepo: customerRepo, log: log}
}

func (s *AnalyticsService) GetInsights() ([]domain.AnalyticsInsight, error) {
	var insights []domain.AnalyticsInsight

	lowStock, err := s.productRepo.GetLowStock(10)
	if err == nil && len(lowStock) > 0 {
		insights = append(insights, domain.AnalyticsInsight{
			Type:        "warning",
			Title:       "مخزون منخفض",
			Description: fmt.Sprintf("يوجد %d منتج بكمية أقل من الحد الأدنى", len(lowStock)),
			Severity:    "high",
			Value:       float64(len(lowStock)),
			Metric:      "low_stock_count",
		})
	}

	insights = append(insights, domain.AnalyticsInsight{
		Type:        "info",
		Title:       "تحليل الأداء",
		Description: "النظام يعمل بكفاءة. راجع التوقعات لخطة الشراء القادمة.",
		Severity:    "low",
		Metric:      "performance",
	})

	return insights, nil
}

func (s *AnalyticsService) GetSalesForecast(days int) ([]domain.SalesForecast, error) {
	sales, err := s.saleRepo.GetByDateRange(
		time.Now().AddDate(0, -3, 0).Format("2006-01-02"),
		time.Now().Format("2006-01-02"),
	)
	if err != nil {
		return nil, err
	}

	var totalSales float64
	for _, sale := range sales {
		if sale.Status == "completed" {
			totalSales += sale.Total
		}
	}

	var dailyAvg float64
	if len(sales) > 0 {
		dailyAvg = totalSales / float64(len(sales))
	}

	var forecasts []domain.SalesForecast
	for i := 1; i <= days; i++ {
		date := time.Now().AddDate(0, 0, i).Format("2006-01-02")
		dayOfWeek := time.Now().AddDate(0, 0, i).Weekday()
		var multiplier float64 = 1.0
		if dayOfWeek == time.Friday || dayOfWeek == time.Saturday {
			multiplier = 1.3
		} else if dayOfWeek == time.Sunday {
			multiplier = 0.7
		}

		predicted := dailyAvg * multiplier * (1 + rand.Float64()*0.1 - 0.05)
		variance := predicted * 0.2
		forecasts = append(forecasts, domain.SalesForecast{
			Date:       date,
			Predicted:  math.Round(predicted),
			LowerBound: math.Round(predicted - variance),
			UpperBound: math.Round(predicted + variance),
		})
	}

	return forecasts, nil
}

func (s *AnalyticsService) GetProfitAnalysis(months int) ([]domain.ProfitAnalysis, error) {
	var profits []domain.ProfitAnalysis

	for i := months - 1; i >= 0; i-- {
		startDate := time.Now().AddDate(0, -i, 1).Format("2006-01-02")
		endDate := time.Now().AddDate(0, -i+1, 0).Format("2006-01-02")

		sales, err := s.saleRepo.GetByDateRange(startDate, endDate)
		if err != nil {
			continue
		}

		var revenue, cost float64
		for _, sale := range sales {
			if sale.Status == "completed" {
				revenue += sale.Total
				cost += sale.TotalCost
			}
		}

		profit := revenue - cost
		var margin float64
		if revenue > 0 {
			margin = (profit / revenue) * 100
		}

		period := time.Now().AddDate(0, -i, 1).Format("2006-01")
		profits = append(profits, domain.ProfitAnalysis{
			Period:  period,
			Revenue: math.Round(revenue),
			Cost:    math.Round(cost),
			Profit:  math.Round(profit),
			Margin:  math.Round(margin*100) / 100,
		})
	}

	return profits, nil
}

func (s *AnalyticsService) GetDemandForecast() ([]domain.DemandForecast, error) {
	products, err := s.productRepo.GetAll(1, 1000, "", "")
	if err != nil {
		return nil, err
	}

	var demands []domain.DemandForecast
	for _, p := range products.Data {
		if p.Stock <= 0 {
			continue
		}

		avgDailyDemand := p.Stock / 30
		if avgDailyDemand <= 0 {
			avgDailyDemand = 0.5
		}
		daysOfStock := p.Stock / avgDailyDemand

		var urgency string
		var reorderDate string
		switch {
		case daysOfStock <= 3:
			urgency = "critical"
			reorderDate = "فوراً"
		case daysOfStock <= 7:
			urgency = "high"
			reorderDate = time.Now().AddDate(0, 0, 2).Format("2006-01-02")
		case daysOfStock <= 14:
			urgency = "medium"
			reorderDate = time.Now().AddDate(0, 0, 5).Format("2006-01-02")
		default:
			urgency = "low"
			reorderDate = time.Now().AddDate(0, 0, 10).Format("2006-01-02")
		}

		if daysOfStock <= 30 {
			demands = append(demands, domain.DemandForecast{
				ProductID:       p.ID,
				ProductName:     p.Name,
				CurrentQty:      p.Stock,
				PredictedDemand: math.Round(avgDailyDemand * 14),
				DaysOfStock:     math.Round(daysOfStock*10) / 10,
				ReorderDate:     reorderDate,
				Urgency:         urgency,
			})
		}
	}

	return demands, nil
}

func (s *AnalyticsService) DetectAnomalies() ([]domain.AnomalyDetection, error) {
	var anomalies []domain.AnomalyDetection

	yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
	today := time.Now().Format("2006-01-02")

	todaySales, _ := s.saleRepo.GetByDateRange(today, today)
	yesterdaySales, _ := s.saleRepo.GetByDateRange(yesterday, yesterday)

	var todayTotal, yesterdayTotal float64
	for _, s := range todaySales {
		if s.Status == "completed" {
			todayTotal += s.Total
		}
	}
	for _, s := range yesterdaySales {
		if s.Status == "completed" {
			yesterdayTotal += s.Total
		}
	}

	if yesterdayTotal > 0 {
		deviation := ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
		isAnomaly := math.Abs(deviation) > 50
		if isAnomaly {
			anomalies = append(anomalies, domain.AnomalyDetection{
				Metric:      "daily_sales",
				Date:        today,
				Expected:    yesterdayTotal,
				Actual:      todayTotal,
				Deviation:   math.Round(deviation*100) / 100,
				IsAnomaly:   true,
				Description: fmt.Sprintf("المبيعات اليومية انحرفت %.1f%% عن المتوقع", deviation),
			})
		}
	}

	return anomalies, nil
}

func (s *AnalyticsService) GetDashboard() (*domain.AnalyticsDashboard, error) {
	insights, _ := s.GetInsights()
	forecasts, _ := s.GetSalesForecast(7)
	profits, _ := s.GetProfitAnalysis(6)
	demands, _ := s.GetDemandForecast()
	anomalies, _ := s.DetectAnomalies()

	return &domain.AnalyticsDashboard{
		Insights:  insights,
		Forecasts: forecasts,
		Profits:   profits,
		Demands:   demands,
		Anomalies: anomalies,
	}, nil
}
