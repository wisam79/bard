package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"time"

	"github.com/google/uuid"
)

type KitchenService struct {
	repo repository.KitchenRepository
	log  *logger.Logger
}

func NewKitchenService(repo repository.KitchenRepository, log *logger.Logger) *KitchenService {
	return &KitchenService{repo: repo, log: log}
}

func (s *KitchenService) GetPendingOrders() ([]domain.KitchenOrder, error) {
	return s.repo.GetPendingOrders()
}

func (s *KitchenService) GetOrderByID(id string) (*domain.KitchenOrder, error) {
	return s.repo.GetOrderByID(id)
}

func (s *KitchenService) CreateOrder(saleID, tableNumber, priority, note string, items []domain.KitchenOrderItem) (*domain.KitchenOrder, error) {
	order := &domain.KitchenOrder{
		ID:          uuid.New().String(),
		SaleID:      saleID,
		TableNumber: tableNumber,
		Items:       items,
		Priority:    priority,
		Status:      "pending",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Note:        note,
	}
	if err := s.repo.CreateOrder(order); err != nil {
		return nil, err
	}
	s.log.Info("Kitchen order created", "saleID", saleID, "priority", priority)
	return order, nil
}

func (s *KitchenService) StartOrder(id string) error {
	order, err := s.repo.GetOrderByID(id)
	if err != nil {
		return err
	}
	now := time.Now()
	order.Status = "preparing"
	order.StartedAt = &now
	order.ElapsedMin = int(time.Since(order.CreatedAt).Minutes())
	s.log.Info("Kitchen order started", "id", id)
	return s.repo.UpdateOrder(order)
}

func (s *KitchenService) CompleteOrder(id string) error {
	order, err := s.repo.GetOrderByID(id)
	if err != nil {
		return err
	}
	now := time.Now()
	order.Status = "completed"
	order.CompletedAt = &now
	order.ElapsedMin = int(now.Sub(order.CreatedAt).Minutes())
	s.log.Info("Kitchen order completed", "id", id, "elapsed_min", order.ElapsedMin)
	return s.repo.UpdateOrder(order)
}

func (s *KitchenService) CancelOrder(id string) error {
	order, err := s.repo.GetOrderByID(id)
	if err != nil {
		return err
	}
	order.Status = "cancelled"
	return s.repo.UpdateOrder(order)
}

func (s *KitchenService) UpdateItemStatus(orderID string, itemID uint, status string) error {
	return s.repo.UpdateOrderItemStatus(orderID, itemID, status)
}

func (s *KitchenService) GetStations() ([]domain.KitchenStation, error) {
	return s.repo.GetStations()
}

func (s *KitchenService) CreateStation(station *domain.KitchenStation) error {
	station.ID = uuid.New().String()
	return s.repo.CreateStation(station)
}

func (s *KitchenService) UpdateStation(station *domain.KitchenStation) error {
	return s.repo.UpdateStation(station)
}

func (s *KitchenService) DeleteStation(id string) error {
	return s.repo.DeleteStation(id)
}

func (s *KitchenService) GetOrderTimers() (map[string]int, error) {
	orders, err := s.repo.GetPendingOrders()
	if err != nil {
		return nil, err
	}
	timers := make(map[string]int)
	for _, order := range orders {
		elapsed := int(time.Since(order.CreatedAt).Minutes())
		timers[order.ID] = elapsed
	}
	return timers, nil
}
