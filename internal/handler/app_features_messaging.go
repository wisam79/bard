package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetMessagingProviders() ([]domain.MessagingProvider, error) {
	return a.messaging.GetProviders()
}

func (a *App) CreateMessagingProvider(token string, provider domain.MessagingProvider) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.messaging.CreateProvider(&provider)
}

func (a *App) UpdateMessagingProvider(token string, provider domain.MessagingProvider) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.messaging.UpdateProvider(&provider)
}

func (a *App) DeleteMessagingProvider(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.messaging.DeleteProvider(id)
}

func (a *App) GetMessageTemplates() ([]domain.MessageTemplate, error) {
	return a.messaging.GetTemplates()
}

func (a *App) CreateMessageTemplate(token string, template domain.MessageTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.messaging.CreateTemplate(&template)
}

func (a *App) UpdateMessageTemplate(token string, template domain.MessageTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.messaging.UpdateTemplate(&template)
}

func (a *App) DeleteMessageTemplate(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.messaging.DeleteTemplate(id)
}

func (a *App) SendMessage(token, providerID, recipient, content, saleID, customerID string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{Module: domain.ModuleStaff, Code: "UNAUTHORIZED", Message: "لم يتم تسجيل الدخول"}
	}
	return a.messaging.SendMessage(providerID, recipient, content, saleID, customerID, staff.ID)
}

func (a *App) GetMessageLogs(page, limit int) ([]domain.MessageLog, int64, error) {
	return a.messaging.GetLogs(page, limit)
}
