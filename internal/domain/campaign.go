package domain

import "time"

type CustomerSegment struct {
	ID            string    `gorm:"primaryKey" json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Rules         string    `json:"rules"`
	Color         string    `json:"color"`
	CustomerCount int       `gorm:"-" json:"customerCount"`
	IsActive      bool      `gorm:"default:true" json:"isActive"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type CustomerSegmentMember struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SegmentID  string    `gorm:"index" json:"segmentId"`
	CustomerID string    `gorm:"index" json:"customerId"`
	AddedAt    time.Time `json:"addedAt"`
}

type Campaign struct {
	ID            string     `gorm:"primaryKey" json:"id"`
	Name          string     `json:"name"`
	Description   string     `json:"description"`
	Type          string     `json:"type"`
	SegmentID     string     `json:"segmentId"`
	DiscountID    string     `json:"discountId,omitempty"`
	MessageTmpl   string     `json:"messageTmpl,omitempty"`
	Status        string     `json:"status"`
	ScheduledAt   *time.Time `json:"scheduledAt,omitempty"`
	StartedAt     *time.Time `json:"startedAt,omitempty"`
	EndedAt       *time.Time `json:"endedAt,omitempty"`
	TargetCount   int        `json:"targetCount"`
	SentCount     int        `json:"sentCount"`
	ResponseCount int        `json:"responseCount"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}
