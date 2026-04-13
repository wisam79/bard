package sqlite

import (
	"math"
	"time"

	"bard/internal/domain"
	"bard/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type saleRepository struct {
	db *gorm.DB
}

// NewSaleRepository creates a new sale repository
func NewSaleRepository(db *gorm.DB) repository.SaleRepository {
	return &saleRepository{db: db}
}

func (r *saleRepository) GetAll(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	var sales []domain.Sale
	var total int64

	query := r.db.Model(&domain.Sale{})

	if search != "" {
		query = query.Where("customer_name LIKE ? OR id LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).
		Order("timestamp DESC").Find(&sales).Error; err != nil {
		return nil, err
	}

	var stats domain.InvoiceStats
	r.db.Model(&domain.Sale{}).Select(
		"COUNT(*) as count, " +
			"COALESCE(SUM(total), 0) as total, " +
			"COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending, " +
			"COUNT(CASE WHEN status = 'return' THEN 1 END) as returns",
	).Scan(&stats)

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &domain.PaginatedSales{
		Data:       sales,
		Total:      total,
		TotalPages: totalPages,
		Page:       page,
		Stats:      stats,
	}, nil
}

func (r *saleRepository) GetByID(id string) (*domain.Sale, error) {
	var sale domain.Sale
	if err := r.db.Preload("Items").First(&sale, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSales, "sale")
	}
	return &sale, nil
}

func (r *saleRepository) Create(sale *domain.Sale) error {
	return r.db.Create(sale).Error
}

func (r *saleRepository) CreateSaleWithStockUpdate(sale *domain.Sale) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Handle debt based on payment method
		if sale.PaymentMethod == "credit" && sale.CustomerID != "" {
			if err := tx.Model(&domain.Customer{}).Where("id = ?", sale.CustomerID).
				UpdateColumn("debt", gorm.Expr("debt + ?", sale.Total)).Error; err != nil {
				return err
			}
		} else if sale.PaymentMethod == "installment" && sale.CustomerID != "" {
			if sale.InstallmentPlan == nil {
				return &domain.AppError{
					Module:  domain.ModuleSales,
					Code:    "MISSING_INSTALLMENT_PLAN",
					Message: "Installment plan is required for installment sales",
				}
			}
			debtAmount := sale.InstallmentPlan.TotalAmount - sale.InstallmentPlan.DownPayment
			if err := tx.Model(&domain.Customer{}).Where("id = ?", sale.CustomerID).
				UpdateColumn("installment_debt", gorm.Expr("installment_debt + ?", debtAmount)).Error; err != nil {
				return err
			}
		} else if sale.PaymentMethod == "split" && sale.CustomerID != "" {
			if creditAmount, ok := sale.SplitDetails["credit"]; ok && creditAmount > 0 {
				if err := tx.Model(&domain.Customer{}).Where("id = ?", sale.CustomerID).
					UpdateColumn("debt", gorm.Expr("debt + ?", creditAmount)).Error; err != nil {
					return err
				}
			}
		}

		// Update stock within transaction using atomic SQL decrement
		for _, item := range sale.Items {
			var product domain.Product
			if err := tx.First(&product, "id = ?", item.ProductID).Error; err != nil {
				return &domain.AppError{
					Module:  domain.ModuleSales,
					Code:    "PRODUCT_NOT_FOUND",
					Message: "Product not found: " + item.ProductID,
				}
			}
			if product.Stock < item.Quantity {
				return &domain.AppError{
					Module:  domain.ModuleSales,
					Code:    "INSUFFICIENT_STOCK",
					Message: "Insufficient stock for " + product.Name,
				}
			}
			if err := tx.Model(&domain.Product{}).Where("id = ?", item.ProductID).
				UpdateColumn("stock", gorm.Expr("stock - ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		// Create the sale
		return tx.Create(sale).Error
	})
}

func (r *saleRepository) Update(sale *domain.Sale) error {
	return r.db.Session(&gorm.Session{FullSaveAssociations: true}).Save(sale).Error
}

func (r *saleRepository) GetByCustomerID(customerID string, page, limit int) (*domain.PaginatedSales, error) {
	var sales []domain.Sale
	var total int64

	query := r.db.Model(&domain.Sale{}).Where("customer_id = ?", customerID)
	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).
		Order("timestamp DESC").Find(&sales).Error; err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &domain.PaginatedSales{
		Data:       sales,
		Total:      total,
		TotalPages: totalPages,
		Page:       page,
	}, nil
}

func (r *saleRepository) GetByDateRange(startDate, endDate string) ([]domain.Sale, error) {
	var sales []domain.Sale
	err := r.db.Preload("Items").Where("date BETWEEN ? AND ?", startDate, endDate).
		Order("timestamp DESC").Find(&sales).Error
	return sales, err
}

func (r *saleRepository) GetRecent(limit int) ([]domain.Sale, error) {
	var sales []domain.Sale
	err := r.db.Order("timestamp DESC").Limit(limit).Find(&sales).Error
	return sales, err
}

func (r *saleRepository) GetStats(startDate, endDate string) (*domain.InvoiceStats, error) {
	var stats domain.InvoiceStats
	query := r.db.Model(&domain.Sale{})
	if startDate != "" && endDate != "" {
		query = query.Where("date BETWEEN ? AND ?", startDate, endDate)
	}
	err := query.Select(
		"COUNT(*) as count, " +
			"COALESCE(SUM(total), 0) as total, " +
			"COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending, " +
			"COUNT(CASE WHEN status = 'return' THEN 1 END) as returns",
	).Scan(&stats).Error
	return &stats, err
}

func (r *saleRepository) CreateParkedSale(parked *domain.ParkedSale) error {
	return r.db.Create(parked).Error
}

func (r *saleRepository) GetParkedSales() ([]domain.ParkedSale, error) {
	var parked []domain.ParkedSale
	err := r.db.Order("created_at DESC").Find(&parked).Error
	return parked, err
}

func (r *saleRepository) DeleteParkedSale(id uint) error {
	return r.db.Delete(&domain.ParkedSale{}, id).Error
}

func (r *saleRepository) GetTopProducts(limit int, startDate, endDate string) ([]domain.TopProduct, error) {
	var results []domain.TopProduct

	query := `
		SELECT 
			si.product_id as product_id,
			si.name,
			SUM(si.quantity) as total_qty,
			SUM(si.total) as total_amount
		FROM sale_items si
		JOIN sales s ON si.sale_id = s.id
		WHERE s.status != 'return'
	`
	args := []interface{}{}

	if startDate != "" && endDate != "" {
		query += " AND s.date BETWEEN ? AND ?"
		args = append(args, startDate, endDate)
	}

	query += " GROUP BY si.product_id, si.name ORDER BY total_qty DESC LIMIT ?"
	args = append(args, limit)

	err := r.db.Raw(query, args...).Scan(&results).Error
	return results, err
}

func (r *saleRepository) GetTodayStats() (float64, int, error) {
	today := time.Now().Format("2006-01-02")
	var total int64
	var count int64

	err := r.db.Model(&domain.Sale{}).
		Where("date = ? AND status != 'return'", today).
		Select("COALESCE(SUM(total), 0), COUNT(*)").
		Row().Scan(&total, &count)

	return float64(total), int(count), err
}

func (r *saleRepository) GetMonthStats() (float64, int, error) {
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)

	var total int64
	var count int64

	err := r.db.Model(&domain.Sale{}).
		Where("date BETWEEN ? AND ? AND status != 'return'",
			startOfMonth.Format("2006-01-02"),
			endOfMonth.Format("2006-01-02")).
		Select("COALESCE(SUM(total), 0), COUNT(*)").
		Row().Scan(&total, &count)

	return float64(total), int(count), err
}

func (r *saleRepository) ProcessReturnWithStockUpdate(originalSaleID string) (*domain.Sale, error) {
	original, err := r.GetByID(originalSaleID)
	if err != nil {
		return nil, err
	}

	returnSale := &domain.Sale{
		ID:            uuid.New().String(),
		CustomerID:    original.CustomerID,
		CustomerName:  original.CustomerName,
		StaffID:       original.StaffID,
		StaffName:     original.StaffName,
		Date:          time.Now().Format("2006-01-02"),
		Timestamp:     time.Now().Unix(),
		Status:        "return",
		PaymentMethod: original.PaymentMethod,
		Note:          "إرجاع - " + original.ID,
	}

	var total int64
	for _, item := range original.Items {
		returnItem := domain.SaleItem{
			ProductID: item.ProductID,
			Name:      item.Name,
			Price:     item.Price,
			Quantity:  item.Quantity,
			Total:     -item.Total,
			Cost:      item.Cost,
		}
		returnSale.Items = append(returnSale.Items, returnItem)
		total += item.Total
	}

	returnSale.Subtotal = -total
	returnSale.Discount = -original.Discount
	returnSale.VAT = -original.VAT
	returnSale.Total = -original.Total

	var createdReturn *domain.Sale
	err = r.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range original.Items {
			var product domain.Product
			if err := tx.First(&product, "id = ?", item.ProductID).Error; err != nil {
				return &domain.AppError{
					Module:  domain.ModuleProduct,
					Code:    "PRODUCT_NOT_FOUND",
					Message: "المنتج غير موجود لاستعادة المخزون: " + item.ProductID,
				}
			}
			newStock := product.Stock + item.Quantity
			if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
				return err
			}
		}

		if original.PaymentMethod == "credit" && original.CustomerID != "" {
			if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
				UpdateColumn("debt", gorm.Expr("debt - ?", original.Total)).Error; err != nil {
				return err
			}
		} else if original.PaymentMethod == "installment" && original.CustomerID != "" {
			if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
				UpdateColumn("installment_debt", gorm.Expr("installment_debt - ?", original.Total)).Error; err != nil {
				return err
			}
		} else if original.PaymentMethod == "split" && original.CustomerID != "" {
			if creditAmount, ok := original.SplitDetails["credit"]; ok && creditAmount > 0 {
				if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
					UpdateColumn("debt", gorm.Expr("debt - ?", creditAmount)).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Create(returnSale).Error; err != nil {
			return err
		}
		createdReturn = returnSale
		return nil
	})

	if err != nil {
		return nil, err
	}
	return createdReturn, nil
}

func (r *saleRepository) ProcessPartialReturnWithStockUpdate(originalSaleID string, returnItems []repository.PartialReturnItem) (*domain.Sale, error) {
	original, err := r.GetByID(originalSaleID)
	if err != nil {
		return nil, err
	}

	originalByProduct := make(map[string]*domain.SaleItem, len(original.Items))
	for i := range original.Items {
		originalByProduct[original.Items[i].ProductID] = &original.Items[i]
	}

	returnSale := &domain.Sale{
		ID:            uuid.New().String(),
		CustomerID:    original.CustomerID,
		CustomerName:  original.CustomerName,
		StaffID:       original.StaffID,
		StaffName:     original.StaffName,
		Date:          time.Now().Format("2006-01-02"),
		Timestamp:     time.Now().Unix(),
		Status:        "return",
		PaymentMethod: original.PaymentMethod,
		Note:          "إرجاع جزئي - " + original.ID,
	}

	var returnTotal int64
	for _, ri := range returnItems {
		orig := originalByProduct[ri.ProductID]
		unitPrice := float64(orig.Total) / orig.Quantity
		itemTotal := int64(math.Round(unitPrice * ri.Qty))
		returnItem := domain.SaleItem{
			SaleID:    returnSale.ID,
			ProductID: orig.ProductID,
			Name:      orig.Name,
			Price:     orig.Price,
			Quantity:  ri.Qty,
			Total:     -itemTotal,
			Cost:      orig.Cost,
		}
		returnSale.Items = append(returnSale.Items, returnItem)
		returnTotal += itemTotal
	}

	returnSale.Subtotal = -returnTotal
	returnSale.Total = -returnTotal

	var created *domain.Sale
	err = r.db.Transaction(func(tx *gorm.DB) error {
		for _, ri := range returnItems {
			var product domain.Product
			if err := tx.First(&product, "id = ?", ri.ProductID).Error; err != nil {
				return &domain.AppError{
					Module:  domain.ModuleProduct,
					Code:    "PRODUCT_NOT_FOUND",
					Message: "المنتج غير موجود لاستعادة المخزون: " + ri.ProductID,
				}
			}
			newStock := product.Stock + ri.Qty
			if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
				return err
			}

			if err := tx.Model(&domain.SaleItem{}).
				Where("sale_id = ? AND product_id = ?", originalSaleID, ri.ProductID).
				UpdateColumn("returned_qty", gorm.Expr("returned_qty + ?", ri.Qty)).Error; err != nil {
				return err
			}
		}

		if original.CustomerID != "" && original.Total != 0 {
			absTotal := math.Abs(float64(original.Total))
			if absTotal > 0.001 {
				ratio := float64(returnTotal) / absTotal
				debtReduction := int64(math.Round(float64(original.Total) * ratio))
				switch original.PaymentMethod {
				case "credit":
					if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
						UpdateColumn("debt", gorm.Expr("debt - ?", debtReduction)).Error; err != nil {
						return err
					}
				case "installment":
					if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
						UpdateColumn("installment_debt", gorm.Expr("installment_debt - ?", debtReduction)).Error; err != nil {
						return err
					}
				case "split":
					if creditAmount, ok := original.SplitDetails["credit"]; ok && creditAmount > 0 {
						creditReduction := int64(math.Round(float64(creditAmount) * ratio))
						if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
							UpdateColumn("debt", gorm.Expr("debt - ?", creditReduction)).Error; err != nil {
							return err
						}
					}
				}
			}
		}

		if err := tx.Create(returnSale).Error; err != nil {
			return err
		}
		created = returnSale
		return nil
	})

	if err != nil {
		return nil, err
	}
	return created, nil
}
