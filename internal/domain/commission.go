package domain

import "time"

type CommissionRule struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	Name       string    `json:"name"`
	Type       string    `json:"type"`
	Value      float64   `json:"value"`
	TargetType string    `json:"targetType"`
	TargetID   string    `json:"targetId,omitempty"`
	MinAmount  float64   `json:"minAmount"`
	IsActive   bool      `gorm:"default:true" json:"isActive"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CommissionPayment struct {
	ID          uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	StaffID     string     `gorm:"index" json:"staffId"`
	StaffName   string     `json:"staffName"`
	SaleID      string     `json:"saleId,omitempty"`
	RuleID      string     `json:"ruleId"`
	Amount      float64    `json:"amount"`
	BaseAmount  float64    `json:"baseAmount"`
	PeriodStart string     `json:"periodStart"`
	PeriodEnd   string     `json:"periodEnd"`
	Status      string     `json:"status"`
	PaidAt      *time.Time `json:"paidAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
}

type StaffPerformance struct {
	StaffID      string  `json:"staffId"`
	StaffName    string  `json:"staffName"`
	TotalSales   float64 `json:"totalSales"`
	SalesCount   int     `json:"salesCount"`
	AvgSaleValue float64 `json:"avgSaleValue"`
	TotalReturns float64 `json:"totalReturns"`
	ReturnsCount int     `json:"returnsCount"`
	Commission   float64 `json:"commission"`
	PeriodStart  string  `json:"periodStart"`
	PeriodEnd    string  `json:"periodEnd"`
}
