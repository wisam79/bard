package sqlite

import (
	"context"
	"bard/internal/audit"
	"gorm.io/gorm"
)

type auditRepository struct {
	db *gorm.DB
}

// NewAuditRepository creates a new SQLite-backed audit repository
func NewAuditRepository(db *gorm.DB) audit.Repository {
	return &auditRepository{db: db}
}

func (r *auditRepository) Save(ctx context.Context, log *audit.AuditLog) error {
	return r.db.WithContext(ctx).Create(log).Error
}

func (r *auditRepository) GetRecent(ctx context.Context, limit int) ([]audit.AuditLog, error) {
	var logs []audit.AuditLog
	err := r.db.WithContext(ctx).Order("timestamp desc").Limit(limit).Find(&logs).Error
	return logs, err
}
