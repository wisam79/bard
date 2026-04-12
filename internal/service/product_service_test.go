package service

import (
	"testing"
	"time"

	"bard/internal/cache"
	"bard/internal/domain"
	"bard/internal/errors"
	"bard/internal/logger"
	"bard/internal/mocks"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// TestProductService_GetAll tests getting all products
func TestProductService_GetAll(t *testing.T) {
	// Arrange
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewProductService(mockRepo, cache.NewProductCache(), log)

	paginatedProducts := &domain.PaginatedProducts{
		Data: []domain.Product{
			{ID: "1", Name: "Product 1", Price: 100},
			{ID: "2", Name: "Product 2", Price: 200},
		},
		Total:      2,
		TotalPages: 1,
		Page:       1,
	}

	mockRepo.On("GetAll", 1, 20, "", "").Return(paginatedProducts, nil)

	// Act
	result, err := svc.GetAll(1, 20, "", "")

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, 2, len(result.Data))
	mockRepo.AssertExpectations(t)
}

// TestProductService_Create tests creating a product
func TestProductService_Create(t *testing.T) {
	// Arrange
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewProductService(mockRepo, cache.NewProductCache(), log)

	product := &domain.Product{
		Name:     "Test Product",
		Barcode:  "123456",
		Price:    100,
		Cost:     50,
		Stock:    10,
		Category: "Test",
	}

	mockRepo.On("Create", mock.AnythingOfType("*domain.Product")).Return(nil)

	// Act
	err := svc.Create(product)

	// Assert
	assert.NoError(t, err)
	assert.NotEmpty(t, product.ID)
	assert.NotZero(t, product.CreatedAt)
	mockRepo.AssertExpectations(t)
}

// TestProductService_Create_Validation tests validation when creating a product
func TestProductService_Create_Validation(t *testing.T) {
	tests := []struct {
		name    string
		product *domain.Product
		wantErr bool
		errType error
	}{
		{
			name: "empty name",
			product: &domain.Product{
				Name:    "",
				Barcode: "123456",
				Price:   100,
			},
			wantErr: true,
			errType: errors.ErrValidationError,
		},
		{
			name: "empty barcode",
			product: &domain.Product{
				Name:    "Test",
				Barcode: "",
				Price:   100,
			},
			wantErr: true,
			errType: errors.ErrValidationError,
		},
		{
			name: "negative price",
			product: &domain.Product{
				Name:    "Test",
				Barcode: "123456",
				Price:   -100,
			},
			wantErr: true,
			errType: errors.ErrValidationError,
		},
		{
			name: "negative stock",
			product: &domain.Product{
				Name:    "Test",
				Barcode: "123456",
				Price:   100,
				Stock:   -10,
			},
			wantErr: true,
			errType: errors.ErrValidationError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.MockProductRepository)
			log := logger.New(logger.LevelInfo, false)
			svc := NewProductService(mockRepo, cache.NewProductCache(), log)

			err := svc.Create(tt.product)

			if tt.wantErr {
				assert.Error(t, err)
				if tt.errType != nil {
					assert.True(t, errors.IsValidationError(err))
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// TestProductService_Update tests updating a product
func TestProductService_Update(t *testing.T) {
	// Arrange
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewProductService(mockRepo, cache.NewProductCache(), log)

	product := &domain.Product{
		ID:        "test-id",
		Name:      "Test Product",
		Barcode:   "123456",
		Price:     100,
		Cost:      50,
		Stock:     10,
		Category:  "Test",
		CreatedAt: time.Now(),
	}

	mockRepo.On("Update", mock.AnythingOfType("*domain.Product")).Return(nil)

	// Act
	err := svc.Update(product)

	// Assert
	assert.NoError(t, err)
	assert.NotZero(t, product.UpdatedAt)
	mockRepo.AssertExpectations(t)
}

// TestProductService_Delete tests deleting a product
func TestProductService_Delete(t *testing.T) {
	// Arrange
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewProductService(mockRepo, cache.NewProductCache(), log)

	productID := "test-id"

	mockRepo.On("Delete", productID).Return(nil)

	// Act
	err := svc.Delete(productID)

	// Assert
	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

// TestProductService_GetCategories tests getting categories
func TestProductService_GetCategories(t *testing.T) {
	// Arrange
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewProductService(mockRepo, cache.NewProductCache(), log)

	categories := []string{"Electronics", "Food", "Drinks"}

	mockRepo.On("GetCategories").Return(categories, nil)

	// Act
	result, err := svc.GetCategories()

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 3, len(result))
	assert.Equal(t, "Electronics", result[0])
	mockRepo.AssertExpectations(t)
}

// TestProductService_GetStats tests getting product stats
func TestProductService_GetStats(t *testing.T) {
	// Arrange
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewProductService(mockRepo, cache.NewProductCache(), log)

	stats := &domain.ProductStats{
		TotalStock: 1000,
		TotalValue: 50000,
		TotalCost:  25000,
		Profit:     25000,
	}

	mockRepo.On("GetStats").Return(stats, nil)

	// Act
	result, err := svc.GetStats()

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, result)
	assert.Equal(t, float64(1000), result.TotalStock)
	mockRepo.AssertExpectations(t)
}

// TestProductService_GetLowStock tests getting low stock products
func TestProductService_GetLowStock(t *testing.T) {
	// Arrange
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewProductService(mockRepo, cache.NewProductCache(), log)

	products := []domain.Product{
		{ID: "1", Name: "Product 1", Stock: 3, MinStock: 5},
		{ID: "2", Name: "Product 2", Stock: 2, MinStock: 5},
	}

	mockRepo.On("GetLowStock", 5).Return(products, nil)

	// Act
	result, err := svc.GetLowStock(5)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}

// TestProductService_Search tests searching products
func TestProductService_Search(t *testing.T) {
	// Arrange
	mockRepo := new(mocks.MockProductRepository)
	log := logger.New(logger.LevelInfo, false)
	svc := NewProductService(mockRepo, cache.NewProductCache(), log)

	products := []domain.Product{
		{ID: "1", Name: "Coffee", Price: 100},
		{ID: "2", Name: "Tea", Price: 50},
	}

	mockRepo.On("Search", "coffee", 10).Return(products, nil)

	// Act
	result, err := svc.Search("coffee", 10)

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, 2, len(result))
	mockRepo.AssertExpectations(t)
}
