package domain

import "time"

type LoyaltyTier struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"uniqueIndex" json:"name"`
	MinPoints   int       `json:"minPoints"`
	PointsRate  float64   `json:"pointsRate"`
	DiscountPct float64   `json:"discountPct"`
	Color       string    `json:"color"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type LoyaltyRule struct {
	ID              string    `gorm:"primaryKey" json:"id"`
	Name            string    `json:"name"`
	PointsPerAmount float64   `json:"pointsPerAmount"`
	MinPurchase     float64   `json:"minPurchase"`
	IsActive        bool      `gorm:"default:true" json:"isActive"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

type LoyaltyTransaction struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerID  string    `gorm:"index" json:"customerId"`
	Points      int       `json:"points"`
	Type        string    `json:"type"`
	ReferenceID string    `json:"referenceId,omitempty"`
	Description string    `json:"description"`
	StaffID     string    `json:"staffId,omitempty"`
	Timestamp   int64     `json:"timestamp"`
	CreatedAt   time.Time `json:"createdAt"`
}

type LoyaltyRedemption struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	CustomerID  string    `gorm:"index" json:"customerId"`
	Points      int       `json:"points"`
	RewardType  string    `json:"rewardType"`
	RewardValue float64   `json:"rewardValue"`
	SaleID      string    `json:"saleId,omitempty"`
	StaffID     string    `json:"staffId,omitempty"`
	Timestamp   int64     `json:"timestamp"`
	CreatedAt   time.Time `json:"createdAt"`
}
