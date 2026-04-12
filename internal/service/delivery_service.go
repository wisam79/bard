package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type DeliveryService struct {
	repo repository.DeliveryRepository
	log  *logger.Logger
}

func NewDeliveryService(repo repository.DeliveryRepository, log *logger.Logger) *DeliveryService {
	return &DeliveryService{repo: repo, log: log}
}

func (s *DeliveryService) GetDrivers() ([]domain.DeliveryDriver, error) {
	return s.repo.GetDrivers()
}

func (s *DeliveryService) CreateDriver(driver *domain.DeliveryDriver) error {
	if driver.Name == "" || driver.Phone == "" {
		return fmt.Errorf("اسم وهاتف السائق مطلوبان")
	}
	driver.ID = uuid.New().String()
	driver.CreatedAt = time.Now()
	driver.UpdatedAt = time.Now()
	s.log.Info("Delivery driver created", "name", driver.Name)
	return s.repo.CreateDriver(driver)
}

func (s *DeliveryService) UpdateDriver(driver *domain.DeliveryDriver) error {
	driver.UpdatedAt = time.Now()
	return s.repo.UpdateDriver(driver)
}

func (s *DeliveryService) DeleteDriver(id string) error {
	return s.repo.DeleteDriver(id)
}

func (s *DeliveryService) GetOrders(page, limit int, status string) ([]domain.DeliveryOrder, int64, error) {
	return s.repo.GetOrders(page, limit, status)
}

func (s *DeliveryService) GetOrderBySale(saleID string) (*domain.DeliveryOrder, error) {
	return s.repo.GetOrderBySaleID(saleID)
}

func (s *DeliveryService) CreateOrder(order *domain.DeliveryOrder) error {
	if order.CustomerName == "" || order.Address == "" {
		return fmt.Errorf("اسم العميل والعنوان مطلوبان")
	}
	order.ID = uuid.New().String()
	order.Status = "pending"
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()
	s.log.Info("Delivery order created", "customer", order.CustomerName)
	return s.repo.CreateOrder(order)
}

func (s *DeliveryService) AssignDriver(orderID, driverID string) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	driver, err := s.repo.GetDriverByID(driverID)
	if err != nil {
		return err
	}
	order.DriverID = driver.ID
	order.DriverName = driver.Name
	order.Status = "assigned"
	order.UpdatedAt = time.Now()
	return s.repo.UpdateOrder(order)
}

func (s *DeliveryService) UpdateOrderStatus(orderID, status string) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	order.Status = status
	order.UpdatedAt = time.Now()
	if status == "delivered" {
		now := time.Now()
		order.DeliveredAt = &now
	}
	return s.repo.UpdateOrder(order)
}
