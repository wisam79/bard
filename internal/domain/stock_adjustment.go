package domain

import "time"

type StockAdjustment struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	ProductID   string    `gorm:"index" json:"productId"`
	ProductName string    `json:"productName"`
	Type        string    `json:"type"`
	QtyBefore   float64   `json:"qtyBefore"`
	QtyAfter    float64   `json:"qtyAfter"`
	Delta       float64   `json:"delta"`
	Reason      string    `json:"reason"`
	CostImpact  int64  `json:"costImpact"`
	StaffID     string    `json:"staffId"`
	StaffName   string    `json:"staffName"`
	Note        string    `json:"note,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
}

type WasteRecord struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID   string    `gorm:"index" json:"productId"`
	ProductName string    `json:"productName"`
	Qty         float64   `json:"qty"`
	WasteType   string    `json:"wasteType"`
	CostLoss  int64  `json:"costLoss"`
	Reason      string    `json:"reason"`
	StaffID     string    `json:"staffId"`
	StaffName   string    `json:"staffName"`
	Date        string    `json:"date"`
	CreatedAt   time.Time `json:"createdAt"`
}

type StockVarianceReport struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	SystemQty   float64 `json:"systemQty"`
	PhysicalQty float64 `json:"physicalQty"`
	Variance    float64 `json:"variance"`
	VariancePct float64 `json:"variancePct"`
	CostImpact  int64  `json:"costImpact"`
}
