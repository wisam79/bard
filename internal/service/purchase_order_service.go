package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"time"

	"github.com/google/uuid"
)

type PurchaseOrderService struct {
	repo     repository.PurchaseOrderRepository
	products repository.ProductRepository
	log      *logger.Logger
}

func NewPurchaseOrderService(repo repository.PurchaseOrderRepository, products repository.ProductRepository, log *logger.Logger) *PurchaseOrderService {
	return &PurchaseOrderService{
		repo:     repo,
		products: products,
		log:      log,
	}
}

func (s *PurchaseOrderService) GetAll(page, limit int, status string) (*domain.PaginatedResponse[domain.PurchaseOrder], error) {
	orders, total, err := s.repo.GetAll(page, limit, status)
	if err != nil {
		return nil, err
	}

	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}

	return &domain.PaginatedResponse[domain.PurchaseOrder]{
		Data:       orders,
		Total:      total,
		TotalPages: totalPages,
		Page:       page,
	}, nil
}

func (s *PurchaseOrderService) GetByID(id string) (*domain.PurchaseOrder, error) {
	return s.repo.GetByID(id)
}

func (s *PurchaseOrderService) Create(order *domain.PurchaseOrder) error {
	order.ID = uuid.New().String()
	order.Date = time.Now().Format("2006-01-02")
	if order.Status == "" {
		order.Status = "pending"
	}
	order.CreatedAt = time.Now()
	order.UpdatedAt = time.Now()

	s.log.Info("Creating purchase order", "id", order.ID, "total", order.Total)
	err := s.repo.Create(order)
	if err != nil {
		return err
	}

	if order.Status == "received" {
		return s.HandleReceivedOrder(order)
	}
	return nil
}

func (s *PurchaseOrderService) Update(order *domain.PurchaseOrder) error {
	order.UpdatedAt = time.Now()
	s.log.Info("Updating purchase order", "id", order.ID)
	return s.repo.Update(order)
}

func (s *PurchaseOrderService) Delete(id string) error {
	s.log.Info("Deleting purchase order", "id", id)
	return s.repo.Delete(id)
}

func (s *PurchaseOrderService) ReceiveOrder(id string) error {
	order, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	if order.Status == "received" {
		return &domain.AppError{
			Module:  domain.ModuleProduct,
			Code:    "ALREADY_RECEIVED",
			Message: "Order is already received",
		}
	}

	err = s.repo.UpdateStatus(id, "received")
	if err != nil {
		return err
	}

	s.log.Info("Receiving purchase order", "id", id)
	return s.HandleReceivedOrder(order)
}

func (s *PurchaseOrderService) HandleReceivedOrder(order *domain.PurchaseOrder) error {
	// Update product stock and calculate average cost
	for _, item := range order.Items {
		product, err := s.products.GetByID(item.ProductID)
		if err != nil {
			s.log.Error("Failed to fetch product for stock update", "productID", item.ProductID, "error", err)
			continue // skip or return error? We'll log and continue to avoid full failure for missing items
		}

		// Calculate new average cost: (CurrentStock * CurrentCost + AddedStock * AddedCost) / (CurrentStock + AddedStock)
		newTotalCost := (float64(product.Stock) * product.Cost) + (item.Qty * item.Cost)
		newTotalStock := float64(product.Stock) + item.Qty

		var newCost float64
		if newTotalStock > 0 {
			newCost = newTotalCost / newTotalStock
		} else {
			newCost = item.Cost // fallback
		}

		product.Stock = newTotalStock
		product.Cost = newCost

		if err := s.products.Update(product); err != nil {
			s.log.Error("Failed to update product stock and cost", "productID", item.ProductID, "error", err)
		}
	}
	return nil
}
