package domain

import "time"

type ProductKit struct {
	ID          string           `gorm:"primaryKey" json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description,omitempty"`
	Price       float64          `json:"price"`
	IsActive    bool             `gorm:"default:true" json:"isActive"`
	Items       []ProductKitItem `gorm:"foreignKey:KitID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"items"`
	CreatedAt   time.Time        `json:"createdAt"`
	UpdatedAt   time.Time        `json:"updatedAt"`
}

type ProductKitItem struct {
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	KitID       string  `gorm:"index" json:"-"`
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Qty         float64 `json:"qty"`
	UnitPrice   float64 `json:"unitPrice"`
}
