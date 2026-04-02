package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"time"

	"github.com/google/uuid"
)

// ShiftService handles shift business logic
type ShiftService struct {
	repo repository.ShiftRepository
	log  *logger.Logger
}

func NewShiftService(repo repository.ShiftRepository, log *logger.Logger) *ShiftService {
	return &ShiftService{repo: repo, log: log}
}

func (s *ShiftService) StartShift(staffID, staffName string, startCash float64) (*domain.Shift, error) {
	// Check if staff already has an active shift
	existing, _ := s.repo.GetActive(staffID)
	if existing != nil {
		return nil, &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "ACTIVE_SHIFT_EXISTS",
			Message: "Staff member already has an active shift",
		}
	}

	shift := &domain.Shift{
		ID:        uuid.New().String(),
		StaffID:   staffID,
		StaffName: staffName,
		StartTime: time.Now().Unix(),
		StartCash: startCash,
		Status:    "active",
		CreatedAt: time.Now(),
	}

	s.log.Info("Starting shift", "shiftID", shift.ID, "staffID", staffID)
	return shift, s.repo.Create(shift)
}

func (s *ShiftService) CloseShift(shiftID string, endCash float64) (*domain.Shift, error) {
	shift, err := s.repo.GetActive(shiftID)
	if err != nil {
		return nil, err
	}

	shift.EndTime = time.Now().Unix()
	shift.EndCash = endCash
	shift.Status = "closed"

	s.log.Info("Closing shift", "shiftID", shiftID)
	return shift, s.repo.Close(shift)
}

func (s *ShiftService) GetActiveShift(staffID string) (*domain.Shift, error) {
	return s.repo.GetActive(staffID)
}

func (s *ShiftService) GetShifts(page, limit int) ([]domain.Shift, int64, error) {
	return s.repo.GetAll(page, limit)
}

func (s *ShiftService) AddCashMovement(shiftID, staffID, movementType, reason string, amount float64) error {
	movement := &domain.CashMovement{
		ShiftID:   shiftID,
		Type:      movementType,
		Amount:    amount,
		Reason:    reason,
		StaffID:   staffID,
		Timestamp: time.Now().Unix(),
		CreatedAt: time.Now(),
	}

	s.log.Info("Adding cash movement", "shiftID", shiftID, "type", movementType, "amount", amount)
	return s.repo.AddCashMovement(movement)
}

func (s *ShiftService) GetCashMovements(shiftID string) ([]domain.CashMovement, error) {
	return s.repo.GetCashMovements(shiftID)
}

// SupplierService handles supplier business logic
type SupplierService struct {
	repo repository.SupplierRepository
	log  *logger.Logger
}

func NewSupplierService(repo repository.SupplierRepository, log *logger.Logger) *SupplierService {
	return &SupplierService{repo: repo, log: log}
}

func (s *SupplierService) GetAll() ([]domain.Supplier, error) {
	return s.repo.GetAll()
}

func (s *SupplierService) GetByID(id string) (*domain.Supplier, error) {
	return s.repo.GetByID(id)
}

func (s *SupplierService) Create(supplier *domain.Supplier) error {
	supplier.ID = uuid.New().String()
	supplier.CreatedAt = time.Now()
	supplier.UpdatedAt = time.Now()

	s.log.Info("Creating supplier", "name", supplier.Name)
	return s.repo.Create(supplier)
}

func (s *SupplierService) Update(supplier *domain.Supplier) error {
	supplier.UpdatedAt = time.Now()

	s.log.Info("Updating supplier", "id", supplier.ID)
	return s.repo.Update(supplier)
}

func (s *SupplierService) Delete(id string) error {
	s.log.Info("Deleting supplier", "id", id)
	return s.repo.Delete(id)
}
