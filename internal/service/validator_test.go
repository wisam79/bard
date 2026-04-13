package service_test

import (
	"bard/internal/domain"
	"bard/internal/service"
	"testing"
)

// ─── ValidatePagination ───────────────────────────────────────────────────────

func TestValidatePagination(t *testing.T) {
	tests := []struct {
		name      string
		page      int
		limit     int
		wantPage  int
		wantLimit int
	}{
		{name: "valid values", page: 2, limit: 10, wantPage: 2, wantLimit: 10},
		{name: "page zero → 1", page: 0, limit: 10, wantPage: 1, wantLimit: 10},
		{name: "negative page → 1", page: -5, limit: 10, wantPage: 1, wantLimit: 10},
		{name: "limit zero → 20", page: 1, limit: 0, wantPage: 1, wantLimit: 20},
		{name: "limit too large → 20", page: 1, limit: 999, wantPage: 1, wantLimit: 20},
		{name: "limit at max", page: 3, limit: 100, wantPage: 3, wantLimit: 100},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotPage, gotLimit := service.ValidatePagination(tt.page, tt.limit)
			if gotPage != tt.wantPage {
				t.Errorf("page = %d, want %d", gotPage, tt.wantPage)
			}
			if gotLimit != tt.wantLimit {
				t.Errorf("limit = %d, want %d", gotLimit, tt.wantLimit)
			}
		})
	}
}

// ─── ValidateProduct ─────────────────────────────────────────────────────────

func TestValidateProduct(t *testing.T) {
	tests := []struct {
		name    string
		product domain.Product
		wantErr bool
	}{
		{
			name:    "valid product",
			product: domain.Product{Name: "تفاح", Barcode: "12345", Price: 1000, Cost: 500, Stock: 10},
			wantErr: false,
		},
		{
			name:    "empty name",
			product: domain.Product{Name: "  ", Barcode: "12345", Price: 1000},
			wantErr: true,
		},
		{
			name:    "empty barcode",
			product: domain.Product{Name: "تفاح", Barcode: "  ", Price: 1000},
			wantErr: true,
		},
		{
			name:    "negative price",
			product: domain.Product{Name: "تفاح", Barcode: "12345", Price: -100},
			wantErr: true,
		},
		{
			name:    "negative cost",
			product: domain.Product{Name: "تفاح", Barcode: "12345", Price: 0, Cost: -50},
			wantErr: true,
		},
		{
			name:    "negative stock",
			product: domain.Product{Name: "تفاح", Barcode: "12345", Price: 100, Stock: -1},
			wantErr: true,
		},
		{
			name:    "zero price is allowed",
			product: domain.Product{Name: "هدية", Barcode: "FREE001", Price: 0, Stock: 5},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p := tt.product
			err := service.ValidateProduct(&p)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateProduct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

// ─── ValidateCustomer ────────────────────────────────────────────────────────

func TestValidateCustomer(t *testing.T) {
	tests := []struct {
		name     string
		customer domain.Customer
		wantErr  bool
	}{
		{
			name:     "valid customer",
			customer: domain.Customer{Name: "أحمد علي"},
			wantErr:  false,
		},
		{
			name:     "empty name",
			customer: domain.Customer{Name: "   "},
			wantErr:  true,
		},
		{
			name:     "name with whitespace trimmed",
			customer: domain.Customer{Name: "  سامي  "},
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := tt.customer
			err := service.ValidateCustomer(&c)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateCustomer() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

// ─── ValidateSale ────────────────────────────────────────────────────────────

func TestValidateSale(t *testing.T) {
	validItem := domain.SaleItem{
		ProductID: "prod-1",
		Name:      "منتج أ",
		Price:     1000,
		Quantity:  2,
	}

	tests := []struct {
		name    string
		sale    domain.Sale
		wantErr bool
	}{
		{
			name:    "valid sale",
			sale:    domain.Sale{Items: []domain.SaleItem{validItem}},
			wantErr: false,
		},
		{
			name:    "empty items",
			sale:    domain.Sale{Items: []domain.SaleItem{}},
			wantErr: true,
		},
		{
			name: "zero quantity",
			sale: domain.Sale{Items: []domain.SaleItem{
				{ProductID: "prod-1", Price: 100, Quantity: 0},
			}},
			wantErr: true,
		},
		{
			name: "negative price",
			sale: domain.Sale{Items: []domain.SaleItem{
				{ProductID: "prod-1", Price: -100, Quantity: 1},
			}},
			wantErr: true,
		},
		{
			name: "missing product id",
			sale: domain.Sale{Items: []domain.SaleItem{
				{ProductID: "", Price: 100, Quantity: 1},
			}},
			wantErr: true,
		},
		{
			name: "total is calculated correctly",
			sale: domain.Sale{Items: []domain.SaleItem{
				{ProductID: "prod-1", Price: 500, Quantity: 3},
			}},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := tt.sale
			err := service.ValidateSale(&s)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateSale() error = %v, wantErr %v", err, tt.wantErr)
			}
			// Verify total calculation when valid
			if err == nil && len(s.Items) > 0 {
				item := s.Items[0]
				expectedTotal := float64(item.Price) * item.Quantity
				if float64(item.Total) != expectedTotal {
					t.Errorf("item.Total = %d, want %f", item.Total, expectedTotal)
				}
			}
		})
	}
}
