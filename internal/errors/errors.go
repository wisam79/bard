package errors

import (
	"bard/internal/domain"
	"errors"
	"fmt"
)

var (
	ErrNotFound           = errors.New("record not found")
	ErrDuplicate          = errors.New("duplicate record")
	ErrInvalidInput       = errors.New("invalid input")
	ErrUnauthorized       = errors.New("unauthorized")
	ErrForbidden          = errors.New("forbidden")
	ErrInternalServer     = errors.New("internal server error")
	ErrInsufficientStock  = errors.New("insufficient stock")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrAccountLocked      = errors.New("account locked")
	ErrShiftRequired      = errors.New("shift required")
	ErrBusinessLogic      = errors.New("business logic error")
)

func NewNotFoundError(module domain.ErrorModule, entity string) *domain.AppError {
	return &domain.AppError{
		Module:  module,
		Code:    "NOT_FOUND",
		Message: fmt.Sprintf("%s not found", entity),
	}
}

func NewDuplicateError(module domain.ErrorModule, field string) *domain.AppError {
	return &domain.AppError{
		Module:  module,
		Code:    "DUPLICATE",
		Message: fmt.Sprintf("%s already exists", field),
	}
}

func NewValidationError(module domain.ErrorModule, field, message string) *domain.AppError {
	return &domain.AppError{
		Module:  module,
		Code:    "VALIDATION_ERROR",
		Message: message,
		Field:   field,
	}
}

func NewUnauthorizedError(message string) *domain.AppError {
	return &domain.AppError{
		Module:  domain.ModuleStaff,
		Code:    "UNAUTHORIZED",
		Message: message,
	}
}

func NewInsufficientStockError(productName string, available float64) *domain.AppError {
	return &domain.AppError{
		Module:  domain.ModuleInventory,
		Code:    "INSUFFICIENT_STOCK",
		Message: fmt.Sprintf("Insufficient stock for %s", productName),
		Hint:    fmt.Sprintf("Available: %.2f", available),
	}
}

func NewBusinessError(module domain.ErrorModule, code, message string) *domain.AppError {
	return &domain.AppError{
		Module:  module,
		Code:    code,
		Message: message,
	}
}

func NewInternalError(module domain.ErrorModule, err error) *domain.AppError {
	return &domain.AppError{
		Module:  module,
		Code:    "INTERNAL_ERROR",
		Message: "An internal error occurred",
		Hint:    err.Error(),
	}
}

func IsNotFound(err error) bool {
	var appErr *domain.AppError
	if errors.As(err, &appErr) {
		return appErr.Code == "NOT_FOUND"
	}
	return errors.Is(err, ErrNotFound)
}

func IsDuplicate(err error) bool {
	var appErr *domain.AppError
	if errors.As(err, &appErr) {
		return appErr.Code == "DUPLICATE"
	}
	return errors.Is(err, ErrDuplicate)
}

func IsValidationError(err error) bool {
	var appErr *domain.AppError
	if errors.As(err, &appErr) {
		return appErr.Code == "VALIDATION_ERROR"
	}
	return errors.Is(err, ErrInvalidInput)
}

func Wrap(module domain.ErrorModule, err error, message string) *domain.AppError {
	if err == nil {
		return nil
	}
	var appErr *domain.AppError
	if errors.As(err, &appErr) {
		return appErr
	}
	return &domain.AppError{
		Module:  module,
		Code:    "WRAPPED_ERROR",
		Message: message,
		Hint:    err.Error(),
	}
}
