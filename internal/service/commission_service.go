package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type CommissionService struct {
	repo     repository.CommissionRepository
	saleRepo repository.SaleRepository
	log      *logger.Logger
}

func NewCommissionService(repo repository.CommissionRepository, saleRepo repository.SaleRepository, log *logger.Logger) *CommissionService {
	return &CommissionService{repo: repo, saleRepo: saleRepo, log: log}
}

func (s *CommissionService) GetRules() ([]domain.CommissionRule, error) {
	return s.repo.GetRules()
}

func (s *CommissionService) CreateRule(rule *domain.CommissionRule) error {
	if rule.Name == "" {
		return fmt.Errorf("اسم القاعدة مطلوب")
	}
	rule.ID = uuid.New().String()
	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()
	s.log.Info("Commission rule created", "name", rule.Name)
	return s.repo.CreateRule(rule)
}

func (s *CommissionService) UpdateRule(rule *domain.CommissionRule) error {
	rule.UpdatedAt = time.Now()
	return s.repo.UpdateRule(rule)
}

func (s *CommissionService) DeleteRule(id string) error {
	return s.repo.DeleteRule(id)
}

func (s *CommissionService) CalculateCommission(staffID string, saleAmount float64, ruleID string) (float64, error) {
	rule, err := s.repo.GetRuleByID(ruleID)
	if err != nil {
		return 0, err
	}
	if saleAmount < rule.MinAmount {
		return 0, nil
	}
	switch rule.Type {
	case "percentage":
		return saleAmount * rule.Value / 100, nil
	case "fixed":
		return rule.Value, nil
	default:
		return 0, fmt.Errorf("نوع عمولة غير صالح")
	}
}

func (s *CommissionService) GetStaffPerformance(staffID, periodStart, periodEnd string) (*domain.StaffPerformance, error) {
	sales, err := s.saleRepo.GetByDateRange(periodStart, periodEnd)
	if err != nil {
		return nil, err
	}

	perf := &domain.StaffPerformance{
		StaffID:     staffID,
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
	}

	for _, sale := range sales {
		if sale.StaffID == staffID {
			if sale.Status == "completed" {
				perf.TotalSales += sale.Total
				perf.SalesCount++
			} else if sale.Status == "returned" {
				perf.TotalReturns += sale.Total
				perf.ReturnsCount++
			}
		}
	}

	if perf.SalesCount > 0 {
		perf.AvgSaleValue = perf.TotalSales / float64(perf.SalesCount)
	}

	payments, _ := s.repo.GetPaymentsByStaff(staffID)
	for _, p := range payments {
		perf.Commission += p.Amount
	}

	return perf, nil
}

func (s *CommissionService) GetAllStaffPerformance(periodStart, periodEnd string) ([]domain.StaffPerformance, error) {
	sales, err := s.saleRepo.GetByDateRange(periodStart, periodEnd)
	if err != nil {
		return nil, err
	}

	staffMap := make(map[string]*domain.StaffPerformance)
	for _, sale := range sales {
		sid := sale.StaffID
		if sid == "" {
			continue
		}
		if _, ok := staffMap[sid]; !ok {
			staffMap[sid] = &domain.StaffPerformance{
				StaffID:     sid,
				StaffName:   sale.StaffName,
				PeriodStart: periodStart,
				PeriodEnd:   periodEnd,
			}
		}
		if sale.Status == "completed" {
			staffMap[sid].TotalSales += sale.Total
			staffMap[sid].SalesCount++
		} else if sale.Status == "returned" {
			staffMap[sid].TotalReturns += sale.Total
			staffMap[sid].ReturnsCount++
		}
	}

	result := make([]domain.StaffPerformance, 0, len(staffMap))
	for _, perf := range staffMap {
		if perf.SalesCount > 0 {
			perf.AvgSaleValue = perf.TotalSales / float64(perf.SalesCount)
		}
		result = append(result, *perf)
	}
	return result, nil
}

func (s *CommissionService) CreatePayment(payment *domain.CommissionPayment) error {
	payment.CreatedAt = time.Now()
	return s.repo.CreatePayment(payment)
}

func (s *CommissionService) GetPayments(staffID string) ([]domain.CommissionPayment, error) {
	return s.repo.GetPaymentsByStaff(staffID)
}

func (s *CommissionService) MarkPaymentPaid(id uint) error {
	now := time.Now()
	if err := s.repo.UpdatePaymentStatus(id, "paid"); err != nil {
		return err
	}
	_ = now
	return nil
}
