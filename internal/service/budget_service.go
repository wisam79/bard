package service

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type BudgetService struct {
	repo repository.BudgetRepository
	log  *logger.Logger
}

func NewBudgetService(repo repository.BudgetRepository, log *logger.Logger) *BudgetService {
	return &BudgetService{repo: repo, log: log}
}

func (s *BudgetService) GetBudgets() ([]domain.Budget, error) {
	budgets, err := s.repo.GetBudgets()
	if err != nil {
		return nil, err
	}
	for i := range budgets {
		spent, err := s.repo.GetSpentForBudget(budgets[i].ID)
		if err == nil {
			budgets[i].SpentAmount = spent
		}
	}
	return budgets, nil
}

func (s *BudgetService) CreateBudget(budget *domain.Budget) error {
	if budget.Name == "" || budget.Category == "" {
		return fmt.Errorf("اسم وفئة الميزانية مطلوبان")
	}
	budget.ID = uuid.New().String()
	budget.CreatedAt = time.Now()
	budget.UpdatedAt = time.Now()
	s.log.Info("Budget created", "name", budget.Name, "amount", budget.Amount)
	return s.repo.CreateBudget(budget)
}

func (s *BudgetService) UpdateBudget(budget *domain.Budget) error {
	budget.UpdatedAt = time.Now()
	return s.repo.UpdateBudget(budget)
}

func (s *BudgetService) DeleteBudget(id string) error {
	return s.repo.DeleteBudget(id)
}

func (s *BudgetService) CheckBudgetLimit(category string, amount float64) (bool, float64, error) {
	budgets, err := s.repo.GetBudgets()
	if err != nil {
		return true, 0, nil
	}
	for _, b := range budgets {
		if b.Category == category && b.IsActive {
			spent, err := s.repo.GetSpentForBudget(b.ID)
			if err != nil {
				continue
			}
			remaining := b.Amount - spent
			return amount <= remaining, remaining, nil
		}
	}
	return true, 0, nil
}

func (s *BudgetService) GetApprovalWorkflows() ([]domain.ApprovalWorkflow, error) {
	return s.repo.GetApprovalWorkflows()
}

func (s *BudgetService) CreateApprovalWorkflow(wf *domain.ApprovalWorkflow) error {
	wf.ID = uuid.New().String()
	wf.CreatedAt = time.Now()
	wf.UpdatedAt = time.Now()
	return s.repo.CreateApprovalWorkflow(wf)
}

func (s *BudgetService) UpdateApprovalWorkflow(wf *domain.ApprovalWorkflow) error {
	wf.UpdatedAt = time.Now()
	return s.repo.UpdateApprovalWorkflow(wf)
}

func (s *BudgetService) DeleteApprovalWorkflow(id string) error {
	return s.repo.DeleteApprovalWorkflow(id)
}

func (s *BudgetService) ApproveExpense(expenseID, approverID, approverName, comment string) error {
	approval := &domain.ExpenseApproval{
		ExpenseID:    expenseID,
		ApproverID:   approverID,
		ApproverName: approverName,
		Status:       "approved",
		Comment:      comment,
		ApprovedAt:   func() *time.Time { t := time.Now(); return &t }(),
		CreatedAt:    time.Now(),
	}
	return s.repo.CreateExpenseApproval(approval)
}

func (s *BudgetService) RejectExpense(expenseID, approverID, approverName, comment string) error {
	approval := &domain.ExpenseApproval{
		ExpenseID:    expenseID,
		ApproverID:   approverID,
		ApproverName: approverName,
		Status:       "rejected",
		Comment:      comment,
		CreatedAt:    time.Now(),
	}
	return s.repo.CreateExpenseApproval(approval)
}

func (s *BudgetService) GetExpenseApprovals(expenseID string) ([]domain.ExpenseApproval, error) {
	return s.repo.GetExpenseApprovals(expenseID)
}

func (s *BudgetService) RequiresApproval(amount float64) (bool, *domain.ApprovalWorkflow, error) {
	workflows, err := s.repo.GetApprovalWorkflows()
	if err != nil {
		return false, nil, err
	}
	for _, wf := range workflows {
		if wf.IsActive && amount >= wf.MinAmount && (wf.MaxAmount == 0 || amount <= wf.MaxAmount) {
			return true, &wf, nil
		}
	}
	return false, nil, nil
}
