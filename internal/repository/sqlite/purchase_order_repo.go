package sqlite

import (
	"bard/internal/domain"
	"bard/internal/repository"
	"errors"

	"gorm.io/gorm"
)

type PurchaseOrderRepository struct {
	db *gorm.DB
}

func NewPurchaseOrderRepository(db *gorm.DB) repository.PurchaseOrderRepository {
	return &PurchaseOrderRepository{db: db}
}

func (r *PurchaseOrderRepository) GetAll(page, limit int, status string) ([]domain.PurchaseOrder, int64, error) {
	var orders []domain.PurchaseOrder
	var total int64

	query := r.db.Model(&domain.PurchaseOrder{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	if err := query.Preload("Items").Order("created_at desc").Offset(offset).Limit(limit).Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (r *PurchaseOrderRepository) GetByID(id string) (*domain.PurchaseOrder, error) {
	var order domain.PurchaseOrder
	err := r.db.Preload("Items").First(&order, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &domain.AppError{
				Module:  domain.ModuleProduct,
				Code:    "NOT_FOUND",
				Message: "Purchase order not found",
			}
		}
		return nil, err
	}
	return &order, nil
}

func (r *PurchaseOrderRepository) Create(order *domain.PurchaseOrder) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return tx.Create(order).Error
	})
}

func (r *PurchaseOrderRepository) CreateWithStockUpdate(order *domain.PurchaseOrder) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Create the order first
		if err := tx.Create(order).Error; err != nil {
			return err
		}

		// Update stock and cost for each item
		for _, item := range order.Items {
			var product domain.Product
			if err := tx.First(&product, "id = ?", item.ProductID).Error; err != nil {
				return &domain.AppError{
					Module:  domain.ModuleProduct,
					Code:    "PRODUCT_NOT_FOUND",
					Message: "Product not found: " + item.ProductID,
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

			if err := tx.Model(&domain.Product{}).Where("id = ?", item.ProductID).Updates(map[string]interface{}{
				"stock": newTotalStock,
				"cost":  newCost,
			}).Error; err != nil {
				return &domain.AppError{
					Module:  domain.ModuleProduct,
					Code:    "STOCK_UPDATE_FAILED",
					Message: "Failed to update product stock and cost: " + item.ProductID,
				}
			}
		}

		return nil
	})
}

func (r *PurchaseOrderRepository) Update(order *domain.PurchaseOrder) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Replace items: Delete existing, then insert new ones (or let GORM handle it via association)
		if err := tx.Where("order_id = ?", order.ID).Delete(&domain.PurchaseOrderItem{}).Error; err != nil {
			return err
		}
		return tx.Save(order).Error
	})
}

func (r *PurchaseOrderRepository) Delete(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("order_id = ?", id).Delete(&domain.PurchaseOrderItem{}).Error; err != nil {
			return err
		}
		return tx.Delete(&domain.PurchaseOrder{}, "id = ?", id).Error
	})
}

func (r *PurchaseOrderRepository) UpdateStatus(id string, status string) error {
	return r.db.Model(&domain.PurchaseOrder{}).Where("id = ?", id).Update("status", status).Error
}

func (r *PurchaseOrderRepository) ReceiveWithStockUpdate(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var order domain.PurchaseOrder
		if err := tx.Preload("Items").First(&order, "id = ?", id).Error; err != nil {
			return err
		}

		if order.Status == "received" {
			return &domain.AppError{
				Module:  domain.ModuleProduct,
				Code:    "ALREADY_RECEIVED",
				Message: "Order is already received",
			}
		}

		if err := tx.Model(&domain.PurchaseOrder{}).Where("id = ?", id).Update("status", "received").Error; err != nil {
			return err
		}

		for _, item := range order.Items {
			var product domain.Product
			if err := tx.First(&product, "id = ?", item.ProductID).Error; err != nil {
				return &domain.AppError{
					Module:  domain.ModuleProduct,
					Code:    "PRODUCT_NOT_FOUND",
					Message: "Product not found: " + item.ProductID,
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

			if err := tx.Model(&domain.Product{}).Where("id = ?", item.ProductID).Updates(map[string]interface{}{
				"stock": newTotalStock,
				"cost":  newCost,
			}).Error; err != nil {
				return &domain.AppError{
					Module:  domain.ModuleProduct,
					Code:    "STOCK_UPDATE_FAILED",
					Message: "Failed to update product stock and cost: " + item.ProductID,
				}
			}
		}

		return nil
	})
}
