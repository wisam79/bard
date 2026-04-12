package domain

import "time"

type NotificationTemplate struct {
	ID        string    `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex" json:"name"`
	Type      string    `json:"type"`
	Channel   string    `json:"channel"`
	Subject   string    `json:"subject,omitempty"`
	Body      string    `json:"body"`
	IsActive  bool      `gorm:"default:true" json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type NotificationLog struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TemplateID string    `json:"templateId"`
	Recipient  string    `json:"recipient"`
	Channel    string    `json:"channel"`
	Status     string    `json:"status"`
	Error      string    `json:"error,omitempty"`
	SentAt     int64     `json:"sentAt"`
	CreatedAt  time.Time `json:"createdAt"`
}

type NotificationSettings struct {
	ID              uint   `gorm:"primaryKey" json:"-"`
	WhatsAppAPIKey  string `json:"whatsappApiKey,omitempty"`
	WhatsAppPhone   string `json:"whatsappPhone,omitempty"`
	SMSCheckpoint   string `json:"smsCheckpoint,omitempty"`
	EnableWhatsApp  bool   `gorm:"default:false" json:"enableWhatsApp"`
	EnableSMS       bool   `gorm:"default:false" json:"enableSMS"`
	LowStockAlert   bool   `gorm:"default:true" json:"lowStockAlert"`
	DailySummary    bool   `gorm:"default:false" json:"dailySummary"`
	PaymentReminder bool   `gorm:"default:true" json:"paymentReminder"`
}
