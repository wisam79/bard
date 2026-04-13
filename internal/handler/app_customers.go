package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetCustomers(page, limit int, search string) ([]domain.Customer, int64, error) {
	return a.customers.GetAll(page, limit, search)
}

func (a *App) GetCustomer(id string) (*domain.Customer, error) {
	return a.customers.GetByID(id)
}

func (a *App) CreateCustomer(customer domain.Customer) error {
	return a.customers.Create(&customer)
}

func (a *App) UpdateCustomer(customer domain.Customer) error {
	return a.customers.Update(&customer)
}

func (a *App) DeleteCustomer(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermManageStaff); err != nil {
		return err
	}
	return a.customers.Delete(id)
}

func (a *App) SearchCustomerByPhone(phone string) (*domain.Customer, error) {
	return a.customers.GetByPhone(phone)
}

func (a *App) GetCustomerWallet(customerID string) (*domain.CustomerWallet, error) {
	return a.wallet.GetByCustomerID(customerID)
}

func (a *App) CreateCustomerWallet(token string, customerID string, creditLimit float64) (*domain.CustomerWallet, error) {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return nil, err
	}
	return a.wallet.CreateWallet(customerID, creditLimit)
}

func (a *App) GetCustomerSegments() ([]domain.CustomerSegment, error) {
	return a.campaign.GetSegments()
}

func (a *App) CreateCustomerSegment(token string, segment domain.CustomerSegment) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.CreateSegment(&segment)
}

func (a *App) UpdateCustomerSegment(token string, segment domain.CustomerSegment) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.UpdateSegment(&segment)
}

func (a *App) DeleteCustomerSegment(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.DeleteSegment(id)
}

func (a *App) AddCustomerToSegment(token, segmentID, customerID string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.AddCustomerToSegment(segmentID, customerID)
}

func (a *App) RemoveCustomerFromSegment(token, segmentID, customerID string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.campaign.RemoveCustomerFromSegment(segmentID, customerID)
}

func (a *App) AutoSegmentCustomers(token string) (int, error) {
	if err := a.requireAdmin(token); err != nil {
		return 0, err
	}
	return a.campaign.AutoSegmentCustomers()
}
