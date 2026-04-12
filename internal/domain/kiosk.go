package domain

import "time"

type KioskLayout struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	Name       string    `json:"name"`
	Theme      string    `json:"theme"`
	ShowImages bool      `gorm:"default:true" json:"showImages"`
	FontSize   string    `gorm:"default:'large'" json:"fontSize"`
	Categories string    `json:"categories"`
	WelcomeMsg string    `json:"welcomeMsg"`
	AcceptCash bool      `gorm:"default:true" json:"acceptCash"`
	AcceptCard bool      `gorm:"default:true" json:"acceptCard"`
	IsDefault  bool      `gorm:"default:false" json:"isDefault"`
	IsActive   bool      `gorm:"default:true" json:"isActive"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type KioskSession struct {
	ID          uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	LayoutID    string     `json:"layoutId"`
	SaleID      string     `json:"saleId,omitempty"`
	StartedAt   time.Time  `json:"startedAt"`
	EndedAt     *time.Time `json:"endedAt,omitempty"`
	TotalAmount float64    `json:"totalAmount"`
	Status      string     `json:"status"`
}
