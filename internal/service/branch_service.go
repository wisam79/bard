package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"time"

	"github.com/google/uuid"
)

type BranchService struct {
	repo repository.BranchRepository
	log  *logger.Logger
}

func NewBranchService(repo repository.BranchRepository, log *logger.Logger) *BranchService {
	return &BranchService{repo: repo, log: log}
}

func (s *BranchService) GetAll() ([]domain.Branch, error) {
	return s.repo.GetAll()
}

func (s *BranchService) GetByID(id string) (*domain.Branch, error) {
	return s.repo.GetByID(id)
}

func (s *BranchService) Create(branch *domain.Branch) error {
	branch.ID = uuid.New().String()
	branch.CreatedAt = time.Now()
	branch.UpdatedAt = time.Now()
	s.log.Info("Branch created", "name", branch.Name)
	return s.repo.Create(branch)
}

func (s *BranchService) Update(branch *domain.Branch) error {
	branch.UpdatedAt = time.Now()
	return s.repo.Update(branch)
}

func (s *BranchService) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *BranchService) CreateStockTransfer(transfer *domain.StockTransfer) error {
	transfer.ID = uuid.New().String()
	transfer.Status = "pending"
	transfer.CreatedAt = time.Now()
	transfer.UpdatedAt = time.Now()
	s.log.Info("Stock transfer created", "from", transfer.FromBranch, "to", transfer.ToBranch)
	return s.repo.CreateStockTransfer(transfer)
}

func (s *BranchService) GetStockTransfers(page, limit int, status string) ([]domain.StockTransfer, int64, error) {
	return s.repo.GetStockTransfers(page, limit, status)
}

func (s *BranchService) GetStockTransferByID(id string) (*domain.StockTransfer, error) {
	return s.repo.GetStockTransferByID(id)
}

func (s *BranchService) ApproveStockTransfer(id string) error {
	s.log.Info("Stock transfer approved", "id", id)
	return s.repo.UpdateStockTransferStatus(id, "approved")
}

func (s *BranchService) CompleteStockTransfer(id string) error {
	s.log.Info("Stock transfer completed", "id", id)
	return s.repo.UpdateStockTransferStatus(id, "completed")
}

func (s *BranchService) CancelStockTransfer(id string) error {
	s.log.Info("Stock transfer cancelled", "id", id)
	return s.repo.UpdateStockTransferStatus(id, "cancelled")
}
