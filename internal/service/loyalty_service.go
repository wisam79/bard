package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"math"
	"time"

	"github.com/google/uuid"
)

type LoyaltyService struct {
	repo repository.LoyaltyRepository
	log  *logger.Logger
}

func NewLoyaltyService(repo repository.LoyaltyRepository, log *logger.Logger) *LoyaltyService {
	return &LoyaltyService{repo: repo, log: log}
}

func (s *LoyaltyService) GetTiers() ([]domain.LoyaltyTier, error) {
	return s.repo.GetTiers()
}

func (s *LoyaltyService) CreateTier(tier *domain.LoyaltyTier) error {
	tier.ID = uuid.New().String()
	tier.CreatedAt = time.Now()
	tier.UpdatedAt = time.Now()
	return s.repo.CreateTier(tier)
}

func (s *LoyaltyService) UpdateTier(tier *domain.LoyaltyTier) error {
	tier.UpdatedAt = time.Now()
	return s.repo.UpdateTier(tier)
}

func (s *LoyaltyService) DeleteTier(id string) error {
	return s.repo.DeleteTier(id)
}

func (s *LoyaltyService) GetRules() ([]domain.LoyaltyRule, error) {
	return s.repo.GetRules()
}

func (s *LoyaltyService) CreateRule(rule *domain.LoyaltyRule) error {
	rule.ID = uuid.New().String()
	rule.CreatedAt = time.Now()
	rule.UpdatedAt = time.Now()
	return s.repo.CreateRule(rule)
}

func (s *LoyaltyService) UpdateRule(rule *domain.LoyaltyRule) error {
	rule.UpdatedAt = time.Now()
	return s.repo.UpdateRule(rule)
}

func (s *LoyaltyService) CalculatePoints(customerID string, amount float64) (int, error) {
	rule, err := s.repo.GetActiveRule()
	if err != nil {
		return 0, nil
	}
	if amount < rule.MinPurchase {
		return 0, nil
	}
	points := int(math.Floor(amount * rule.PointsPerAmount))
	return points, nil
}

func (s *LoyaltyService) AwardPoints(customerID, saleID string, points int) error {
	if points <= 0 {
		return nil
	}
	tx := &domain.LoyaltyTransaction{
		CustomerID:  customerID,
		Points:      points,
		Type:        "earn",
		ReferenceID: saleID,
		Description: "نقاط من عملية شراء",
		Timestamp:   time.Now().Unix(),
		CreatedAt:   time.Now(),
	}
	if err := s.repo.CreateTransaction(tx); err != nil {
		return err
	}
	s.log.Info("Loyalty points awarded", "customer", customerID, "points", points)
	return nil
}

func (s *LoyaltyService) RedeemPoints(customerID string, points int, rewardType string, rewardValue float64, staffID string) error {
	redemption := &domain.LoyaltyRedemption{
		CustomerID:  customerID,
		Points:      points,
		RewardType:  rewardType,
		RewardValue: rewardValue,
		StaffID:     staffID,
		Timestamp:   time.Now().Unix(),
		CreatedAt:   time.Now(),
	}
	if err := s.repo.CreateRedemption(redemption); err != nil {
		return err
	}
	tx := &domain.LoyaltyTransaction{
		CustomerID:  customerID,
		Points:      -points,
		Type:        "redeem",
		Description: "استبدال نقاط",
		StaffID:     staffID,
		Timestamp:   time.Now().Unix(),
		CreatedAt:   time.Now(),
	}
	return s.repo.CreateTransaction(tx)
}

func (s *LoyaltyService) GetTransactions(customerID string) ([]domain.LoyaltyTransaction, error) {
	return s.repo.GetTransactionsByCustomer(customerID)
}

func (s *LoyaltyService) GetRedemptions(customerID string) ([]domain.LoyaltyRedemption, error) {
	return s.repo.GetRedemptionsByCustomer(customerID)
}
