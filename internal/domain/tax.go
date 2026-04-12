package domain

import "time"

type TaxRate struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	Name       string    `json:"name"`
	Code       string    `gorm:"uniqueIndex" json:"code"`
	Rate       float64   `json:"rate"`
	Type       string    `json:"type"`
	IsDefault  bool      `gorm:"default:false" json:"isDefault"`
	IsCompound bool      `gorm:"default:false" json:"isCompound"`
	IsActive   bool      `gorm:"default:true" json:"isActive"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type ProductTax struct {
	ID        uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID string `gorm:"index" json:"productId"`
	TaxRateID string `gorm:"index" json:"taxRateId"`
}

type TaxReport struct {
	TaxRateID    string  `json:"taxRateId"`
	TaxName      string  `json:"taxName"`
	TaxCode      string  `json:"taxCode"`
	TaxRate      float64 `json:"taxRate"`
	TotalSales   float64 `json:"totalSales"`
	TotalTax     float64 `json:"totalTax"`
	TotalReturns float64 `json:"totalReturns"`
	ReturnTax    float64 `json:"returnTax"`
	NetTax       float64 `json:"netTax"`
	PeriodStart  string  `json:"periodStart"`
	PeriodEnd    string  `json:"periodEnd"`
}
