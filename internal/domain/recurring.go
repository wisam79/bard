package domain

import "time"

type RecurringInvoice struct {
	ID            string                 `gorm:"primaryKey" json:"id"`
	CustomerID    string                 `gorm:"index" json:"customerId"`
	CustomerName  string                 `gorm:"index" json:"customerName"`
	Frequency     string                 `json:"frequency"`
	StartDate     string                 `json:"startDate"`
	EndDate       string                 `json:"endDate,omitempty"`
	NextRunDate   string                 `gorm:"index" json:"nextRunDate"`
	Subtotal      float64                `json:"subtotal"`
	Discount      float64                `json:"discount"`
	VAT           float64                `json:"vat"`
	Total         float64                `json:"total"`
	PaymentMethod string                 `json:"paymentMethod"`
	Status        string                 `gorm:"index" json:"status"`
	Items         []RecurringInvoiceItem `gorm:"foreignKey:InvoiceID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"items"`
	LastRunDate   string                 `json:"lastRunDate,omitempty"`
	RunCount      int                    `json:"runCount"`
	CreatedAt     time.Time              `json:"createdAt"`
	UpdatedAt     time.Time              `json:"updatedAt"`
}

type RecurringInvoiceItem struct {
	ID        uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	InvoiceID string  `gorm:"index" json:"-"`
	ProductID string  `json:"productId"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Qty       float64 `json:"qty"`
	Total     float64 `json:"total"`
}
