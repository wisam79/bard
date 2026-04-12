package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type ReportBuilderService struct {
	repo repository.ReportBuilderRepository
	log  *logger.Logger
}

func NewReportBuilderService(repo repository.ReportBuilderRepository, log *logger.Logger) *ReportBuilderService {
	return &ReportBuilderService{repo: repo, log: log}
}

func (s *ReportBuilderService) GetTemplates() ([]domain.ReportTemplate, error) {
	return s.repo.GetTemplates()
}

func (s *ReportBuilderService) GetTemplateByID(id string) (*domain.ReportTemplate, error) {
	return s.repo.GetTemplateByID(id)
}

func (s *ReportBuilderService) CreateTemplate(t *domain.ReportTemplate) error {
	if t.Name == "" || t.DataSource == "" {
		return fmt.Errorf("اسم ومصدر التقرير مطلوبان")
	}
	t.ID = uuid.New().String()
	t.CreatedAt = time.Now()
	t.UpdatedAt = time.Now()
	s.log.Info("Report template created", "name", t.Name)
	return s.repo.CreateTemplate(t)
}

func (s *ReportBuilderService) UpdateTemplate(t *domain.ReportTemplate) error {
	t.UpdatedAt = time.Now()
	return s.repo.UpdateTemplate(t)
}

func (s *ReportBuilderService) DeleteTemplate(id string) error {
	return s.repo.DeleteTemplate(id)
}

func (s *ReportBuilderService) GetScheduledExports() ([]domain.ScheduledExport, error) {
	return s.repo.GetScheduledExports()
}

func (s *ReportBuilderService) CreateScheduledExport(e *domain.ScheduledExport) error {
	if e.Name == "" || e.ReportID == "" {
		return fmt.Errorf("اسم ومعرف التقرير مطلوبان")
	}
	e.ID = uuid.New().String()
	e.CreatedAt = time.Now()
	e.UpdatedAt = time.Now()
	return s.repo.CreateScheduledExport(e)
}

func (s *ReportBuilderService) UpdateScheduledExport(e *domain.ScheduledExport) error {
	e.UpdatedAt = time.Now()
	return s.repo.UpdateScheduledExport(e)
}

func (s *ReportBuilderService) DeleteScheduledExport(id string) error {
	return s.repo.DeleteScheduledExport(id)
}

func (s *ReportBuilderService) GenerateReport(templateID string) (interface{}, error) {
	template, err := s.repo.GetTemplateByID(templateID)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"templateId":   template.ID,
		"templateName": template.Name,
		"dataSource":   template.DataSource,
		"generatedAt":  time.Now().Format("2006-01-02 15:04:05"),
	}, nil
}
