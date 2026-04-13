package service_test

import (
	"testing"

	"bard/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPurchaseOrderService_CreateAndReceive(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	// Create a product with existing stock and cost to test weighted average
	product := &domain.Product{
		ID:      uuid.New().String(),
		Name:    "Test Product",
		Barcode: "P123",
		Stock:   10,
		Cost:    50, // Total cost value = 500
	}
	require.NoError(t, env.ProductRepo.Create(product))

	// Create a purchase order
	order := &domain.PurchaseOrder{
		SupplierID:   "sup1",
		SupplierName: "Test Supplier",
		Total:        1200, // 20 * 60
		Status:       "pending",
		Items: []domain.PurchaseOrderItem{
			{
				ProductID: product.ID,
				Name:      product.Name,
				Qty:       20,
				Cost:      60, // Total cost for this PO item = 1200
				Total:     1200,
			},
		},
	}

	err := env.PurchaseOrderService.Create(order)
	require.NoError(t, err)
	assert.NotEmpty(t, order.ID)
	assert.Equal(t, "pending", order.Status)

	// Verify stock and cost remains unchanged while pending
	updatedProduct, _ := env.ProductRepo.GetByID(product.ID)
	assert.Equal(t, float64(10), updatedProduct.Stock)
	assert.Equal(t, float64(50), updatedProduct.Cost)

	// Receive the order
	err = env.PurchaseOrderService.ReceiveOrder(order.ID)
	require.NoError(t, err)

	// Verify status updated
	savedOrder, _ := env.PurchaseOrderRepo.GetByID(order.ID)
	assert.Equal(t, "received", savedOrder.Status)

	// Verify stock and weighted average cost
	// New Stock = 10 + 20 = 30
	// New Cost = (10 * 50 + 20 * 60) / 30 = (500 + 1200) / 30 = 1700 / 30 = 56.6666...
	updatedProduct, _ = env.ProductRepo.GetByID(product.ID)
	assert.Equal(t, float64(30), updatedProduct.Stock)

	expectedCost := float64(1700) / float64(30)
	assert.InDelta(t, expectedCost, updatedProduct.Cost, 0.01)

	// Try receiving again (should fail)
	err = env.PurchaseOrderService.ReceiveOrder(order.ID)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "already received")
}

func TestPurchaseOrderService_CreateWithReceivedStatus(t *testing.T) {
	env := setupTestDB(t)
	defer env.clearTables(t)

	product := &domain.Product{
		ID:      uuid.New().String(),
		Name:    "Test Product",
		Barcode: "P124",
		Stock:   0,
		Cost:    0,
	}
	require.NoError(t, env.ProductRepo.Create(product))

	order := &domain.PurchaseOrder{
		Total:  1000,
		Status: "received", // directly creating as received
		Items: []domain.PurchaseOrderItem{
			{
				ProductID: product.ID,
				Qty:       10,
				Cost:      100,
			},
		},
	}

	err := env.PurchaseOrderService.Create(order)
	require.NoError(t, err)

	// Verify stock and cost updated immediately
	updatedProduct, _ := env.ProductRepo.GetByID(product.ID)
	assert.Equal(t, float64(10), updatedProduct.Stock)
	assert.Equal(t, float64(100), updatedProduct.Cost)
}
