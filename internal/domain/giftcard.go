package domain

import "time"

type GiftCard struct {
	ID             string     `gorm:"primaryKey" json:"id"`
	Code           string     `gorm:"uniqueIndex" json:"code"`
	InitialBalance  int64  `json:"initialBalance"`
	Balance  int64  `json:"balance"`
	CustomerID     string     `json:"customerId,omitempty"`
	PurchasedBy    string     `json:"purchasedBy,omitempty"`
	IsActive       bool       `gorm:"default:true" json:"isActive"`
	ExpiresAt      *time.Time `json:"expiresAt,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
	UpdatedAt      time.Time  `json:"updatedAt"`
}

type GiftCardTransaction struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	GiftCardID string    `gorm:"index" json:"giftCardId"`
	Amount  int64  `json:"amount"`
	Type       string    `json:"type"`
	SaleID     string    `json:"saleId,omitempty"`
	StaffID    string    `json:"staffId,omitempty"`
	Timestamp  int64     `json:"timestamp"`
	CreatedAt  time.Time `json:"createdAt"`
}

type Voucher struct {
	ID          string     `gorm:"primaryKey" json:"id"`
	Code        string     `gorm:"uniqueIndex" json:"code"`
	Name        string     `json:"name"`
	Type        string     `json:"type"`
	Value  int64  `json:"value"`
	MinPurchase  int64  `json:"minPurchase"`
	MaxUses     int        `json:"maxUses"`
	UsedCount   int        `json:"usedCount"`
	IsActive    bool       `gorm:"default:true" json:"isActive"`
	ExpiresAt   *time.Time `json:"expiresAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}
