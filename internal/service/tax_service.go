package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type TaxService struct {
	repo repository.TaxRepository
	log  *logger.Logger
}

func NewTaxService(repo repository.TaxRepository, log *logger.Logger) *TaxService {
	return &TaxService{repo: repo, log: log}
}

func (s *TaxService) GetTaxRates() ([]domain.TaxRate, error) {
	return s.repo.GetTaxRates()
}

func (s *TaxService) CreateTaxRate(rate *domain.TaxRate) error {
	if rate.Name == "" || rate.Code == "" {
		return fmt.Errorf("اسم ورمز الضريبة مطلوبان")
	}
	rate.ID = uuid.New().String()
	rate.CreatedAt = time.Now()
	rate.UpdatedAt = time.Now()
	s.log.Info("Tax rate created", "name", rate.Name, "rate", rate.Rate)
	return s.repo.CreateTaxRate(rate)
}

func (s *TaxService) UpdateTaxRate(rate *domain.TaxRate) error {
	rate.UpdatedAt = time.Now()
	return s.repo.UpdateTaxRate(rate)
}

func (s *TaxService) DeleteTaxRate(id string) error {
	return s.repo.DeleteTaxRate(id)
}

func (s *TaxService) GetDefaultTaxRate() (*domain.TaxRate, error) {
	return s.repo.GetDefaultTaxRate()
}

func (s *TaxService) AssignProductTax(productID, taxRateID string) error {
	return s.repo.CreateProductTax(&domain.ProductTax{ProductID: productID, TaxRateID: taxRateID})
}

func (s *TaxService) RemoveProductTax(productID, taxRateID string) error {
	return s.repo.DeleteProductTax(productID, taxRateID)
}

func (s *TaxService) GetProductTaxes(productID string) ([]domain.ProductTax, error) {
	return s.repo.GetProductTaxes(productID)
}

func (s *TaxService) CalculateTax(amount float64, taxRateID string) (float64, error) {
	rate, err := s.repo.GetTaxRateByID(taxRateID)
	if err != nil {
		return 0, err
	}
	return amount * rate.Rate / 100, nil
}

func (s *TaxService) GetTaxReport(periodStart, periodEnd string) ([]domain.TaxReport, error) {
	rates, err := s.repo.GetTaxRates()
	if err != nil {
		return nil, err
	}

	reports := make([]domain.TaxReport, 0, len(rates))
	for _, rate := range rates {
		if !rate.IsActive {
			continue
		}
		report := domain.TaxReport{
			TaxRateID:   rate.ID,
			TaxName:     rate.Name,
			TaxCode:     rate.Code,
			TaxRate:     rate.Rate,
			PeriodStart: periodStart,
			PeriodEnd:   periodEnd,
		}
		reports = append(reports, report)
	}
	return reports, nil
}
