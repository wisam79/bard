package service_test

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"bard/internal/repository/sqlite"
	"bard/internal/service"
	"testing"

	gormsqlite "github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

// TestEnv holds the initialized in-memory database and services for testing
type TestEnv struct {
	DB                   *gorm.DB
	Log                  *logger.Logger
	SaleService          *service.SaleService
	PurchaseOrderService *service.PurchaseOrderService
	FinanceService       *service.FinanceService
	ProductRepo          repository.ProductRepository
	SaleRepo             repository.SaleRepository
	CustomerRepo         repository.CustomerRepository
	PurchaseOrderRepo    repository.PurchaseOrderRepository
	FinanceRepo          repository.FinanceRepository
}

// setupTestDB initializes an in-memory SQLite DB, migrates schemas, and returns a TestEnv
func setupTestDB(t *testing.T) *TestEnv {
	t.Helper()

	// Use in-memory SQLite database
	db, err := gorm.Open(gormsqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	// Auto-migrate domain models
	err = db.AutoMigrate(
		&domain.Product{},
		&domain.Sale{},
		&domain.SaleItem{},
		&domain.Customer{},
		&domain.PurchaseOrder{},
		&domain.PurchaseOrderItem{},
		&domain.Payment{},
		&domain.Expense{},
		&domain.Discount{},
		&domain.ParkedSale{},
	)
	if err != nil {
		t.Fatalf("failed to migrate test database: %v", err)
	}

	// Initialize repositories
	log := logger.New(logger.LevelDebug, false)
	productRepo := sqlite.NewProductRepository(db)
	saleRepo := sqlite.NewSaleRepository(db)
	customerRepo := sqlite.NewCustomerRepository(db)
	poRepo := sqlite.NewPurchaseOrderRepository(db)
	financeRepo := sqlite.NewFinanceRepository(db)

	// Initialize services
	saleService := service.NewSaleService(db, saleRepo, productRepo, customerRepo, log)
	poService := service.NewPurchaseOrderService(poRepo, productRepo, log)
	financeService := service.NewFinanceService(financeRepo, log)

	return &TestEnv{
		DB:                   db,
		Log:                  log,
		SaleService:          saleService,
		PurchaseOrderService: poService,
		FinanceService:       financeService,
		ProductRepo:          productRepo,
		SaleRepo:             saleRepo,
		CustomerRepo:         customerRepo,
		PurchaseOrderRepo:    poRepo,
		FinanceRepo:          financeRepo,
	}
}

// clearTables truncates data from tables after each test
func (env *TestEnv) clearTables(t *testing.T) {
	t.Helper()
	tables := []string{
		"products", "sales", "sale_items", "customers",
		"purchase_orders", "purchase_order_items", "payments",
		"expenses", "discounts", "parked_sales",
	}

	for _, table := range tables {
		if err := env.DB.Exec("DELETE FROM " + table).Error; err != nil {
			t.Fatalf("failed to clear table %s: %v", table, err)
		}
	}
}
