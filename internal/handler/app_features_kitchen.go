package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetKitchenOrders() ([]domain.KitchenOrder, error) {
	return a.kitchen.GetPendingOrders()
}

func (a *App) GetKitchenOrder(id string) (*domain.KitchenOrder, error) {
	return a.kitchen.GetOrderByID(id)
}

func (a *App) CreateKitchenOrder(token string, order domain.KitchenOrder) (*domain.KitchenOrder, error) {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return nil, err
	}
	return a.kitchen.CreateOrder(order.SaleID, order.TableNumber, order.Priority, order.Note, order.Items)
}

func (a *App) StartKitchenOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.kitchen.StartOrder(id)
}

func (a *App) CompleteKitchenOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.kitchen.CompleteOrder(id)
}

func (a *App) CancelKitchenOrder(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteSale); err != nil {
		return err
	}
	return a.kitchen.CancelOrder(id)
}

func (a *App) UpdateKitchenItemStatus(token string, orderID string, itemID uint, status string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.kitchen.UpdateItemStatus(orderID, itemID, status)
}

func (a *App) GetKitchenStations() ([]domain.KitchenStation, error) {
	return a.kitchen.GetStations()
}

func (a *App) CreateKitchenStation(token string, station domain.KitchenStation) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.kitchen.CreateStation(&station)
}

func (a *App) DeleteKitchenStation(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.kitchen.DeleteStation(id)
}
