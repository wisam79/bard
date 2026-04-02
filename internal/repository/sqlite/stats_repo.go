package sqlite

import (
	"bard/internal/domain"
	"bard/internal/repository"
	"time"

	"gorm.io/gorm"
)

type statsRepository struct {
	db *gorm.DB
}

// NewStatsRepository creates a new stats repository
func NewStatsRepository(db *gorm.DB) repository.StatsRepository {
	return &statsRepository{db: db}
}

func (r *statsRepository) GetDashboardStats() (*domain.DashboardStats, error) {
	stats := &domain.DashboardStats{}
	today := time.Now().Format("2006-01-02")
	startOfMonth := time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.Now().Location()).Format("2006-01-02")

	// Today stats
	r.db.Model(&domain.Sale{}).Where("date = ? AND status != 'return'", today).
		Select("COALESCE(SUM(total), 0), COUNT(*)").Row().Scan(&stats.TodaySales, &stats.TodayOrders)

	// Month stats
	r.db.Model(&domain.Sale{}).Where("date >= ? AND status != 'return'", startOfMonth).
		Select("COALESCE(SUM(total), 0), COUNT(*)").Row().Scan(&stats.MonthSales, &stats.MonthOrders)

	// Total products
	var totalProducts int64
	r.db.Model(&domain.Product{}).Count(&totalProducts)
	stats.TotalProducts = int(totalProducts)

	// Total customers
	var totalCustomers int64
	r.db.Model(&domain.Customer{}).Count(&totalCustomers)
	stats.TotalCustomers = int(totalCustomers)

	// Total debt
	var totalDebt float64
	r.db.Model(&domain.Customer{}).Select("COALESCE(SUM(debt + installment_debt), 0)").Row().Scan(&totalDebt)
	stats.TotalDebt = totalDebt

	// Low stock count
	var lowStockCount int64
	r.db.Model(&domain.Product{}).Where("stock <= 5").Count(&lowStockCount)
	stats.LowStockCount = int(lowStockCount)

	return stats, nil
}
