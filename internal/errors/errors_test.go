package errors

import (
	"bard/internal/domain"
	"errors"
	"testing"
)

func TestNewNotFoundError(t *testing.T) {
	err := NewNotFoundError(domain.ModuleProduct, "Product")
	if err == nil {
		t.Fatal("NewNotFoundError should return an error")
	}
	if err.Code != "NOT_FOUND" {
		t.Fatalf("Expected code NOT_FOUND, got %s", err.Code)
	}
	if err.Module != domain.ModuleProduct {
		t.Fatalf("Expected module PRODUCT, got %s", err.Module)
	}
}

func TestNewDuplicateError(t *testing.T) {
	err := NewDuplicateError(domain.ModuleCustomer, "Phone")
	if err == nil {
		t.Fatal("NewDuplicateError should return an error")
	}
	if err.Code != "DUPLICATE" {
		t.Fatalf("Expected code DUPLICATE, got %s", err.Code)
	}
}

func TestNewValidationError(t *testing.T) {
	err := NewValidationError(domain.ModuleProduct, "price", "Price must be positive")
	if err == nil {
		t.Fatal("NewValidationError should return an error")
	}
	if err.Code != "VALIDATION_ERROR" {
		t.Fatalf("Expected code VALIDATION_ERROR, got %s", err.Code)
	}
	if err.Field != "price" {
		t.Fatalf("Expected field price, got %s", err.Field)
	}
}

func TestNewInsufficientStockError(t *testing.T) {
	err := NewInsufficientStockError("Product A", 5.0)
	if err == nil {
		t.Fatal("NewInsufficientStockError should return an error")
	}
	if err.Code != "INSUFFICIENT_STOCK" {
		t.Fatalf("Expected code INSUFFICIENT_STOCK, got %s", err.Code)
	}
}

func TestIsNotFound(t *testing.T) {
	appErr := NewNotFoundError(domain.ModuleProduct, "Product")
	if !IsNotFound(appErr) {
		t.Fatal("IsNotFound should return true for AppError with NOT_FOUND code")
	}

	normalErr := errors.New("some error")
	if IsNotFound(normalErr) {
		t.Fatal("IsNotFound should return false for normal error")
	}
}

func TestIsDuplicate(t *testing.T) {
	appErr := NewDuplicateError(domain.ModuleCustomer, "Phone")
	if !IsDuplicate(appErr) {
		t.Fatal("IsDuplicate should return true for AppError with DUPLICATE code")
	}
}

func TestIsValidationError(t *testing.T) {
	appErr := NewValidationError(domain.ModuleProduct, "name", "Name is required")
	if !IsValidationError(appErr) {
		t.Fatal("IsValidationError should return true for AppError with VALIDATION_ERROR code")
	}
}

func TestWrap(t *testing.T) {
	originalErr := errors.New("original error")
	wrapped := Wrap(domain.ModuleProduct, originalErr, "Failed to create product")

	if wrapped == nil {
		t.Fatal("Wrap should return an error")
	}
	if wrapped.Code != "WRAPPED_ERROR" {
		t.Fatalf("Expected code WRAPPED_ERROR, got %s", wrapped.Code)
	}
	if wrapped.Hint != "original error" {
		t.Fatalf("Expected hint 'original error', got %s", wrapped.Hint)
	}
}

func TestWrapNil(t *testing.T) {
	wrapped := Wrap(domain.ModuleProduct, nil, "Should be nil")
	if wrapped != nil {
		t.Fatal("Wrap with nil error should return nil")
	}
}

func TestAppErrorInterface(t *testing.T) {
	err := &domain.AppError{
		Module:  domain.ModuleProduct,
		Code:    "TEST",
		Message: "Test message",
	}

	var e error = err
	if e.Error() != "Test message" {
		t.Fatalf("Expected 'Test message', got '%s'", e.Error())
	}

	err.Hint = "Test hint"
	if e.Error() != "Test message. Test hint" {
		t.Fatalf("Expected 'Test message. Test hint', got '%s'", e.Error())
	}
}
