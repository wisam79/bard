package domain

import "time"

// Product represents an inventory item
type Product struct {
	ID             string                 `gorm:"primaryKey" json:"id"`
	Name           string                 `json:"name"`
	Barcode        string                 `gorm:"uniqueIndex" json:"barcode"`
	Price  int64  `json:"price"`
	Cost  int64  `json:"cost"`
	Stock          float64                `json:"stock"`
	MinStock       float64                `json:"minStock"`
	Category       string                 `gorm:"index" json:"category"`
	Image          string                 `json:"image,omitempty"`
	Supplier       string                 `json:"supplier,omitempty"`
	WholesalePrice  int64  `json:"wholesalePrice"`
	Description    string                 `json:"description,omitempty"`
	CustomDetails  map[string]interface{} `gorm:"serializer:json" json:"customDetails,omitempty"`
	CreatedAt      time.Time              `json:"createdAt"`
	UpdatedAt      time.Time              `json:"updatedAt"`
}

// Category represents a product category
type Category struct {
	ID     string          `gorm:"primaryKey" json:"id"`
	Name   string          `gorm:"uniqueIndex" json:"name"`
	Fields []CategoryField `gorm:"serializer:json" json:"fields,omitempty"`
}

// CategoryField represents a custom field definition
type CategoryField struct {
	Name    string   `json:"name"`
	Type    string   `json:"type"`
	Options []string `json:"options,omitempty"`
}

// ProductStats holds inventory statistics
type ProductStats struct {
	TotalStock float64 `json:"totalStock"`
	TotalValue  int64  `json:"totalValue"`
	TotalCost  int64  `json:"totalCost"`
	Profit  int64  `json:"profit"`
}

// PaginatedProducts holds paginated product list
type PaginatedProducts struct {
	Data       []Product    `json:"data"`
	Total      int64        `json:"total"`
	TotalPages int          `json:"totalPages"`
	Page       int          `json:"page"`
	Stats      ProductStats `json:"stats"`
}

// StockMovement tracks inventory changes
type StockMovement struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID   string    `gorm:"index" json:"productId"`
	ProductName string    `json:"productName"`
	Type        string    `json:"type"`
	Qty         float64   `json:"qty"`
	Reason      string    `json:"reason,omitempty"`
	Timestamp   time.Time `json:"timestamp"`
}
