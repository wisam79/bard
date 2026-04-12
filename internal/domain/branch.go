package domain

import "time"

type Branch struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex" json:"name"`
	Address   string    `json:"address,omitempty"`
	Phone     string    `json:"phone,omitempty"`
	ManagerID string    `json:"managerId,omitempty"`
	IsActive  bool      `gorm:"default:true" json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type StockTransfer struct {
	ID         string              `gorm:"primaryKey" json:"id"`
	FromBranch string              `gorm:"index" json:"fromBranch"`
	ToBranch   string              `gorm:"index" json:"toBranch"`
	Status     string              `gorm:"index" json:"status"`
	StaffID    string              `json:"staffId"`
	StaffName  string              `json:"staffName"`
	Note       string              `json:"note,omitempty"`
	Items      []StockTransferItem `gorm:"foreignKey:TransferID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"items"`
	CreatedAt  time.Time           `json:"createdAt"`
	UpdatedAt  time.Time           `json:"updatedAt"`
}

type StockTransferItem struct {
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	TransferID  string  `gorm:"index" json:"-"`
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Qty         float64 `json:"qty"`
}
