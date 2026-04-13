package middleware

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"context"
	"sync"
	"time"
)

type contextKey string

const (
	UserIDKey   contextKey = "userID"
	UsernameKey contextKey = "username"
	UserRoleKey contextKey = "userRole"
)

type RateLimiter struct {
	mu          sync.RWMutex
	attempts    map[string]*attemptInfo
	maxAttempts int
	window      time.Duration
	lockout     time.Duration
}

type attemptInfo struct {
	count       int
	lastAttempt time.Time
	lockedUntil time.Time
}

func NewRateLimiter(maxAttempts int, window, lockout time.Duration) *RateLimiter {
	rl := &RateLimiter{
		attempts:    make(map[string]*attemptInfo),
		maxAttempts: maxAttempts,
		window:      window,
		lockout:     lockout,
	}
	go rl.cleanup()
	return rl
}

func (rl *RateLimiter) Allow(identifier string) (bool, time.Duration) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	info, exists := rl.attempts[identifier]
	if !exists {
		rl.attempts[identifier] = &attemptInfo{
			count:       1,
			lastAttempt: time.Now(),
		}
		return true, 0
	}

	// Check if window has expired first - reset attempts if so
	if time.Since(info.lastAttempt) > rl.window {
		info.count = 1
		info.lastAttempt = time.Now()
		return true, 0
	}

	if time.Now().Before(info.lockedUntil) {
		return false, time.Until(info.lockedUntil)
	}

	if info.count >= rl.maxAttempts {
		info.lockedUntil = time.Now().Add(rl.lockout)
		return false, rl.lockout
	}

	info.count++
	info.lastAttempt = time.Now()
	return true, 0
}

func (rl *RateLimiter) Record(identifier string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	info, exists := rl.attempts[identifier]
	if !exists {
		rl.attempts[identifier] = &attemptInfo{
			count:       1,
			lastAttempt: time.Now(),
		}
		return
	}

	if time.Since(info.lastAttempt) > rl.window {
		info.count = 1
	} else {
		info.count++
	}
	info.lastAttempt = time.Now()
}

func (rl *RateLimiter) Reset(identifier string) {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	delete(rl.attempts, identifier)
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for id, info := range rl.attempts {
			if now.After(info.lockedUntil) && time.Since(info.lastAttempt) > rl.window {
				delete(rl.attempts, id)
			}
		}
		rl.mu.Unlock()
	}
}

type ActivityLogger struct {
	log *logger.Logger
}

func NewActivityLogger(log *logger.Logger) *ActivityLogger {
	return &ActivityLogger{log: log}
}

func (al *ActivityLogger) Log(ctx context.Context, action, details string) {
	userID := GetUserID(ctx)
	username := GetUsername(ctx)

	al.log.Info("Activity",
		"action", action,
		"details", details,
		"userID", userID,
		"username", username,
	)
}

func (al *ActivityLogger) LogSale(ctx context.Context, saleID string, total float64) {
	al.log.Info("Sale completed",
		"saleID", saleID,
		"total", total,
		"userID", GetUserID(ctx),
	)
}

func (al *ActivityLogger) LogProductChange(ctx context.Context, productID, action string) {
	al.log.Info("Product change",
		"productID", productID,
		"action", action,
		"userID", GetUserID(ctx),
	)
}

func WithUser(ctx context.Context, staff *domain.Staff) context.Context {
	ctx = context.WithValue(ctx, UserIDKey, staff.ID)
	ctx = context.WithValue(ctx, UsernameKey, staff.Username)
	ctx = context.WithValue(ctx, UserRoleKey, staff.Role)
	return ctx
}

func GetUserID(ctx context.Context) string {
	if id, ok := ctx.Value(UserIDKey).(string); ok {
		return id
	}
	return ""
}

func GetUsername(ctx context.Context) string {
	if username, ok := ctx.Value(UsernameKey).(string); ok {
		return username
	}
	return ""
}

func GetUserRole(ctx context.Context) string {
	if role, ok := ctx.Value(UserRoleKey).(string); ok {
		return role
	}
	return ""
}

func IsAdmin(ctx context.Context) bool {
	return GetUserRole(ctx) == "admin"
}

func IsManager(ctx context.Context) bool {
	role := GetUserRole(ctx)
	return role == "admin" || role == "manager"
}

func RequireRole(ctx context.Context, allowedRoles ...string) error {
	userRole := GetUserRole(ctx)
	for _, role := range allowedRoles {
		if userRole == role {
			return nil
		}
	}
	return &domain.AppError{
		Module:  domain.ModuleStaff,
		Code:    "FORBIDDEN",
		Message: "Insufficient permissions",
	}
}
