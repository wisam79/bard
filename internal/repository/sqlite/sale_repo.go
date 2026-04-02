package sqlite

import (
	"math"
	"time"

	"bard/internal/domain"
	"bard/internal/repository"

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
	if err := query.Preload("Items").Offset(offset).Limit(limit).
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
		return nil, err
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
			if sale.InstallmentPlan != nil {
				debtAmount := sale.InstallmentPlan.TotalAmount - sale.InstallmentPlan.DownPayment
				if err := tx.Model(&domain.Customer{}).Where("id = ?", sale.CustomerID).
					UpdateColumn("installment_debt", gorm.Expr("installment_debt + ?", debtAmount)).Error; err != nil {
					return err
				}
			}
		} else if sale.PaymentMethod == "split" && sale.CustomerID != "" {
			if creditAmount, ok := sale.SplitDetails["credit"]; ok && creditAmount > 0 {
				if err := tx.Model(&domain.Customer{}).Where("id = ?", sale.CustomerID).
					UpdateColumn("debt", gorm.Expr("debt + ?", creditAmount)).Error; err != nil {
					return err
				}
			}
		}

		// Update stock within transaction
		for _, item := range sale.Items {
			// Find existing product to calculate stock safely
			var product domain.Product
			if err := tx.First(&product, "id = ?", item.ProductID).Error; err != nil {
				// Don't error out if product is deleted, just continue? 
				// The old logic was logging this but returned success, let's keep it safe.
				continue
			}
			newStock := product.Stock - item.Quantity
			if newStock < 0 {
				newStock = 0
			}
			if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
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
	if err := query.Preload("Items").Offset(offset).Limit(limit).
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
	err := r.db.Preload("Items").Order("timestamp DESC").Limit(limit).Find(&sales).Error
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
	var total float64
	var count int64

	err := r.db.Model(&domain.Sale{}).
		Where("date = ? AND status != 'return'", today).
		Select("COALESCE(SUM(total), 0), COUNT(*)").
		Row().Scan(&total, &count)

	return total, int(count), err
}

func (r *saleRepository) GetMonthStats() (float64, int, error) {
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)

	var total float64
	var count int64

	err := r.db.Model(&domain.Sale{}).
		Where("date BETWEEN ? AND ? AND status != 'return'",
			startOfMonth.Format("2006-01-02"),
			endOfMonth.Format("2006-01-02")).
		Select("COALESCE(SUM(total), 0), COUNT(*)").
		Row().Scan(&total, &count)

	return total, int(count), err
}
