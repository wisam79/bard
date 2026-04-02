package service

import (
	"bard/internal/domain"
	"bard/internal/errors"
	"strings"
)

// ValidatePagination ensures valid pagination parameters
func ValidatePagination(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return page, limit
}

// ValidateProduct validates a product before creation or update
func ValidateProduct(p *domain.Product) error {
	p.Name = strings.TrimSpace(p.Name)
	p.Barcode = strings.TrimSpace(p.Barcode)

	if p.Name == "" {
		return errors.NewValidationError(domain.ModuleProduct, "name", "Product name is required")
	}
	if p.Barcode == "" {
		return errors.NewValidationError(domain.ModuleProduct, "barcode", "Barcode is required")
	}
	if p.Price < 0 {
		return errors.NewValidationError(domain.ModuleProduct, "price", "Price cannot be negative")
	}
	if p.Cost < 0 {
		return errors.NewValidationError(domain.ModuleProduct, "cost", "Cost cannot be negative")
	}
	if p.Stock < 0 {
		return errors.NewValidationError(domain.ModuleProduct, "stock", "Stock cannot be negative")
	}
	return nil
}

// ValidateCustomer validates a customer
func ValidateCustomer(c *domain.Customer) error {
	c.Name = strings.TrimSpace(c.Name)
	if c.Name == "" {
		return errors.NewValidationError(domain.ModuleCustomer, "name", "Customer name is required")
	}
	return nil
}

// ValidateSale validates a sale transaction
func ValidateSale(s *domain.Sale) error {
	if len(s.Items) == 0 {
		return errors.NewValidationError(domain.ModuleSales, "items", "Sale must have at least one item")
	}
	for i, item := range s.Items {
		if item.Quantity <= 0 {
			return errors.NewValidationError(domain.ModuleSales, "items", "Quantity must be greater than zero")
		}
		if item.Price < 0 {
			return errors.NewValidationError(domain.ModuleSales, "items", "Price cannot be negative")
		}
		if item.ProductID == "" {
			return errors.NewValidationError(domain.ModuleSales, "items", "Product ID is missing for item")
		}
		s.Items[i].Total = float64(item.Quantity) * item.Price
	}
	return nil
}
