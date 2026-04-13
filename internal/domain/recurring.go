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
	Subtotal  int64  `json:"subtotal"`
	Discount  int64  `json:"discount"`
	VAT  int64  `json:"vat"`
	Total  int64  `json:"total"`
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
	Price  int64  `json:"price"`
	Qty       float64 `json:"qty"`
	Total  int64  `json:"total"`
}
