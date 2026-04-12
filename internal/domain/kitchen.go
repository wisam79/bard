package domain

import "time"

type KitchenOrder struct {
	ID          string             `gorm:"primaryKey" json:"id"`
	SaleID      string             `gorm:"index" json:"saleId"`
	TableNumber string             `json:"tableNumber,omitempty"`
	Items       []KitchenOrderItem `gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"items"`
	Priority    string             `json:"priority"`
	Status      string             `gorm:"index" json:"status"`
	AssignedTo  string             `json:"assignedTo,omitempty"`
	StartedAt   *time.Time         `json:"startedAt,omitempty"`
	CompletedAt *time.Time         `json:"completedAt,omitempty"`
	ElapsedMin  int                `json:"elapsedMin"`
	Note        string             `json:"note,omitempty"`
	CreatedAt   time.Time          `json:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt"`
}

type KitchenOrderItem struct {
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID     string  `gorm:"index" json:"-"`
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Qty         float64 `json:"qty"`
	Note        string  `json:"note,omitempty"`
	Status      string  `json:"status"`
}

type KitchenStation struct {
	ID         string   `gorm:"primaryKey" json:"id"`
	Name       string   `gorm:"uniqueIndex" json:"name"`
	Categories []string `gorm:"serializer:json" json:"categories"`
	IsActive   bool     `gorm:"default:true" json:"isActive"`
}
