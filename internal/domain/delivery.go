package domain

import "time"

type DeliveryDriver struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	VehicleNo string    `json:"vehicleNo,omitempty"`
	IsActive  bool      `gorm:"default:true" json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type DeliveryOrder struct {
	ID            string     `gorm:"primaryKey" json:"id"`
	SaleID        string     `gorm:"index" json:"saleId"`
	CustomerID    string     `json:"customerId,omitempty"`
	CustomerName  string     `json:"customerName"`
	CustomerPhone string     `json:"customerPhone"`
	Address       string     `json:"address"`
	Notes         string     `json:"notes,omitempty"`
	DriverID      string     `json:"driverId,omitempty"`
	DriverName    string     `json:"driverName,omitempty"`
	Status        string     `json:"status"`
	Fee           int64      `json:"fee"`
	EstimatedAt   *time.Time `json:"estimatedAt,omitempty"`
	DeliveredAt   *time.Time `json:"deliveredAt,omitempty"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}
