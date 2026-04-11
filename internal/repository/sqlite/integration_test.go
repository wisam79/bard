package sqlite_test

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/repository/sqlite"

	sqlitedriver "github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlitedriver.Open(":memory:"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	require.NoError(t, err)

	err = db.AutoMigrate(
		&domain.Product{},
		&domain.Sale{},
		&domain.SaleItem{},
		&domain.Customer{},
		&domain.Staff{},
		&domain.Expense{},
		&domain.Payment{},
		&domain.Category{},
		&domain.AppPreferences{},
		&domain.Discount{},
		&domain.ActivityLog{},
		&domain.SecurityLog{},
		&domain.ParkedSale{},
		&domain.Shift{},
		&domain.CashMovement{},
		&domain.LoginAttempt{},
		&domain.PurchaseOrder{},
		&domain.PurchaseOrderItem{},
		&domain.Supplier{},
		&domain.StockMovement{},
	)
	require.NoError(t, err)
	return db
}

func TestProductRepository_Integration_CreateAndGetByID(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewProductRepository(db)

	product := &domain.Product{
		ID:       "prod-1",
		Name:     "Test Product",
		Barcode:  "123456",
		Price:    100,
		Cost:     50,
		Stock:    10,
		Category: "Test",
		MinStock: 5,
	}

	err := repo.Create(product)
	require.NoError(t, err)

	result, err := repo.GetByID("prod-1")
	require.NoError(t, err)
	assert.Equal(t, "Test Product", result.Name)
	assert.Equal(t, "123456", result.Barcode)
	assert.Equal(t, float64(100), result.Price)
	assert.Equal(t, float64(10), result.Stock)
}

func TestProductRepository_Integration_GetByBarcode(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewProductRepository(db)

	product := &domain.Product{
		ID:      "prod-1",
		Name:    "Barcode Test",
		Barcode: "BC001",
		Price:   50,
		Stock:   5,
	}
	require.NoError(t, repo.Create(product))

	result, err := repo.GetByBarcode("BC001")
	require.NoError(t, err)
	assert.Equal(t, "Barcode Test", result.Name)

	_, err = repo.GetByBarcode("NONEXISTENT")
	assert.Error(t, err)
}

func TestProductRepository_Integration_Update(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewProductRepository(db)

	product := &domain.Product{
		ID:      "prod-1",
		Name:    "Original",
		Barcode: "BC001",
		Price:   100,
		Stock:   10,
	}
	require.NoError(t, repo.Create(product))

	product.Name = "Updated Name"
	product.Price = 150
	require.NoError(t, repo.Update(product))

	result, err := repo.GetByID("prod-1")
	require.NoError(t, err)
	assert.Equal(t, "Updated Name", result.Name)
	assert.Equal(t, float64(150), result.Price)
}

func TestProductRepository_Integration_Delete(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewProductRepository(db)

	product := &domain.Product{
		ID:      "prod-1",
		Name:    "To Delete",
		Barcode: "BC001",
		Price:   100,
		Stock:   10,
	}
	require.NoError(t, repo.Create(product))

	err := repo.Delete("prod-1")
	require.NoError(t, err)

	_, err = repo.GetByID("prod-1")
	assert.Error(t, err)
}

func TestProductRepository_Integration_GetAll_Pagination(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewProductRepository(db)

	for i := 1; i <= 25; i++ {
		require.NoError(t, repo.Create(&domain.Product{
			ID:       "prod-" + string(rune('0'+i)),
			Name:     "Product " + string(rune('0'+i)),
			Barcode:  "BC" + string(rune('0'+i)),
			Price:    float64(i * 10),
			Stock:    float64(i),
			Category: "Cat",
		}))
	}

	result, err := repo.GetAll(1, 10, "", "Cat")
	require.NoError(t, err)
	assert.Equal(t, 10, len(result.Data))
	assert.Equal(t, int64(25), result.Total)
	assert.Equal(t, 3, result.TotalPages)
	assert.Equal(t, 1, result.Page)
}

func TestProductRepository_Integration_Search(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewProductRepository(db)

	require.NoError(t, repo.Create(&domain.Product{ID: "1", Name: "Coffee", Barcode: "BC1", Price: 100, Stock: 10}))
	require.NoError(t, repo.Create(&domain.Product{ID: "2", Name: "Tea", Barcode: "BC2", Price: 50, Stock: 20}))
	require.NoError(t, repo.Create(&domain.Product{ID: "3", Name: "Coffee Maker", Barcode: "BC3", Price: 500, Stock: 5}))

	results, err := repo.Search("Coffee", 10)
	require.NoError(t, err)
	assert.Equal(t, 2, len(results))
}

func TestProductRepository_Integration_GetCategories(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewProductRepository(db)

	require.NoError(t, repo.Create(&domain.Product{ID: "1", Name: "A", Barcode: "BC1", Price: 100, Stock: 10, Category: "Drinks"}))
	require.NoError(t, repo.Create(&domain.Product{ID: "2", Name: "B", Barcode: "BC2", Price: 50, Stock: 20, Category: "Food"}))
	require.NoError(t, repo.Create(&domain.Product{ID: "3", Name: "C", Barcode: "BC3", Price: 75, Stock: 15, Category: "Drinks"}))

	categories, err := repo.GetCategories()
	require.NoError(t, err)
	assert.Contains(t, categories, "Drinks")
	assert.Contains(t, categories, "Food")
}

func TestProductRepository_Integration_GetLowStock(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewProductRepository(db)

	require.NoError(t, repo.Create(&domain.Product{ID: "1", Name: "A", Barcode: "BC1", Price: 100, Stock: 3, MinStock: 5}))
	require.NoError(t, repo.Create(&domain.Product{ID: "2", Name: "B", Barcode: "BC2", Price: 50, Stock: 10, MinStock: 5}))
	require.NoError(t, repo.Create(&domain.Product{ID: "3", Name: "C", Barcode: "BC3", Price: 75, Stock: 2, MinStock: 5}))

	lowStock, err := repo.GetLowStock(5)
	require.NoError(t, err)
	assert.Equal(t, 2, len(lowStock))
}

func TestCustomerRepository_Integration_CRUD(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewCustomerRepository(db)

	customer := &domain.Customer{
		ID:    "cust-1",
		Name:  "Test Customer",
		Phone: "0770000000",
	}

	require.NoError(t, repo.Create(customer))

	result, err := repo.GetByID("cust-1")
	require.NoError(t, err)
	assert.Equal(t, "Test Customer", result.Name)

	result, err = repo.GetByPhone("0770000000")
	require.NoError(t, err)
	assert.Equal(t, "cust-1", result.ID)

	customer.Name = "Updated Customer"
	require.NoError(t, repo.Update(customer))

	result, err = repo.GetByID("cust-1")
	require.NoError(t, err)
	assert.Equal(t, "Updated Customer", result.Name)

	require.NoError(t, repo.Delete("cust-1"))
	_, err = repo.GetByID("cust-1")
	assert.Error(t, err)
}

func TestCustomerRepository_Integration_GetAll(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewCustomerRepository(db)

	for i := 1; i <= 15; i++ {
		require.NoError(t, repo.Create(&domain.Customer{
			ID:    "cust-" + string(rune('0'+i)),
			Name:  "Customer " + string(rune('0'+i)),
			Phone: "077000000" + string(rune('0'+i)),
		}))
	}

	customers, total, err := repo.GetAll(1, 10, "")
	require.NoError(t, err)
	assert.Equal(t, 10, len(customers))
	assert.Equal(t, int64(15), total)
}

func TestCustomerRepository_Integration_UpdateDebt(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewCustomerRepository(db)

	require.NoError(t, repo.Create(&domain.Customer{
		ID:    "cust-1",
		Name:  "Debt Customer",
		Phone: "0770000000",
		Debt:  0,
	}))

	require.NoError(t, repo.UpdateDebt("cust-1", 500))

	result, err := repo.GetByID("cust-1")
	require.NoError(t, err)
	assert.Equal(t, float64(500), result.Debt)
}

func TestStaffRepository_Integration_CRUD(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewStaffRepository(db)

	staff := &domain.Staff{
		ID:       "staff-1",
		Username: "testuser",
		Name:     "Test User",
		Role:     "cashier",
		IsActive: true,
	}

	require.NoError(t, repo.Create(staff))

	result, err := repo.GetByID("staff-1")
	require.NoError(t, err)
	assert.Equal(t, "Test User", result.Name)

	result, err = repo.GetByUsername("testuser")
	require.NoError(t, err)
	assert.Equal(t, "staff-1", result.ID)

	staff.Name = "Updated Name"
	require.NoError(t, repo.Update(staff))

	result, err = repo.GetByID("staff-1")
	require.NoError(t, err)
	assert.Equal(t, "Updated Name", result.Name)

	all, err := repo.GetAll()
	require.NoError(t, err)
	assert.Equal(t, 1, len(all))
}

func TestSupplierRepository_Integration_CRUD(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewSupplierRepository(db)

	supplier := &domain.Supplier{
		ID:    "sup-1",
		Name:  "Test Supplier",
		Phone: "0770000000",
	}

	require.NoError(t, repo.Create(supplier))

	result, err := repo.GetByID("sup-1")
	require.NoError(t, err)
	assert.Equal(t, "Test Supplier", result.Name)

	supplier.Name = "Updated Supplier"
	require.NoError(t, repo.Update(supplier))

	result, err = repo.GetByID("sup-1")
	require.NoError(t, err)
	assert.Equal(t, "Updated Supplier", result.Name)

	all, err := repo.GetAll()
	require.NoError(t, err)
	assert.Equal(t, 1, len(all))

	require.NoError(t, repo.Delete("sup-1"))
	_, err = repo.GetByID("sup-1")
	assert.Error(t, err)
}

func TestPurchaseOrderRepository_Integration_CRUD(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewPurchaseOrderRepository(db)

	order := &domain.PurchaseOrder{
		ID:           "po-1",
		SupplierID:   "sup-1",
		SupplierName: "Test Supplier",
		Status:       "pending",
		Total:        500,
		Items: []domain.PurchaseOrderItem{
			{ProductID: "prod-1", Name: "Product 1", Qty: 10, Cost: 50, Total: 500},
		},
	}

	require.NoError(t, repo.Create(order))

	result, err := repo.GetByID("po-1")
	require.NoError(t, err)
	assert.Equal(t, "pending", result.Status)
	assert.Equal(t, 1, len(result.Items))

	require.NoError(t, repo.UpdateStatus("po-1", "received"))

	result, err = repo.GetByID("po-1")
	require.NoError(t, err)
	assert.Equal(t, "received", result.Status)

	require.NoError(t, repo.Delete("po-1"))
	_, err = repo.GetByID("po-1")
	assert.Error(t, err)
}

func TestPurchaseOrderRepository_Integration_GetAll(t *testing.T) {
	db := setupTestDB(t)
	repo := sqlite.NewPurchaseOrderRepository(db)

	for i := 1; i <= 5; i++ {
		status := "pending"
		if i > 3 {
			status = "received"
		}
		require.NoError(t, repo.Create(&domain.PurchaseOrder{
			ID:           "po-" + string(rune('0'+i)),
			SupplierID:   "sup-1",
			SupplierName: "Supplier",
			Status:       status,
			Total:        float64(i * 100),
		}))
	}

	result, total, err := repo.GetAll(1, 10, "pending")
	require.NoError(t, err)
	assert.Equal(t, int64(3), total)
	assert.Equal(t, 3, len(result))

	result, total, err = repo.GetAll(1, 10, "received")
	require.NoError(t, err)
	assert.Equal(t, int64(2), total)
	assert.Equal(t, 2, len(result))
}
