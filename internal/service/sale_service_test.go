package service_test

import (
	"testing"

	"bard/internal/domain"
	"bard/internal/service"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSaleService_CreateSale_Success(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	// Create a product
	product := &domain.Product{
		ID:    uuid.New().String(),
		Name:  "Test Product",
		Stock: 10,
		Price: 100,
		Cost:  50,
	}
	err := env.ProductRepo.Create(product)
	require.NoError(t, err)

	// Create a sale
	sale := &domain.Sale{
		CustomerID:    "cust1",
		CustomerName:  "Test Customer",
		PaymentMethod: "cash",
		Items: []domain.SaleItem{
			{
				ProductID: product.ID,
				Name:      product.Name,
				Quantity:  2,
				Price:     100,
				Cost:      50,
				Total:     200,
			},
		},
		Subtotal: 200,
		Total:    200,
	}

	err = env.SaleService.Create(sale)
	require.NoError(t, err)
	assert.NotEmpty(t, sale.ID)

	// Verify stock is deducted
	updatedProduct, err := env.ProductRepo.GetByID(product.ID)
	require.NoError(t, err)
	assert.Equal(t, float64(8), updatedProduct.Stock)

	// Verify sale is persisted
	savedSale, err := env.SaleRepo.GetByID(sale.ID)
	require.NoError(t, err)
	assert.Equal(t, sale.ID, savedSale.ID)
	assert.Equal(t, float64(200), savedSale.Total)
}

func TestSaleService_CreateSale_InsufficientStock(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	product := &domain.Product{
		ID:    uuid.New().String(),
		Name:  "Test Product",
		Stock: 1, // Only 1 in stock
		Price: 100,
		Cost:  50,
	}
	require.NoError(t, env.ProductRepo.Create(product))

	sale := &domain.Sale{
		Items: []domain.SaleItem{
			{
				ProductID: product.ID,
				Quantity:  2, // Trying to buy 2
				Price:     100,
			},
		},
	}

	err := env.SaleService.Create(sale)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Insufficient stock")

	// Verify stock remains untouched
	updatedProduct, _ := env.ProductRepo.GetByID(product.ID)
	assert.Equal(t, float64(1), updatedProduct.Stock)
}

func TestSaleService_ProcessReturn_Success(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	product := &domain.Product{
		ID:    uuid.New().String(),
		Name:  "Test Product",
		Stock: 5,
		Price: 100,
		Cost:  50,
	}
	require.NoError(t, env.ProductRepo.Create(product))

	customer := &domain.Customer{
		ID:   uuid.New().String(),
		Name: "Test Customer",
		Debt: 200,
	}
	require.NoError(t, env.CustomerRepo.Create(customer))

	// Create initial credit sale
	sale := &domain.Sale{
		ID:            uuid.New().String(),
		CustomerID:    customer.ID,
		CustomerName:  customer.Name,
		PaymentMethod: "credit",
		Items: []domain.SaleItem{
			{
				ProductID: product.ID,
				Name:      product.Name,
				Quantity:  2,
				Price:     100,
				Cost:      50,
				Total:     200,
			},
		},
		Subtotal: 200,
		Total:    200,
	}
	require.NoError(t, env.SaleRepo.CreateSaleWithStockUpdate(sale)) // Use repo to skip Create logic for setup

	// Update stock manually for test setup because CreateSaleWithStockUpdate handles it,
	// wait, CreateSaleWithStockUpdate deducts stock inside transaction. Let's verify.
	updatedProduct, _ := env.ProductRepo.GetByID(product.ID)
	assert.Equal(t, float64(3), updatedProduct.Stock)

	// Process full return
	returnSale, err := env.SaleService.ProcessReturn(sale.ID)
	require.NoError(t, err)
	assert.NotNil(t, returnSale)
	assert.Equal(t, "return", returnSale.Status)
	assert.Equal(t, float64(-200), returnSale.Total)

	// Verify stock restored
	updatedProduct, _ = env.ProductRepo.GetByID(product.ID)
	assert.Equal(t, float64(5), updatedProduct.Stock)

	// Verify debt reduced
	updatedCustomer, _ := env.CustomerRepo.GetByID(customer.ID)
	// Original debt was 200. Sale total was 200. Because we used CreateSaleWithStockUpdate, which DOES increase debt for credit sales:
	// Debt became 200 + 200 = 400.
	// ProcessReturn reverses the 200 total, so debt should be 400 - 200 = 200.
	assert.Equal(t, float64(200), updatedCustomer.Debt)
}

func TestSaleService_ProcessPartialReturn_Success(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	product := &domain.Product{
		ID:    uuid.New().String(),
		Name:  "Test Product",
		Stock: 8,
		Price: 100,
		Cost:  50,
	}
	require.NoError(t, env.ProductRepo.Create(product))

	customer := &domain.Customer{
		ID:   uuid.New().String(),
		Name: "Test Customer",
		Debt: 300,
	}
	require.NoError(t, env.CustomerRepo.Create(customer))

	// Initial Sale: Buy 3 items = 300 total
	sale := &domain.Sale{
		ID:            uuid.New().String(),
		CustomerID:    customer.ID,
		PaymentMethod: "credit",
		Subtotal:      300,
		Total:         300,
		Items: []domain.SaleItem{
			{
				ProductID: product.ID,
				Quantity:  3,
				Price:     100,
				Total:     300,
			},
		},
	}
	require.NoError(t, env.SaleRepo.CreateSaleWithStockUpdate(sale))

	// Return 1 item
	returnItems := []service.PartialReturnItem{
		{ProductID: product.ID, Quantity: 1},
	}
	returnSale, err := env.SaleService.ProcessPartialReturn(sale.ID, returnItems)
	require.NoError(t, err)
	assert.Equal(t, float64(-100), returnSale.Total)

	// Verify stock restored by 1
	updatedProduct, _ := env.ProductRepo.GetByID(product.ID)
	assert.Equal(t, float64(6), updatedProduct.Stock) // Original 8 - 3 bought + 1 returned = 6

	// Verify debt reduced proportionally (300 - 100)
	updatedCustomer, _ := env.CustomerRepo.GetByID(customer.ID)
	// Initial debt 300. CreateSaleWithStockUpdate added 300 (Total). Debt = 600.
	// ProcessPartialReturn reverses 100. Debt = 600 - 100 = 500.
	assert.Equal(t, float64(500), updatedCustomer.Debt)

	// Verify returned_qty on original sale item
	updatedSale, _ := env.SaleRepo.GetByID(sale.ID)
	assert.Equal(t, float64(1), updatedSale.Items[0].ReturnedQty)

	// Edge case: Try to return remaining 3 (which exceeds available 2)
	_, err = env.SaleService.ProcessPartialReturn(sale.ID, []service.PartialReturnItem{
		{ProductID: product.ID, Quantity: 3},
	})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "الكمية المتاحة")
}

func TestSaleService_ProcessPartialReturn_EmptyItems(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	_, err := env.SaleService.ProcessPartialReturn("some-id", []service.PartialReturnItem{})
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "يجب تحديد عنصر واحد")
}

func TestSaleService_CreateSale_CalculateTotals(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	product1 := &domain.Product{ID: uuid.New().String(), Name: "P1", Barcode: "B1", Stock: 10, Price: 100}
	product2 := &domain.Product{ID: uuid.New().String(), Name: "P2", Barcode: "B2", Stock: 10, Price: 50}
	require.NoError(t, env.ProductRepo.Create(product1))
	require.NoError(t, env.ProductRepo.Create(product2))

	sale := &domain.Sale{
		Discount: 20,
		VAT:      10,
		Items: []domain.SaleItem{
			{ProductID: product1.ID, Quantity: 2, Price: 100, Total: 200},
			{ProductID: product2.ID, Quantity: 3, Price: 50, Total: 150},
		},
	}

	err := env.SaleService.Create(sale)
	require.NoError(t, err)

	savedSale, _ := env.SaleRepo.GetByID(sale.ID)
	assert.Equal(t, float64(350), savedSale.Subtotal)
	assert.Equal(t, float64(340), savedSale.Total) // 350 - 20 (discount) + 10 (vat)
}
