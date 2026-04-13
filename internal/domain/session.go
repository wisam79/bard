package domain

import "time"

// Session represents a persistent login session in the database
type Session struct {
	ID         string    `gorm:"primaryKey" json:"id"`
	TokenHash  string    `gorm:"uniqueIndex;not null" json:"-"`
	StaffID    string    `gorm:"index;not null" json:"staffId"`
	StaffRole  string    `json:"staffRole"`
	IPAddress  string    `json:"ipAddress"`
	UserAgent  string    `json:"userAgent"`
	LastActive time.Time `json:"lastActive"`
	ExpiresAt  time.Time `gorm:"index;not null" json:"expiresAt"`
	CreatedAt  time.Time `json:"createdAt"`
}
