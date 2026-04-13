package domain

import "time"

// Sale represents a sales transaction
type Sale struct {
	ID              string             `gorm:"primaryKey" json:"id"`
	CustomerID      string             `json:"customerId,omitempty"`
	CustomerName    string             `gorm:"index" json:"customer"`
	StaffID         string             `gorm:"index" json:"staffId"`
	StaffName       string             `json:"staffName"`
	Date            string             `gorm:"index" json:"date"`
	Timestamp       int64              `gorm:"index" json:"timestamp"`
	Subtotal  int64  `json:"subtotal"`
	Discount  int64  `json:"discount"`
	VAT  int64  `json:"vat"`
	Total  int64  `json:"total"`
	TotalCost  int64  `json:"totalCost"`
	PaymentMethod   string             `json:"paymentMethod"`
	Status          string             `gorm:"index" json:"status"`
	ItemsCount      float64            `json:"itemsCount"`
	Items           []SaleItem         `gorm:"foreignKey:SaleID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"items"`
	SplitDetails    map[string]int64 `gorm:"serializer:json" json:"splitDetails,omitempty"`
	InstallmentPlan *InstallmentPlan   `gorm:"serializer:json" json:"installmentPlan,omitempty"`
	Note            string             `json:"note,omitempty"`
	PointsAwarded   int                `json:"pointsAwarded"`
	CreatedAt       time.Time          `json:"createdAt"`
	UpdatedAt       time.Time          `json:"updatedAt"`
}

// SaleItem represents an item in a sale
type SaleItem struct {
	ID          uint    `gorm:"primaryKey;autoIncrement" json:"pid"`
	SaleID      string  `gorm:"index" json:"-"`
	ProductID   string  `json:"id"`
	Name        string  `json:"name"`
	Price  int64  `json:"price"`
	Quantity    float64 `json:"qty"`
	Total  int64  `json:"total"`
	Cost  int64  `json:"cost"`
	Discount  int64  `json:"discount,omitempty"`
	ReturnedQty float64 `json:"returnedQty"`
}

// InstallmentPlan represents a payment plan
type InstallmentPlan struct {
	TotalAmount  int64  `json:"totalAmount"`
	DownPayment  int64  `json:"downPayment"`
	Months      int           `json:"months"`
	StartDate   string        `json:"startDate"`
	Schedule    []Installment `json:"schedule"`
}

// Installment represents a single installment
type Installment struct {
	Number  int     `json:"number"`
	DueDate string  `json:"dueDate"`
	Amount  int64  `json:"amount"`
	Status  string  `json:"status"`
	PaidAt  int64   `json:"paidAt,omitempty"`
}

// ParkedSale represents a saved cart
type ParkedSale struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ItemsJSON    string    `json:"itemsJson"`
	CustomerName string    `json:"customerName"`
	CustomerID   string    `json:"customerId"`
	Note         string    `json:"note"`
	Total  int64  `json:"total"`
	ItemsCount   float64   `json:"itemsCount"`
	CreatedAt    time.Time `json:"createdAt"`
}

// PaginatedSales holds paginated sale list
type PaginatedSales struct {
	Data       []Sale       `json:"data"`
	Total      int64        `json:"total"`
	TotalPages int          `json:"totalPages"`
	Page       int          `json:"page"`
	Stats      InvoiceStats `json:"stats"`
}

// InvoiceStats holds invoice statistics
type InvoiceStats struct {
	Count   int64   `json:"count"`
	Total  int64  `json:"total"`
	Pending  int64  `json:"pending"`
	Returns int64   `json:"returns"`
}
