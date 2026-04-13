package domain

import "time"

type Currency struct {
	ID           string    `gorm:"primaryKey" json:"id"`
	Code         string    `gorm:"uniqueIndex" json:"code"`
	Name         string    `json:"name"`
	Symbol       string    `json:"symbol"`
	IsBase       bool      `gorm:"default:false" json:"isBase"`
	ExchangeRate float64   `json:"exchangeRate"`
	IsActive     bool      `gorm:"default:true" json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type CurrencyTransaction struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SaleID       string    `gorm:"index" json:"saleId,omitempty"`
	FromCurrency string    `json:"fromCurrency"`
	ToCurrency   string    `json:"toCurrency"`
	FromAmount  int64  `json:"fromAmount"`
	ToAmount  int64  `json:"toAmount"`
	AppliedRate  float64   `json:"appliedRate"`
	StaffID      string    `json:"staffId,omitempty"`
	Timestamp    int64     `json:"timestamp"`
	CreatedAt    time.Time `json:"createdAt"`
}
