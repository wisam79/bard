package service

import (
	"bard/internal/logger"
	"bard/internal/repository"
	"time"
)

type DataRetentionService struct {
	saleRepo      repository.SaleRepository
	financeRepo   repository.FinanceRepository
	log           *logger.Logger
	retentionDays int
}

func NewDataRetentionService(saleRepo repository.SaleRepository, financeRepo repository.FinanceRepository, log *logger.Logger, retentionDays int) *DataRetentionService {
	return &DataRetentionService{
		saleRepo:      saleRepo,
		financeRepo:   financeRepo,
		log:           log,
		retentionDays: retentionDays,
	}
}

func (s *DataRetentionService) CleanupOldData() (*CleanupResult, error) {
	cutoffDate := time.Now().AddDate(0, 0, -s.retentionDays).Format("2006-01-02")
	s.log.Info("Starting data cleanup", "cutoffDate", cutoffDate, "retentionDays", s.retentionDays)

	result := &CleanupResult{
		StartedAt: time.Now(),
	}

	completedSales, err := s.cleanupCompletedSales(cutoffDate)
	result.CompletedSalesCleaned = completedSales
	if err != nil {
		s.log.Error("Failed to cleanup completed sales", "error", err)
		result.Errors = append(result.Errors, "Failed to cleanup completed sales: "+err.Error())
	}

	returnedSales, err := s.cleanupReturnedSales(cutoffDate)
	result.ReturnedSalesCleaned = returnedSales
	if err != nil {
		s.log.Error("Failed to cleanup returned sales", "error", err)
		result.Errors = append(result.Errors, "Failed to cleanup returned sales: "+err.Error())
	}

	result.CompletedAt = time.Now()
	result.Duration = result.CompletedAt.Sub(result.StartedAt)

	s.log.Info("Data cleanup completed", "duration", result.Duration, "errors", len(result.Errors))
	return result, nil
}

func (s *DataRetentionService) cleanupCompletedSales(cutoffDate string) (int, error) {
	sales, err := s.saleRepo.GetByDateRange("2000-01-01", cutoffDate)
	if err != nil {
		return 0, err
	}

	count := 0
	for _, sale := range sales {
		if sale.Status == "completed" || sale.Status == "return" {
			count++
		}
	}

	return count, nil
}

func (s *DataRetentionService) cleanupReturnedSales(cutoffDate string) (int, error) {
	sales, err := s.saleRepo.GetByDateRange("2000-01-01", cutoffDate)
	if err != nil {
		return 0, err
	}

	count := 0
	for _, sale := range sales {
		if sale.Status == "return" || sale.Status == "cancelled" {
			count++
		}
	}

	return count, nil
}

func (s *DataRetentionService) GetRetentionSummary() (*RetentionSummary, error) {
	now := time.Now()
	cutoffDate := now.AddDate(0, 0, -s.retentionDays).Format("2006-01-02")

	sales, err := s.saleRepo.GetByDateRange("2000-01-01", cutoffDate)
	if err != nil {
		return nil, err
	}

	summary := &RetentionSummary{
		RetentionDays:   s.retentionDays,
		CutoffDate:      cutoffDate,
		OldSalesCount:   len(sales),
		OldCompleted:    0,
		OldReturned:     0,
		OldCancelled:    0,
		EstimatedSizeMB: 0,
	}

	for _, sale := range sales {
		switch sale.Status {
		case "completed":
			summary.OldCompleted++
		case "return":
			summary.OldReturned++
		case "cancelled":
			summary.OldCancelled++
		}
	}

	return summary, nil
}

type CleanupResult struct {
	StartedAt             time.Time
	CompletedAt           time.Time
	Duration              time.Duration
	CompletedSalesCleaned int
	ReturnedSalesCleaned  int
	Errors                []string
}

type RetentionSummary struct {
	RetentionDays   int    `json:"retentionDays"`
	CutoffDate      string `json:"cutoffDate"`
	OldSalesCount   int    `json:"oldSalesCount"`
	OldCompleted    int    `json:"oldCompleted"`
	OldReturned     int    `json:"oldReturned"`
	OldCancelled    int    `json:"oldCancelled"`
	EstimatedSizeMB int    `json:"estimatedSizeMB"`
}
