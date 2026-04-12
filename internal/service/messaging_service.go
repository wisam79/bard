package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type MessagingService struct {
	repo repository.MessagingRepository
	log  *logger.Logger
}

func NewMessagingService(repo repository.MessagingRepository, log *logger.Logger) *MessagingService {
	return &MessagingService{repo: repo, log: log}
}

func (s *MessagingService) GetProviders() ([]domain.MessagingProvider, error) {
	return s.repo.GetProviders()
}

func (s *MessagingService) CreateProvider(p *domain.MessagingProvider) error {
	if p.Name == "" || p.Type == "" {
		return fmt.Errorf("اسم ونوع المزود مطلوبان")
	}
	p.ID = uuid.New().String()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	s.log.Info("Messaging provider created", "name", p.Name, "type", p.Type)
	return s.repo.CreateProvider(p)
}

func (s *MessagingService) UpdateProvider(p *domain.MessagingProvider) error {
	p.UpdatedAt = time.Now()
	return s.repo.UpdateProvider(p)
}

func (s *MessagingService) DeleteProvider(id string) error {
	return s.repo.DeleteProvider(id)
}

func (s *MessagingService) GetTemplates() ([]domain.MessageTemplate, error) {
	return s.repo.GetTemplates()
}

func (s *MessagingService) CreateTemplate(t *domain.MessageTemplate) error {
	if t.Name == "" || t.Content == "" {
		return fmt.Errorf("اسم ومحتوى القالب مطلوبان")
	}
	t.ID = uuid.New().String()
	t.CreatedAt = time.Now()
	t.UpdatedAt = time.Now()
	return s.repo.CreateTemplate(t)
}

func (s *MessagingService) UpdateTemplate(t *domain.MessageTemplate) error {
	t.UpdatedAt = time.Now()
	return s.repo.UpdateTemplate(t)
}

func (s *MessagingService) DeleteTemplate(id string) error {
	return s.repo.DeleteTemplate(id)
}

func (s *MessagingService) SendMessage(providerID, recipient, content, saleID, customerID, staffID string) error {
	log := &domain.MessageLog{
		ProviderID: providerID,
		Recipient:  recipient,
		Content:    content,
		Status:     "sent",
		SaleID:     saleID,
		CustomerID: customerID,
		StaffID:    staffID,
		Timestamp:  time.Now().Unix(),
		CreatedAt:  time.Now(),
	}
	s.log.Info("Message sent", "provider", providerID, "recipient", recipient)
	return s.repo.CreateLog(log)
}

func (s *MessagingService) SendReceipt(providerID, phone, saleID, customerID, staffID, receiptContent string) error {
	return s.SendMessage(providerID, phone, receiptContent, saleID, customerID, staffID)
}

func (s *MessagingService) GetLogs(page, limit int) ([]domain.MessageLog, int64, error) {
	return s.repo.GetLogs(page, limit)
}
