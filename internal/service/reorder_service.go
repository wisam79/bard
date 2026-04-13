package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type ReorderService struct {
	repo     repository.ReorderRepository
	prodRepo repository.ProductRepository
	log      *logger.Logger
}

func NewReorderService(repo repository.ReorderRepository, prodRepo repository.ProductRepository, log *logger.Logger) *ReorderService {
	return &ReorderService{repo: repo, prodRepo: prodRepo, log: log}
}

func (s *ReorderService) GetRules() ([]domain.ReorderRule, error) {
	rules, err := s.repo.GetRules()
	if err != nil {
		return nil, err
	}
	for i := range rules {
		p, err := s.prodRepo.GetByID(rules[i].ProductID)
		if err == nil {
			rules[i].ProductName = p.Name
		}
	}
	return rules, nil
}

func (s *ReorderService) CreateRule(rule *domain.ReorderRule) error {
	if rule.ProductID == "" {
		return fmt.Errorf("معرف المنتج مطلوب")
	}
	rule.ID = uuid.New().String()
	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()
	p, err := s.prodRepo.GetByID(rule.ProductID)
	if err != nil {
		return fmt.Errorf("المنتج غير موجود: %w", err)
	}
	rule.ProductName = p.Name
	
	s.log.Info("Reorder rule created", "product", rule.ProductID)
	return s.repo.CreateRule(rule)
}

func (s *ReorderService) UpdateRule(rule *domain.ReorderRule) error {
	rule.UpdatedAt = time.Now()
	return s.repo.UpdateRule(rule)
}

func (s *ReorderService) DeleteRule(id string) error {
	return s.repo.DeleteRule(id)
}

func (s *ReorderService) GetAlerts() ([]domain.ReorderAlert, error) {
	return s.repo.GetAlerts()
}

func (s *ReorderService) AutoReorder() (int, error) {
	alerts, err := s.repo.GetAlerts()
	if err != nil {
		return 0, err
	}

	reordered := 0
	for _, alert := range alerts {
		rule, err := s.repo.GetRuleByProductID(alert.ProductID)
		if err != nil || !rule.AutoOrder {
			continue
		}
		s.log.Info("Auto-reorder triggered", "product", alert.ProductName, "qty", rule.ReorderQty)
		reordered++
	}
	return reordered, nil
}

func (s *ReorderService) CheckLowStock() ([]domain.ReorderAlert, error) {
	lowStock, err := s.prodRepo.GetLowStock(5)
	if err != nil {
		return nil, err
	}

	alerts := make([]domain.ReorderAlert, 0)
	for _, p := range lowStock {
		alert := domain.ReorderAlert{
			ProductID:    p.ID,
			ProductName:  p.Name,
			CurrentStock: p.Stock,
			ReorderPoint: float64(p.MinStock),
		}
		rule, err := s.repo.GetRuleByProductID(p.ID)
		if err == nil {
			alert.SuggestedQty = rule.ReorderQty
			alert.SupplierID = rule.SupplierID
		}
		alerts = append(alerts, alert)
	}
	return alerts, nil
}
