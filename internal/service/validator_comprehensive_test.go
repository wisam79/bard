package service_test

import (
	"bard/internal/domain"
	"bard/internal/service"
	"testing"
)

// ═══════════════════════════════════════════════════════════════════════════════
// ValidatePagination - Comprehensive Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestValidatePagination_EdgeCases(t *testing.T) {
	tests := []struct {
		name      string
		page      int
		limit     int
		wantPage  int
		wantLimit int
	}{
		// Standard cases
		{"valid values", 2, 10, 2, 10},
		{"page 1 limit 20", 1, 20, 1, 20},
		{"page 10 limit 100", 10, 100, 10, 100},

		// Zero values
		{"page zero", 0, 20, 1, 20},
		{"limit zero", 1, 0, 1, 20},
		{"both zero", 0, 0, 1, 20},

		// Negative values
		{"negative page", -1, 20, 1, 20},
		{"negative limit", 1, -10, 1, 20},
		{"both negative", -5, -10, 1, 20},
		{"large negative", -999999, -999999, 1, 20},

		// Limit boundaries
		{"limit at max", 1, 100, 1, 100},
		{"limit over max", 1, 101, 1, 20},
		{"limit way over max", 1, 1000000, 1, 20},

		// Page boundaries
		{"page very large", 999999, 20, 999999, 20},
		{"page max int", 2147483647, 20, 2147483647, 20},

		// Special values
		{"page 1 limit 1", 1, 1, 1, 1},
		{"page 1 limit 50", 1, 50, 1, 50},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotPage, gotLimit := service.ValidatePagination(tt.page, tt.limit)
			if gotPage != tt.wantPage {
				t.Errorf("ValidatePagination(%d, %d) page = %d, want %d", tt.page, tt.limit, gotPage, tt.wantPage)
			}
			if gotLimit != tt.wantLimit {
				t.Errorf("ValidatePagination(%d, %d) limit = %d, want %d", tt.page, tt.limit, gotLimit, tt.wantLimit)
			}
		})
	}
}

// ═══════════════════════════════════════════════════════════════════════════════
// ValidateProduct - Comprehensive Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestValidateProduct_EdgeCases(t *testing.T) {
	tests := []struct {
		name    string
		product domain.Product
		wantErr bool
	}{
		// Valid products
		{"valid product", domain.Product{Name: "Product", Barcode: "123", Price: 100, Cost: 50, Stock: 10}, false},
		{"zero price", domain.Product{Name: "Free", Barcode: "FREE", Price: 0, Stock: 10}, false},
		{"zero cost", domain.Product{Name: "Product", Barcode: "123", Price: 100, Cost: 0, Stock: 10}, false},
		{"zero stock", domain.Product{Name: "Product", Barcode: "123", Price: 100, Stock: 0}, false},

		// Invalid products
		{"empty name", domain.Product{Name: "", Barcode: "123", Price: 100}, true},
		{"whitespace name", domain.Product{Name: "   ", Barcode: "123", Price: 100}, true},
		{"empty barcode", domain.Product{Name: "Product", Barcode: "", Price: 100}, true},
		{"whitespace barcode", domain.Product{Name: "Product", Barcode: "   ", Price: 100}, true},
		{"negative price", domain.Product{Name: "Product", Barcode: "123", Price: -100}, true},
		{"negative cost", domain.Product{Name: "Product", Barcode: "123", Price: 100, Cost: -50}, true},
		{"negative stock", domain.Product{Name: "Product", Barcode: "123", Price: 100, Stock: -10}, true},

		// Edge cases
		{"very long name", domain.Product{Name: string(make([]byte, 10000)), Barcode: "123", Price: 100}, false},
		{"very long barcode", domain.Product{Name: "Product", Barcode: string(make([]byte, 1000)), Price: 100}, false},
		{"max float price", domain.Product{Name: "Product", Barcode: "123", Price: int64(9999999)}, false},
		{"min positive price", domain.Product{Name: "Product", Barcode: "123", Price: int64(0)}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := service.ValidateProduct(&tt.product)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateProduct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

// ═══════════════════════════════════════════════════════════════════════════════
// ValidateCustomer - Comprehensive Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestValidateCustomer_EdgeCases(t *testing.T) {
	tests := []struct {
		name     string
		customer domain.Customer
		wantErr  bool
	}{
		// Valid customers
		{"valid customer", domain.Customer{Name: "John Doe"}, false},
		{"single character name", domain.Customer{Name: "A"}, false},
		{"arabic name", domain.Customer{Name: "أحمد محمد"}, false},
		{"name with numbers", domain.Customer{Name: "John123"}, false},

		// Invalid customers
		{"empty name", domain.Customer{Name: ""}, true},
		{"whitespace name", domain.Customer{Name: "   "}, true},
		{"tab name", domain.Customer{Name: "\t\t"}, true},
		{"newline name", domain.Customer{Name: "\n\n"}, true},

		// Edge cases
		{"very long name", domain.Customer{Name: string(make([]byte, 10000))}, false},
		{"name with special chars", domain.Customer{Name: "John @#$%^&*() Doe"}, false},
		{"name with emojis", domain.Customer{Name: "John 😀 Doe"}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := service.ValidateCustomer(&tt.customer)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateCustomer() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

// ═══════════════════════════════════════════════════════════════════════════════
// ValidateSale - Comprehensive Tests
// ═══════════════════════════════════════════════════════════════════════════════

func TestValidateSale_ItemsEdgeCases(t *testing.T) {
	tests := []struct {
		name    string
		sale    domain.Sale
		wantErr bool
	}{
		// Valid sales
		{"single item", domain.Sale{Items: []domain.SaleItem{{ProductID: "1", Price: 100, Quantity: 1}}}, false},
		{"multiple items", domain.Sale{Items: []domain.SaleItem{
			{ProductID: "1", Price: 100, Quantity: 1},
			{ProductID: "2", Price: 200, Quantity: 2},
		}}, false},
		{"zero price item", domain.Sale{Items: []domain.SaleItem{{ProductID: "1", Price: 0, Quantity: 1}}}, false},

		// Invalid sales
		{"empty items", domain.Sale{Items: []domain.SaleItem{}}, true},
		{"nil items", domain.Sale{Items: nil}, true},
		{"zero quantity", domain.Sale{Items: []domain.SaleItem{{ProductID: "1", Price: 100, Quantity: 0}}}, true},
		{"negative quantity", domain.Sale{Items: []domain.SaleItem{{ProductID: "1", Price: 100, Quantity: -1}}}, true},
		{"negative price", domain.Sale{Items: []domain.SaleItem{{ProductID: "1", Price: -100, Quantity: 1}}}, true},
		{"empty product ID", domain.Sale{Items: []domain.SaleItem{{ProductID: "", Price: 100, Quantity: 1}}}, true},

		// Edge cases
		{"very large quantity", domain.Sale{Items: []domain.SaleItem{{ProductID: "1", Price: 100, Quantity: 999999}}}, false},
		{"very large price", domain.Sale{Items: []domain.SaleItem{{ProductID: "1", Price: int64(9999999), Quantity: 1}}}, false},
		{"many items", domain.Sale{Items: func() []domain.SaleItem {
			items := make([]domain.SaleItem, 1000)
			for i := range items {
				items[i] = domain.SaleItem{ProductID: string(rune(i)), Price: 100, Quantity: 1}
			}
			return items
		}()}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := service.ValidateSale(&tt.sale)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateSale() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestValidateSale_TotalCalculation(t *testing.T) {
	tests := []struct {
		name        string
		sale        domain.Sale
		wantTotal   float64
		wantSubtotal float64
	}{
		{
			name: "single item",
			sale: domain.Sale{Items: []domain.SaleItem{{ProductID: "1", Price: 100, Quantity: 2}}},
			wantSubtotal: 200,
			wantTotal: 200,
		},
		{
			name: "multiple items",
			sale: domain.Sale{Items: []domain.SaleItem{
				{ProductID: "1", Price: 100, Quantity: 2},
				{ProductID: "2", Price: 50, Quantity: 3},
			}},
			wantSubtotal: 350,
			wantTotal: 350,
		},
		{
			name: "with discount",
			sale: domain.Sale{
				Items: []domain.SaleItem{{ProductID: "1", Price: 100, Quantity: 2}},
				Discount: 20,
			},
			wantSubtotal: 200,
			wantTotal: 180,
		},
		{
			name: "with VAT",
			sale: domain.Sale{
				Items: []domain.SaleItem{{ProductID: "1", Price: 100, Quantity: 2}},
				VAT: 10,
			},
			wantSubtotal: 200,
			wantTotal: 210,
		},
		{
			name: "with discount and VAT",
			sale: domain.Sale{
				Items: []domain.SaleItem{{ProductID: "1", Price: 100, Quantity: 2}},
				Discount: 20,
				VAT: 10,
			},
			wantSubtotal: 200,
			wantTotal: 190,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := service.ValidateSale(&tt.sale)
			if err != nil {
				t.Fatalf("ValidateSale() unexpected error = %v", err)
			}

			var calculatedSubtotal float64
			for _, item := range tt.sale.Items {
				calculatedSubtotal += float64(item.Total)
			}

			if calculatedSubtotal != tt.wantSubtotal {
				t.Errorf("Subtotal = %f, want %f", calculatedSubtotal, tt.wantSubtotal)
			}
		})
	}
}

// ═══════════════════════════════════════════════════════════════════════════════
// Integration Tests - Multiple Validators
// ═══════════════════════════════════════════════════════════════════════════════

func TestValidation_Integration(t *testing.T) {
	t.Run("complete product validation flow", func(t *testing.T) {
		product := domain.Product{
			Name:     "Test Product",
			Barcode:  "TEST123",
			Price:    100,
			Cost:     50,
			Stock:    10,
			Category: "Test",
		}

		err := service.ValidateProduct(&product)
		if err != nil {
			t.Fatalf("Valid product failed validation: %v", err)
		}
	})

	t.Run("complete customer validation flow", func(t *testing.T) {
		customer := domain.Customer{
			Name:  "John Doe",
			Phone: "1234567890",
		}

		err := service.ValidateCustomer(&customer)
		if err != nil {
			t.Fatalf("Valid customer failed validation: %v", err)
		}
	})

	t.Run("complete sale validation flow", func(t *testing.T) {
		sale := domain.Sale{
			CustomerID:    "cust-1",
			PaymentMethod: "cash",
			Items: []domain.SaleItem{
				{ProductID: "prod-1", Name: "Product 1", Price: 100, Quantity: 2},
				{ProductID: "prod-2", Name: "Product 2", Price: 50, Quantity: 3},
			},
			Discount: 10,
			VAT:      5,
		}

		err := service.ValidateSale(&sale)
		if err != nil {
			t.Fatalf("Valid sale failed validation: %v", err)
		}

		// Verify totals were calculated
		expectedSubtotal := 350.0 // (100*2) + (50*3)
		var actualSubtotal float64
		for _, item := range sale.Items {
			actualSubtotal += float64(item.Total)
		}

		if actualSubtotal != expectedSubtotal {
			t.Errorf("Subtotal = %f, want %f", actualSubtotal, expectedSubtotal)
		}
	})
}
