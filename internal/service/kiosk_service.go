package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"time"

	"github.com/google/uuid"
)

type KioskService struct {
	repo repository.KioskRepository
	log  *logger.Logger
}

func NewKioskService(repo repository.KioskRepository, log *logger.Logger) *KioskService {
	return &KioskService{repo: repo, log: log}
}

func (s *KioskService) GetLayouts() ([]domain.KioskLayout, error) {
	return s.repo.GetLayouts()
}

func (s *KioskService) GetLayoutByID(id string) (*domain.KioskLayout, error) {
	return s.repo.GetLayoutByID(id)
}

func (s *KioskService) CreateLayout(layout *domain.KioskLayout) error {
	layout.ID = uuid.New().String()
	layout.CreatedAt = time.Now()
	layout.UpdatedAt = time.Now()
	s.log.Info("Kiosk layout created", "name", layout.Name)
	return s.repo.CreateLayout(layout)
}

func (s *KioskService) UpdateLayout(layout *domain.KioskLayout) error {
	layout.UpdatedAt = time.Now()
	return s.repo.UpdateLayout(layout)
}

func (s *KioskService) DeleteLayout(id string) error {
	return s.repo.DeleteLayout(id)
}

func (s *KioskService) StartSession(layoutID string) (*domain.KioskSession, error) {
	session := &domain.KioskSession{
		LayoutID:  layoutID,
		StartedAt: time.Now(),
		Status:    "active",
	}
	if err := s.repo.CreateSession(session); err != nil {
		return nil, err
	}
	s.log.Info("Kiosk session started", "layout", layoutID)
	return session, nil
}

func (s *KioskService) EndSession(sessionID uint, saleID string, totalAmount float64) error {
	now := time.Now()
	session := &domain.KioskSession{
		ID:          sessionID,
		SaleID:      saleID,
		EndedAt:     &now,
		TotalAmount: totalAmount,
		Status:      "completed",
	}
	return s.repo.UpdateSession(session)
}

func (s *KioskService) GetActiveSessions() ([]domain.KioskSession, error) {
	return s.repo.GetActiveSessions()
}
