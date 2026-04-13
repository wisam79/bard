package domain

import "time"

type Budget struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Category    string    `gorm:"index" json:"category"`
	Amount  int64  `json:"amount"`
	Period      string    `json:"period"`
	StartDate   string    `json:"startDate"`
	EndDate     string    `json:"endDate"`
	SpentAmount  int64  `gorm:"-" json:"spentAmount"`
	IsActive    bool      `gorm:"default:true" json:"isActive"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ExpenseApproval struct {
	ID           uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	ExpenseID    string     `gorm:"index" json:"expenseId"`
	ApproverID   string     `json:"approverId"`
	ApproverName string     `json:"approverName"`
	Status       string     `json:"status"`
	Comment      string     `json:"comment,omitempty"`
	ApprovedAt   *time.Time `json:"approvedAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
}

type ApprovalWorkflow struct {
	ID            string    `gorm:"primaryKey" json:"id"`
	Name          string    `json:"name"`
	MinAmount  int64  `json:"minAmount"`
	MaxAmount  int64  `json:"maxAmount"`
	RequiredLevel string    `json:"requiredLevel"`
	IsActive      *bool     `gorm:"default:true" json:"isActive"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
