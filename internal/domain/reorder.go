package domain

import "time"

type ReorderRule struct {
	ID            string     `gorm:"primaryKey" json:"id"`
	ProductID     string     `gorm:"index" json:"productId"`
	ProductName   string     `gorm:"-" json:"productName"`
	SupplierID    string     `json:"supplierId,omitempty"`
	ReorderPoint  float64    `json:"reorderPoint"`
	ReorderQty    float64    `json:"reorderQty"`
	AutoOrder     bool       `gorm:"default:false" json:"autoOrder"`
	LastOrderedAt *time.Time `json:"lastOrderedAt,omitempty"`
	IsActive      bool       `gorm:"default:true" json:"isActive"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

type ReorderAlert struct {
	ID                string  `json:"id"`
	ProductID         string  `json:"productId"`
	ProductName       string  `json:"productName"`
	CurrentStock      float64 `json:"currentStock"`
	ReorderPoint      float64 `json:"reorderPoint"`
	SuggestedQty      float64 `json:"suggestedQty"`
	SupplierID        string  `json:"supplierId,omitempty"`
	SupplierName      string  `json:"supplierName,omitempty"`
	DaysUntilStockout int     `json:"daysUntilStockout"`
}
