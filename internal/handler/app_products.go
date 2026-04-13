package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetProducts(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
	return a.products.GetAll(page, limit, search, category)
}

func (a *App) GetProduct(id string) (*domain.Product, error) {
	return a.products.GetByID(id)
}

func (a *App) GetProductByBarcode(barcode string) (*domain.Product, error) {
	return a.products.GetByBarcode(barcode)
}

func (a *App) CreateProduct(token string, product domain.Product) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.products.Create(&product)
}

func (a *App) UpdateProduct(token string, product domain.Product) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.products.Update(&product)
}

func (a *App) DeleteProduct(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
		return err
	}
	a.log.Info("Product deleted", "id", id)
	return a.products.Delete(id)
}

func (a *App) GetCategories() ([]string, error) {
	return a.products.GetCategories()
}

func (a *App) GetProductStats() (*domain.ProductStats, error) {
	return a.products.GetStats()
}

func (a *App) SearchProducts(query string, limit int) ([]domain.Product, error) {
	return a.products.Search(query, limit)
}

func (a *App) GetProductKits() ([]domain.ProductKit, error) {
	return a.kit.GetAll()
}

func (a *App) GetProductKit(id string) (*domain.ProductKit, error) {
	return a.kit.GetByID(id)
}

func (a *App) CreateProductKit(token string, kit domain.ProductKit) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.kit.Create(&kit)
}

func (a *App) UpdateProductKit(token string, kit domain.ProductKit) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.kit.Update(&kit)
}

func (a *App) DeleteProductKit(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
		return err
	}
	return a.kit.Delete(id)
}

func (a *App) AssignProductTax(token, productID, taxRateID string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.tax.AssignProductTax(productID, taxRateID)
}

func (a *App) RemoveProductTax(token, productID, taxRateID string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.tax.RemoveProductTax(productID, taxRateID)
}

func (a *App) GetProductTaxes(productID string) ([]domain.ProductTax, error) {
	return a.tax.GetProductTaxes(productID)
}
