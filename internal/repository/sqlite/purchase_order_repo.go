package sqlite

import (
	"bard/internal/domain"
	"errors"

	"gorm.io/gorm"
)

type PurchaseOrderRepository struct {
	db *gorm.DB
}

func NewPurchaseOrderRepository(db *gorm.DB) *PurchaseOrderRepository {
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
