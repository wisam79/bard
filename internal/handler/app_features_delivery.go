package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetDeliveryDrivers() ([]domain.DeliveryDriver, error) {
	return a.delivery.GetDrivers()
}

func (a *App) CreateDeliveryDriver(token string, driver domain.DeliveryDriver) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.CreateDriver(&driver)
}

func (a *App) UpdateDeliveryDriver(token string, driver domain.DeliveryDriver) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.UpdateDriver(&driver)
}

func (a *App) DeleteDeliveryDriver(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.DeleteDriver(id)
}

func (a *App) GetDeliveryOrders(page, limit int, status string) ([]domain.DeliveryOrder, int64, error) {
	return a.delivery.GetOrders(page, limit, status)
}

func (a *App) CreateDeliveryOrder(token string, order domain.DeliveryOrder) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.delivery.CreateOrder(&order)
}

func (a *App) AssignDeliveryDriver(token, orderID, driverID string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.AssignDriver(orderID, driverID)
}

func (a *App) UpdateDeliveryStatus(token, orderID, status string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.delivery.UpdateOrderStatus(orderID, status)
}
