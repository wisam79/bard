package domain

import "time"

type ReportTemplate struct {
	ID          string    `gorm:"primaryKey" json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Type        string    `json:"type"`
	DataSource  string    `json:"dataSource"`
	Columns     string    `json:"columns"`
	Filters     string    `json:"filters,omitempty"`
	SortBy      string    `json:"sortBy,omitempty"`
	GroupBy     string    `json:"groupBy,omitempty"`
	ChartType   string    `json:"chartType,omitempty"`
	IsShared    bool      `gorm:"default:false" json:"isShared"`
	CreatedBy   string    `json:"createdBy,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type ScheduledExport struct {
	ID         string     `gorm:"primaryKey" json:"id"`
	ReportID   string     `gorm:"index" json:"reportId"`
	Name       string     `json:"name"`
	Format     string     `json:"format"`
	Frequency  string     `json:"frequency"`
	Recipients string     `json:"recipients"`
	LastRunAt  *time.Time `json:"lastRunAt,omitempty"`
	NextRunAt  *time.Time `json:"nextRunAt,omitempty"`
	IsActive   bool       `gorm:"default:true" json:"isActive"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}
