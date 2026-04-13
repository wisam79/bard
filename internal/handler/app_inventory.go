package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetSuppliers() ([]domain.Supplier, error) {
	return a.suppliers.GetAll()
}

func (a *App) GetSupplier(id string) (*domain.Supplier, error) {
	return a.suppliers.GetByID(id)
}

func (a *App) CreateSupplier(token string, supplier domain.Supplier) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.suppliers.Create(&supplier)
}

func (a *App) UpdateSupplier(token string, supplier domain.Supplier) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.suppliers.Update(&supplier)
}

func (a *App) DeleteSupplier(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
		return err
	}
	return a.suppliers.Delete(id)
}

func (a *App) GetPurchaseOrders(page, limit int, status string) (*domain.PaginatedResponse[domain.PurchaseOrder], error) {
	return a.purchaseOrders.GetAll(page, limit, status)
}

func (a *App) GetPurchaseOrder(id string) (*domain.PurchaseOrder, error) {
	return a.purchaseOrders.GetByID(id)
}

func (a *App) CreatePurchaseOrder(token string, order domain.PurchaseOrder) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.purchaseOrders.Create(&order)
}

func (a *App) UpdatePurchaseOrder(token string, order domain.PurchaseOrder) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.purchaseOrders.Update(&order)
}

func (a *App) DeletePurchaseOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
		return err
	}
	return a.purchaseOrders.Delete(id)
}

func (a *App) ReceivePurchaseOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermReceiveOrder); err != nil {
		return err
	}
	return a.purchaseOrders.ReceiveOrder(id)
}

func (a *App) GetStockTransfers(page, limit int, status string) ([]domain.StockTransfer, int64, error) {
	return a.branch.GetStockTransfers(page, limit, status)
}

func (a *App) CreateStockTransfer(token string, transfer domain.StockTransfer) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.branch.CreateStockTransfer(&transfer)
}

func (a *App) ApproveStockTransfer(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.branch.ApproveStockTransfer(id)
}

func (a *App) CompleteStockTransfer(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.branch.CompleteStockTransfer(id)
}

func (a *App) CreateStockAdjustment(token string, productID, adjType, reason string, newQty float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.stockAdjustment.CreateAdjustment(productID, adjType, reason, newQty, staff.ID, staff.Name)
}

func (a *App) GetStockAdjustments(page, limit int, adjType string) ([]domain.StockAdjustment, int64, error) {
	return a.stockAdjustment.GetAdjustments(page, limit, adjType)
}

func (a *App) CreateWasteRecord(token string, productID, wasteType, reason string, qty float64) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.stockAdjustment.CreateWasteRecord(productID, wasteType, reason, qty, staff.ID, staff.Name)
}

func (a *App) GetWasteRecords(page, limit int, wasteType string) ([]domain.WasteRecord, int64, error) {
	return a.stockAdjustment.GetWasteRecords(page, limit, wasteType)
}

func (a *App) GetWasteSummary(startDate, endDate string) ([]domain.WasteRecord, error) {
	return a.stockAdjustment.GetWasteSummary(startDate, endDate)
}

func (a *App) GetStockVarianceReport() ([]domain.StockVarianceReport, error) {
	return a.stockAdjustment.GetStockVarianceReport()
}
