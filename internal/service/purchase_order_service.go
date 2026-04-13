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

	var totalPages int
	if limit > 0 {
		totalPages = int(total) / limit
		if int(total)%limit > 0 {
			totalPages++
		}
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

	if order.Status == "received" {
		return s.repo.CreateWithStockUpdate(order)
	}
	return s.repo.Create(order)
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

	if len(order.Items) == 0 {
		return &domain.AppError{
			Module:  domain.ModuleProduct,
			Code:    "EMPTY_ORDER",
			Message: "Cannot receive an order with no items",
		}
	}

	s.log.Info("Receiving purchase order", "id", id, "items", len(order.Items))

	return s.repo.ReceiveWithStockUpdate(id)
}

func (s *PurchaseOrderService) HandleReceivedOrder(order *domain.PurchaseOrder) error {
	for _, item := range order.Items {
		product, err := s.products.GetByID(item.ProductID)
		if err != nil {
			s.log.Error("Failed to fetch product for stock update", "productID", item.ProductID, "error", err)
			return &domain.AppError{
				Module:  domain.ModuleProduct,
				Code:    "PRODUCT_NOT_FOUND",
				Message: "Failed to fetch product for stock update: " + item.ProductID,
			}
		}

		newTotalCost := (int64(product.Stock) * product.Cost) + (int64(item.Qty) * item.Cost)
		newTotalStock := product.Stock + item.Qty

		var newCost int64
		if newTotalStock > 0 {
			newCost = newTotalCost / int64(newTotalStock)
		} else {
			newCost = item.Cost
		}

		product.Stock = newTotalStock
		product.Cost = newCost

		if err := s.products.Update(product); err != nil {
			s.log.Error("Failed to update product stock and cost", "productID", item.ProductID, "error", err)
			return &domain.AppError{
				Module:  domain.ModuleProduct,
				Code:    "STOCK_UPDATE_FAILED",
				Message: "Failed to update product stock and cost: " + item.ProductID,
			}
		}
	}
	return nil
}
