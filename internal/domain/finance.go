package domain

import "time"

// Expense represents a business expense
type Expense struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Title     string    `json:"title"`
	Amount    float64   `json:"amount"`
	Date      string    `json:"date"`
	Category  string    `json:"category"`
	Notes     string    `json:"notes,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Discount represents a discount rule
type Discount struct {
	ID       string  `gorm:"primaryKey" json:"id"`
	Name     string  `json:"name"`
	Type     string  `json:"type"` // percentage, fixed
	Value    float64 `json:"value"`
	MinQty   float64 `json:"minQty"`
	IsActive bool    `json:"isActive"`
}

// Shift represents a work shift
type Shift struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	StaffID   string    `gorm:"index" json:"staffId"`
	StaffName string    `json:"staffName"`
	StartTime int64     `json:"startTime"`
	EndTime   int64     `json:"endTime,omitempty"`
	StartCash float64   `json:"startCash"`
	EndCash   float64   `json:"endCash,omitempty"`
	Status    string    `json:"status"` // active, closed
	CreatedAt time.Time `json:"createdAt"`
}

// CashMovement tracks cash in/out during shifts
type CashMovement struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ShiftID   string    `gorm:"index" json:"shiftId"`
	Type      string    `json:"type"` // in, out
	Amount    float64   `json:"amount"`
	Reason    string    `json:"reason"`
	StaffID   string    `json:"staffId"`
	Timestamp int64     `json:"timestamp"`
	CreatedAt time.Time `json:"createdAt"`
}

// PurchaseOrder represents a purchase from supplier
type PurchaseOrder struct {
	ID           string              `gorm:"primaryKey" json:"id"`
	SupplierID   string              `gorm:"index" json:"supplierId"`
	SupplierName string              `json:"supplierName"`
	Date         string              `json:"date"`
	Total        float64             `json:"total"`
	Status       string              `json:"status"` // pending, received, cancelled
	Items        []PurchaseOrderItem `gorm:"foreignKey:OrderID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"items"`
	CreatedAt    time.Time           `json:"createdAt"`
	UpdatedAt    time.Time           `json:"updatedAt"`
}

// PurchaseOrderItem represents an item in a purchase order
type PurchaseOrderItem struct {
	ID        uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	OrderID   string  `gorm:"index" json:"-"`
	ProductID string  `json:"productId"`
	Name      string  `json:"name"`
	Qty       float64 `json:"qty"`
	Cost      float64 `json:"cost"`
	Total     float64 `json:"total"`
}
