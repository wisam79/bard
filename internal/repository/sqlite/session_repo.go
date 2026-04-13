package sqlite

import (
	"bard/internal/domain"
	"bard/internal/repository"
	"time"

	"gorm.io/gorm"
)

// SessionRepository handles database operations for sessions
type SessionRepository struct {
	db *gorm.DB
}

// NewSessionRepository creates a new session repository
func NewSessionRepository(db *gorm.DB) repository.SessionRepository {
	return &SessionRepository{db: db}
}

// CreateSession saves a new session to the database
func (r *SessionRepository) CreateSession(session *domain.Session) error {
	return r.db.Create(session).Error
}

// GetSessionByTokenHash retrieves an active session by its token hash
func (r *SessionRepository) GetSessionByTokenHash(tokenHash string) (*domain.Session, error) {
	var session domain.Session
	err := r.db.Where("token_hash = ?", tokenHash).First(&session).Error
	if err != nil {
		return nil, err
	}
	// Check expiration
	if time.Now().After(session.ExpiresAt) {
		r.DeleteSession(session.ID) // cleanup expired session
		return nil, gorm.ErrRecordNotFound
	}
	return &session, nil
}

// UpdateLastActive updates the last active timestamp of a session
func (r *SessionRepository) UpdateLastActive(id string, activeTime time.Time) error {
	return r.db.Model(&domain.Session{}).Where("id = ?", id).Update("last_active", activeTime).Error
}

// DeleteSession removes a session from the database (logout)
func (r *SessionRepository) DeleteSession(id string) error {
	return r.db.Delete(&domain.Session{}, "id = ?", id).Error
}

// DeleteSessionByTokenHash removes a session using its token hash
func (r *SessionRepository) DeleteSessionByTokenHash(tokenHash string) error {
	return r.db.Delete(&domain.Session{}, "token_hash = ?", tokenHash).Error
}

// CleanExpiredSessions removes all sessions that have passed their expiration date
func (r *SessionRepository) CleanExpiredSessions() error {
	return r.db.Where("expires_at < ?", time.Now()).Delete(&domain.Session{}).Error
}
