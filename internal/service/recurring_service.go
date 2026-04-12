package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"time"

	"github.com/google/uuid"
)

type RecurringInvoiceService struct {
	repo repository.RecurringInvoiceRepository
	log  *logger.Logger
}

func NewRecurringInvoiceService(repo repository.RecurringInvoiceRepository, log *logger.Logger) *RecurringInvoiceService {
	return &RecurringInvoiceService{repo: repo, log: log}
}

func (s *RecurringInvoiceService) GetAll(page, limit int, status string) ([]domain.RecurringInvoice, int64, error) {
	return s.repo.GetAll(page, limit, status)
}

func (s *RecurringInvoiceService) GetByID(id string) (*domain.RecurringInvoice, error) {
	return s.repo.GetByID(id)
}

func (s *RecurringInvoiceService) Create(invoice *domain.RecurringInvoice) error {
	invoice.ID = uuid.New().String()
	invoice.Status = "active"
	invoice.CreatedAt = time.Now()
	invoice.UpdatedAt = time.Now()
	invoice.RunCount = 0
	if invoice.NextRunDate == "" {
		invoice.NextRunDate = invoice.StartDate
	}
	s.log.Info("Recurring invoice created", "customer", invoice.CustomerName)
	return s.repo.Create(invoice)
}

func (s *RecurringInvoiceService) Update(invoice *domain.RecurringInvoice) error {
	invoice.UpdatedAt = time.Now()
	return s.repo.Update(invoice)
}

func (s *RecurringInvoiceService) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *RecurringInvoiceService) Pause(id string) error {
	invoice, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	invoice.Status = "paused"
	return s.repo.Update(invoice)
}

func (s *RecurringInvoiceService) Resume(id string) error {
	invoice, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	invoice.Status = "active"
	return s.repo.Update(invoice)
}

func (s *RecurringInvoiceService) ProcessDueInvoices() error {
	due, err := s.repo.GetDueInvoices()
	if err != nil {
		return err
	}
	for _, invoice := range due {
		s.log.Info("Processing recurring invoice", "id", invoice.ID, "customer", invoice.CustomerName)
		if err := s.repo.MarkRun(invoice.ID, ""); err != nil {
			s.log.Error("Failed to mark recurring invoice run", "id", invoice.ID, "error", err)
		}
	}
	return nil
}
