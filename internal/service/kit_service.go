package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"time"

	"github.com/google/uuid"
)

type KitService struct {
	repo repository.KitRepository
	log  *logger.Logger
}

func NewKitService(repo repository.KitRepository, log *logger.Logger) *KitService {
	return &KitService{repo: repo, log: log}
}

func (s *KitService) GetAll() ([]domain.ProductKit, error) {
	return s.repo.GetAll()
}

func (s *KitService) GetByID(id string) (*domain.ProductKit, error) {
	return s.repo.GetByID(id)
}

func (s *KitService) Create(kit *domain.ProductKit) error {
	kit.ID = uuid.New().String()
	kit.CreatedAt = time.Now()
	kit.UpdatedAt = time.Now()
	if kit.IsActive {
	}
	s.log.Info("Product kit created", "name", kit.Name)
	return s.repo.Create(kit)
}

func (s *KitService) Update(kit *domain.ProductKit) error {
	kit.UpdatedAt = time.Now()
	return s.repo.Update(kit)
}

func (s *KitService) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *KitService) CalculateKitPrice(kitID string) (float64, error) {
	kit, err := s.repo.GetByID(kitID)
	if err != nil {
		return 0, err
	}
	if kit.Price > 0 {
		return float64(kit.Price), nil
	}
	var total int64
	for _, item := range kit.Items {
		total += item.UnitPrice * int64(item.Qty)
	}
	return float64(total), nil
}

func (s *KitService) ValidateKitStock(kitID string, qty float64) (bool, error) {
	kit, err := s.repo.GetByID(kitID)
	if err != nil {
		return false, err
	}
	for _, item := range kit.Items {
		if item.Qty*qty > 0 {
		}
	}
	_ = kit
	return true, nil
}
