package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type NotificationService struct {
	repo repository.NotificationRepository
	log  *logger.Logger
}

func NewNotificationService(repo repository.NotificationRepository, log *logger.Logger) *NotificationService {
	return &NotificationService{repo: repo, log: log}
}

func (s *NotificationService) GetTemplates() ([]domain.NotificationTemplate, error) {
	return s.repo.GetTemplates()
}

func (s *NotificationService) CreateTemplate(t *domain.NotificationTemplate) error {
	t.ID = uuid.New().String()
	t.CreatedAt = time.Now()
	t.UpdatedAt = time.Now()
	return s.repo.CreateTemplate(t)
}

func (s *NotificationService) UpdateTemplate(t *domain.NotificationTemplate) error {
	t.UpdatedAt = time.Now()
	return s.repo.UpdateTemplate(t)
}

func (s *NotificationService) DeleteTemplate(id string) error {
	return s.repo.DeleteTemplate(id)
}

func (s *NotificationService) GetSettings() (*domain.NotificationSettings, error) {
	return s.repo.GetSettings()
}

func (s *NotificationService) UpdateSettings(settings *domain.NotificationSettings) error {
	return s.repo.UpdateSettings(settings)
}

func (s *NotificationService) GetLogs(page, limit int) ([]domain.NotificationLog, int64, error) {
	return s.repo.GetLogs(page, limit)
}

func (s *NotificationService) SendLowStockAlert(productName string, currentStock, minStock float64) error {
	settings, err := s.repo.GetSettings()
	if err != nil || !settings.LowStockAlert {
		return nil
	}
	msg := fmt.Sprintf("تنبيه: مخزون منخفض لـ %s - الكمية: %.0f (الحد الأدنى: %.0f)", productName, currentStock, minStock)
	s.log.Info("Low stock alert", "product", productName, "message", msg)

	log := &domain.NotificationLog{
		TemplateID: "low_stock",
		Recipient:  settings.WhatsAppPhone,
		Channel:    "whatsapp",
		Status:     "sent",
		SentAt:     time.Now().Unix(),
		CreatedAt:  time.Now(),
	}
	return s.repo.CreateLog(log)
}

func (s *NotificationService) SendPaymentReminder(customerName, phone string, amount float64) error {
	settings, err := s.repo.GetSettings()
	if err != nil || !settings.PaymentReminder {
		return nil
	}
	msg := fmt.Sprintf("تذكير: لديك مبلغ مستحق %.0f - %s", amount, customerName)
	s.log.Info("Payment reminder", "customer", customerName, "message", msg)

	log := &domain.NotificationLog{
		TemplateID: "payment_reminder",
		Recipient:  phone,
		Channel:    "whatsapp",
		Status:     "sent",
		SentAt:     time.Now().Unix(),
		CreatedAt:  time.Now(),
	}
	return s.repo.CreateLog(log)
}

func (s *NotificationService) SendDailySummary(totalSales float64, orderCount int) error {
	settings, err := s.repo.GetSettings()
	if err != nil || !settings.DailySummary {
		return nil
	}
	msg := fmt.Sprintf("ملخص اليومي: المبيعات %.0f | الطلبات %d", totalSales, orderCount)
	s.log.Info("Daily summary", "message", msg)

	log := &domain.NotificationLog{
		TemplateID: "daily_summary",
		Recipient:  settings.WhatsAppPhone,
		Channel:    "whatsapp",
		Status:     "sent",
		SentAt:     time.Now().Unix(),
		CreatedAt:  time.Now(),
	}
	return s.repo.CreateLog(log)
}
