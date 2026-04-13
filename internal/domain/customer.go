package domain

import "time"

// Customer represents a customer record
type Customer struct {
	ID              string    `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"index" json:"name"`
	Phone           string    `gorm:"uniqueIndex" json:"phone"`
	Debt  int64  `json:"debt"`
	InstallmentDebt  int64  `json:"installmentDebt"`
	TotalPurchases  int64  `json:"totalPurchases"`
	LastVisit       string    `json:"lastVisit"`
	Points          int       `json:"points"`
	Notes           string    `json:"notes,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// Supplier represents a supplier record
type Supplier struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	CompanyName string    `json:"companyName"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email,omitempty"`
	Notes       string    `json:"notes,omitempty"`
	Balance  int64  `json:"balance"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Payment represents a payment transaction
type Payment struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleID     string    `gorm:"index" json:"saleId"`
	CustomerID string    `gorm:"index" json:"customerId"`
	Amount  int64  `json:"amount"`
	Method     string    `json:"method"`
	Note       string    `json:"note,omitempty"`
	Timestamp  int64     `gorm:"index" json:"timestamp"`
	StaffID    string    `json:"staffId,omitempty"`
	InstIndex  int       `json:"instIndex,omitempty"`
	CreatedAt  time.Time `json:"createdAt"`
}
