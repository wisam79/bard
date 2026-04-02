package sqlite

import (
	"bard/internal/domain"
	"bard/internal/repository"

	"gorm.io/gorm"
)

type shiftRepository struct {
	db *gorm.DB
}

func NewShiftRepository(db *gorm.DB) repository.ShiftRepository {
	return &shiftRepository{db: db}
}

func (r *shiftRepository) Create(shift *domain.Shift) error {
	return r.db.Create(shift).Error
}

func (r *shiftRepository) GetActive(staffID string) (*domain.Shift, error) {
	var shift domain.Shift
	if err := r.db.Where("staff_id = ? AND status = ?", staffID, "active").First(&shift).Error; err != nil {
		return nil, err
	}
	return &shift, nil
}

func (r *shiftRepository) Close(shift *domain.Shift) error {
	return r.db.Save(shift).Error
}

func (r *shiftRepository) GetAll(page, limit int) ([]domain.Shift, int64, error) {
	var shifts []domain.Shift
	var total int64

	r.db.Model(&domain.Shift{}).Count(&total)

	offset := (page - 1) * limit
	err := r.db.Offset(offset).Limit(limit).Order("created_at DESC").Find(&shifts).Error
	return shifts, total, err
}

func (r *shiftRepository) AddCashMovement(movement *domain.CashMovement) error {
	return r.db.Create(movement).Error
}

func (r *shiftRepository) GetCashMovements(shiftID string) ([]domain.CashMovement, error) {
	var movements []domain.CashMovement
	err := r.db.Where("shift_id = ?", shiftID).Order("timestamp DESC").Find(&movements).Error
	return movements, err
}

type supplierRepository struct {
	db *gorm.DB
}

func NewSupplierRepository(db *gorm.DB) repository.SupplierRepository {
	return &supplierRepository{db: db}
}

func (r *supplierRepository) GetAll() ([]domain.Supplier, error) {
	var suppliers []domain.Supplier
	err := r.db.Order("name ASC").Find(&suppliers).Error
	return suppliers, err
}

func (r *supplierRepository) GetByID(id string) (*domain.Supplier, error) {
	var supplier domain.Supplier
	if err := r.db.First(&supplier, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &supplier, nil
}

func (r *supplierRepository) Create(supplier *domain.Supplier) error {
	return r.db.Create(supplier).Error
}

func (r *supplierRepository) Update(supplier *domain.Supplier) error {
	return r.db.Save(supplier).Error
}

func (r *supplierRepository) Delete(id string) error {
	return r.db.Delete(&domain.Supplier{}, "id = ?", id).Error
}
