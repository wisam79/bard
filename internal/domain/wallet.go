package domain

import "time"

type CustomerWallet struct {
	ID               string    `gorm:"primaryKey" json:"id"`
	CustomerID       string    `gorm:"uniqueIndex" json:"customerId"`
	Balance          float64   `json:"balance"`
	CreditLimit      float64   `json:"creditLimit"`
	AutoDebitEnabled bool      `gorm:"default:false" json:"autoDebitEnabled"`
	AutoDebitDay     int       `json:"autoDebitDay,omitempty"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type WalletTransaction struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerID  string    `gorm:"index" json:"customerId"`
	Amount      float64   `json:"amount"`
	Type        string    `json:"type"`
	ReferenceID string    `json:"referenceId,omitempty"`
	Description string    `json:"description"`
	StaffID     string    `json:"staffId,omitempty"`
	Timestamp   int64     `json:"timestamp"`
	CreatedAt   time.Time `json:"createdAt"`
}
