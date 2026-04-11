package sqlite

import (
	"math"

	"bard/internal/domain"
	"bard/internal/repository"

	"gorm.io/gorm"
)

type productRepository struct {
	db *gorm.DB
}

// NewProductRepository creates a new product repository
func NewProductRepository(db *gorm.DB) repository.ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) GetAll(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
	var products []domain.Product
	var total int64

	query := r.db.Model(&domain.Product{})

	if search != "" {
		query = query.Where("name LIKE ? OR barcode LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if category != "" && category != "الكل" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)

	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Order("name ASC").Find(&products).Error; err != nil {
		return nil, err
	}

	var stats domain.ProductStats
	r.db.Model(&domain.Product{}).Select(
		"COALESCE(SUM(stock), 0) as total_stock, " +
			"COALESCE(SUM(stock * price), 0) as total_value, " +
			"COALESCE(SUM(stock * cost), 0) as total_cost",
	).Scan(&stats)
	stats.Profit = stats.TotalValue - stats.TotalCost

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &domain.PaginatedProducts{
		Data:       products,
		Total:      total,
		TotalPages: totalPages,
		Page:       page,
		Stats:      stats,
	}, nil
}

func (r *productRepository) GetByID(id string) (*domain.Product, error) {
	var product domain.Product
	if err := r.db.First(&product, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleProduct, "product")
	}
	return &product, nil
}

func (r *productRepository) GetByBarcode(barcode string) (*domain.Product, error) {
	var product domain.Product
	if err := r.db.First(&product, "barcode = ?", barcode).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleProduct, "product")
	}
	return &product, nil
}

func (r *productRepository) Create(product *domain.Product) error {
	return r.db.Create(product).Error
}

func (r *productRepository) Update(product *domain.Product) error {
	return r.db.Save(product).Error
}

func (r *productRepository) Delete(id string) error {
	return r.db.Delete(&domain.Product{}, "id = ?", id).Error
}

func (r *productRepository) GetCategories() ([]string, error) {
	var categories []string
	if err := r.db.Model(&domain.Product{}).Distinct().Pluck("category", &categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *productRepository) CreateCategory(cat *domain.Category) error {
	return r.db.Create(cat).Error
}

func (r *productRepository) GetStats() (*domain.ProductStats, error) {
	var stats domain.ProductStats
	err := r.db.Model(&domain.Product{}).Select(
		"COALESCE(SUM(stock), 0) as total_stock, " +
			"COALESCE(SUM(stock * price), 0) as total_value, " +
			"COALESCE(SUM(stock * cost), 0) as total_cost",
	).Scan(&stats).Error
	if err != nil {
		return nil, err
	}
	stats.Profit = stats.TotalValue - stats.TotalCost
	return &stats, nil
}

func (r *productRepository) GetLowStock(threshold int) ([]domain.Product, error) {
	var products []domain.Product
	err := r.db.Where("stock <= ?", threshold).Find(&products).Error
	return products, err
}

func (r *productRepository) Search(query string, limit int) ([]domain.Product, error) {
	var products []domain.Product
	err := r.db.Where("name LIKE ? OR barcode LIKE ?", "%"+query+"%", "%"+query+"%").
		Order(gorm.Expr("CASE WHEN barcode = ? THEN 0 WHEN barcode LIKE ? THEN 1 ELSE 2 END, name ASC", query, query+"%")).
		Limit(limit).Find(&products).Error
	return products, err
}
