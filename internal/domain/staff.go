package domain

import "time"

// Staff represents a system user
type Staff struct {
	ID                 string    `gorm:"primaryKey" json:"id"`
	Username           string    `gorm:"uniqueIndex" json:"username"`
	Password           string    `json:"-"`
	Name               string    `json:"name"`
	Role               string    `json:"role"` // admin, cashier, manager
	Phone              string    `json:"phone,omitempty"`
	IsActive           bool      `json:"isActive" gorm:"default:true"`
	MustChangePassword bool      `json:"mustChangePassword" gorm:"default:false"`
	Token              string    `gorm:"-" json:"token,omitempty"` // Transient session token
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

// AppPreferences holds application settings
type AppPreferences struct {
	ID                    uint    `gorm:"primaryKey" json:"-"`
	StoreName             string  `json:"storeName"`
	StoreAddress          string  `json:"storeAddress"`
	StorePhone            string  `json:"storePhone"`
	Currency              string  `json:"currency"`
	TaxRate               float64 `json:"taxRate"`
	Theme                 string  `json:"theme"`
	AccentColor           string  `json:"accentColor"`
	EnableSound           bool    `json:"enableSound"`
	Language              string  `json:"language"`
	LowStockTrigger       int     `json:"lowStockTrigger"`
	AdminPin              string  `json:"adminPin"`
	FontSize              string  `json:"fontSize"`
	AutoLockTime          int     `json:"autoLockTime"`
	SessionTimeoutMinutes int     `json:"sessionTimeoutMinutes" gorm:"default:30"`
	QuickSell             bool    `json:"quickSell"`
	AutoPrint             bool    `json:"autoPrint"`
	AutoPrintFormat       string  `json:"autoPrintFormat"`
	ThermalPaperSize      string  `json:"thermalPaperSize"`
	RequireShift          bool    `json:"requireShift" gorm:"default:false"`
}

// ActivityLog tracks system activities
type ActivityLog struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	StaffID   string    `gorm:"index" json:"staffId"`
	StaffName string    `json:"staffName"`
	Action    string    `json:"action"`
	Details   string    `json:"details,omitempty"`
	IPAddress string    `json:"ipAddress,omitempty"`
	Timestamp int64     `json:"timestamp"`
	CreatedAt time.Time `json:"createdAt"`
}

// SecurityLog tracks security events
type SecurityLog struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	EventType string    `json:"eventType"`
	Details   string    `json:"details"`
	StaffID   string    `json:"staffId,omitempty"`
	IPAddress string    `json:"ipAddress,omitempty"`
	Severity  string    `json:"severity"` // info, warning, critical
	Timestamp int64     `json:"timestamp"`
	CreatedAt time.Time `json:"createdAt"`
}

// LoginAttempt tracks failed login attempts
type LoginAttempt struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Identifier  string `gorm:"uniqueIndex" json:"identifier"`
	Attempts    int    `json:"attempts"`
	LastAttempt int64  `json:"lastAttempt"`
	LockedUntil int64  `json:"lockedUntil"`
}
