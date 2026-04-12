package domain

import "time"

type MessagingProvider struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	APIKey    string    `json:"apiKey,omitempty"`
	APISecret string    `json:"apiSecret,omitempty"`
	Phone     string    `json:"phone,omitempty"`
	IsDefault bool      `gorm:"default:false" json:"isDefault"`
	IsActive  bool      `gorm:"default:true" json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type MessageTemplate struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Content   string    `json:"content"`
	Variables string    `json:"variables,omitempty"`
	IsActive  bool      `gorm:"default:true" json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type MessageLog struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	ProviderID string    `json:"providerId"`
	Recipient  string    `json:"recipient"`
	TemplateID string    `json:"templateId,omitempty"`
	Content    string    `json:"content"`
	Status     string    `json:"status"`
	ErrorMsg   string    `json:"errorMsg,omitempty"`
	SaleID     string    `json:"saleId,omitempty"`
	CustomerID string    `json:"customerId,omitempty"`
	StaffID    string    `json:"staffId,omitempty"`
	Timestamp  int64     `json:"timestamp"`
	CreatedAt  time.Time `json:"createdAt"`
}
