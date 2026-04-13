package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) ProcessReturn(token string, saleID string) (*domain.Sale, error) {
	if err := a.checkPermission(token, middleware.PermDeleteSale); err != nil {
		return nil, err
	}
	return a.sales.ProcessReturn(saleID)
}

func (a *App) GetNotificationTemplates() ([]domain.NotificationTemplate, error) {
	return a.notification.GetTemplates()
}

func (a *App) CreateNotificationTemplate(token string, t domain.NotificationTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.notification.CreateTemplate(&t)
}

func (a *App) UpdateNotificationTemplate(token string, t domain.NotificationTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.notification.UpdateTemplate(&t)
}

func (a *App) DeleteNotificationTemplate(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.notification.DeleteTemplate(id)
}

func (a *App) GetNotificationSettings() (*domain.NotificationSettings, error) {
	return a.notification.GetSettings()
}

func (a *App) UpdateNotificationSettings(token string, s domain.NotificationSettings) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.notification.UpdateSettings(&s)
}

func (a *App) GetNotificationLogs(page, limit int) ([]domain.NotificationLog, int64, error) {
	return a.notification.GetLogs(page, limit)
}

func (a *App) SetAutoDebit(token string, customerID string, enabled bool, day int) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.wallet.SetAutoDebit(customerID, enabled, day)
}

func (a *App) GetApprovalWorkflows() ([]domain.ApprovalWorkflow, error) {
	return a.budget.GetApprovalWorkflows()
}

func (a *App) CreateApprovalWorkflow(token string, wf domain.ApprovalWorkflow) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.CreateApprovalWorkflow(&wf)
}

func (a *App) DeleteApprovalWorkflow(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.DeleteApprovalWorkflow(id)
}
