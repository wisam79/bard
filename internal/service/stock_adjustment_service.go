package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"time"

	"github.com/google/uuid"
)

type StockAdjustmentService struct {
	adjustRepo  repository.StockAdjustmentRepository
	productRepo repository.ProductRepository
	log         *logger.Logger
}

func NewStockAdjustmentService(
	adjustRepo repository.StockAdjustmentRepository,
	productRepo repository.ProductRepository,
	log *logger.Logger,
) *StockAdjustmentService {
	return &StockAdjustmentService{adjustRepo: adjustRepo, productRepo: productRepo, log: log}
}

func (s *StockAdjustmentService) CreateAdjustment(productID, adjType, reason string, newQty float64, staffID, staffName string) error {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return err
	}

	qtyBefore := product.Stock
	delta := newQty - qtyBefore
	costImpact := delta * product.Cost

	adj := &domain.StockAdjustment{
		ID:          uuid.New().String(),
		ProductID:   productID,
		ProductName: product.Name,
		Type:        adjType,
		QtyBefore:   qtyBefore,
		QtyAfter:    newQty,
		Delta:       delta,
		Reason:      reason,
		CostImpact:  costImpact,
		StaffID:     staffID,
		StaffName:   staffName,
		CreatedAt:   time.Now(),
	}

	if err := s.adjustRepo.CreateAdjustment(adj); err != nil {
		return err
	}

	product.Stock = newQty
	if err := s.productRepo.Update(product); err != nil {
		return err
	}

	s.log.Info("Stock adjustment created", "product", product.Name, "type", adjType, "delta", delta)
	return nil
}

func (s *StockAdjustmentService) GetAdjustments(page, limit int, adjType string) ([]domain.StockAdjustment, int64, error) {
	return s.adjustRepo.GetAdjustments(page, limit, adjType)
}

func (s *StockAdjustmentService) CreateWasteRecord(productID, wasteType, reason string, qty float64, staffID, staffName string) error {
	product, err := s.productRepo.GetByID(productID)
	if err != nil {
		return err
	}

	if product.Stock < qty {
		return &domain.AppError{
			Module:  domain.ModuleInventory,
			Code:    "INSUFFICIENT_STOCK",
			Message: "الكمية المتوفرة أقل من الكمية المهدرة",
			Hint:    product.Name,
		}
	}

	costLoss := qty * product.Cost
	record := &domain.WasteRecord{
		ProductID:   productID,
		ProductName: product.Name,
		Qty:         qty,
		WasteType:   wasteType,
		CostLoss:    costLoss,
		Reason:      reason,
		StaffID:     staffID,
		StaffName:   staffName,
		Date:        time.Now().Format("2006-01-02"),
		CreatedAt:   time.Now(),
	}

	if err := s.adjustRepo.CreateWasteRecord(record); err != nil {
		return err
	}

	product.Stock -= qty
	if err := s.productRepo.Update(product); err != nil {
		return err
	}

	s.log.Info("Waste record created", "product", product.Name, "qty", qty, "type", wasteType, "cost", costLoss)
	return nil
}

func (s *StockAdjustmentService) GetWasteRecords(page, limit int, wasteType string) ([]domain.WasteRecord, int64, error) {
	return s.adjustRepo.GetWasteRecords(page, limit, wasteType)
}

func (s *StockAdjustmentService) GetWasteSummary(startDate, endDate string) ([]domain.WasteRecord, error) {
	return s.adjustRepo.GetWasteSummary(startDate, endDate)
}

func (s *StockAdjustmentService) GetStockVarianceReport() ([]domain.StockVarianceReport, error) {
	products, err := s.productRepo.GetAll(1, 10000, "", "")
	if err != nil {
		return nil, err
	}

	var reports []domain.StockVarianceReport
	for _, p := range products.Data {
		if p.Stock <= 0 {
			continue
		}
		var variancePct float64
		if p.Stock > 0 {
			variancePct = 0
		}

		reports = append(reports, domain.StockVarianceReport{
			ProductID:   p.ID,
			ProductName: p.Name,
			SystemQty:   p.Stock,
			PhysicalQty: p.Stock,
			Variance:    0,
			VariancePct: variancePct,
			CostImpact:  0,
		})
	}
	return reports, nil
}
