package middleware

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"

	"github.com/google/uuid"
)

const (
	PermViewDashboard  = "view:dashboard"
	PermViewSales      = "view:sales"
	PermViewProducts   = "view:products"
	PermViewCustomers  = "view:customers"
	PermViewFinance    = "view:finance"
	PermViewReports    = "view:reports"
	PermViewSettings   = "view:settings"
	PermCreateSale     = "create:sale"
	PermCreateProduct  = "create:product"
	PermCreateCustomer = "create:customer"
	PermEditProduct    = "edit:product"
	PermEditCustomer   = "edit:customer"
	PermEditSettings   = "edit:settings"
	PermDeleteProduct  = "delete:product"
	PermDeleteSale     = "delete:sale"
	PermManageStaff    = "manage:staff"
	PermViewFullReport = "view:reports:full"
	PermExportReports  = "export:reports"
	PermImportDatabase = "import:database"
	PermResetDatabase  = "reset:database"
	PermReceiveOrder   = "receive:order"
)

var RolePermissions = map[string]map[string]bool{
	"admin": {
		PermViewDashboard:  true,
		PermViewSales:      true,
		PermViewProducts:   true,
		PermViewCustomers:  true,
		PermViewFinance:    true,
		PermViewReports:    true,
		PermViewSettings:   true,
		PermCreateSale:     true,
		PermCreateProduct:  true,
		PermCreateCustomer: true,
		PermEditProduct:    true,
		PermEditCustomer:   true,
		PermEditSettings:   true,
		PermDeleteProduct:  true,
		PermDeleteSale:     true,
		PermManageStaff:    true,
		PermViewFullReport: true,
		PermExportReports:  true,
		PermImportDatabase: true,
		PermResetDatabase:  true,
		PermReceiveOrder:   true,
	},
	"manager": {
		PermViewDashboard:  true,
		PermViewSales:      true,
		PermViewProducts:   true,
		PermViewCustomers:  true,
		PermViewFinance:    true,
		PermViewReports:    true,
		PermViewSettings:   true,
		PermCreateSale:     true,
		PermCreateProduct:  true,
		PermCreateCustomer: true,
		PermEditProduct:    true,
		PermEditCustomer:   true,
		PermEditSettings:   true,
		PermDeleteProduct:  true,
		PermDeleteSale:     true,
		PermViewFullReport: true,
		PermExportReports:  true,
		PermReceiveOrder:   true,
	},
	"cashier": {
		PermViewDashboard:  true,
		PermViewSales:      true,
		PermViewProducts:   true,
		PermViewCustomers:  true,
		PermCreateSale:     true,
		PermCreateCustomer: true,
		PermEditCustomer:   true,
	},
	"viewer": {
		PermViewDashboard: true,
		PermViewReports:   true,
		PermViewProducts:  true,
		PermViewCustomers: true,
	},
}

type AuthMiddleware struct {
	log         *logger.Logger
	rateLimiter *RateLimiter
	sessionRepo repository.SessionRepository
	staffRepo   repository.StaffRepository
}

func NewAuthMiddleware(log *logger.Logger, rateLimiter *RateLimiter, sessionRepo repository.SessionRepository, staffRepo repository.StaffRepository) *AuthMiddleware {
	am := &AuthMiddleware{
		log:         log,
		rateLimiter: rateLimiter,
		sessionRepo: sessionRepo,
		staffRepo:   staffRepo,
	}
	// Start background cleanup of expired sessions
	go am.cleanupSessions()
	return am
}

func (m *AuthMiddleware) MiddlewareFunc() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/health" {
				next.ServeHTTP(w, r)
				return
			}

			token := r.Header.Get("X-Auth-Token")
			if token == "" {
				token = r.URL.Query().Get("token")
			}

			if token != "" {
				tokenHash := hashToken(token)
				sess, err := m.sessionRepo.GetSessionByTokenHash(tokenHash)
				if err == nil && sess != nil {
					// Update last active time periodically (e.g. if older than 5 mins to avoid hitting DB every request)
					if time.Since(sess.LastActive) > 5*time.Minute {
						m.sessionRepo.UpdateLastActive(sess.ID, time.Now())
					}
					next.ServeHTTP(w, r)
					return
				}
			}

			m.log.Info("Request received", "method", r.Method, "path", r.URL.Path)
			next.ServeHTTP(w, r)
		})
	}
}

func (m *AuthMiddleware) CreateSession(staff *domain.Staff) string {
	token := generateToken()
	tokenHash := hashToken(token)

	// Determine session length (you could fetch this from app preferences)
	expiresAt := time.Now().Add(24 * time.Hour) // default to 24h for persistent desktop sessions

	session := &domain.Session{
		ID:         uuid.New().String(),
		TokenHash:  tokenHash,
		StaffID:    staff.ID,
		StaffRole:  staff.Role,
		LastActive: time.Now(),
		ExpiresAt:  expiresAt,
		CreatedAt:  time.Now(),
	}

	if err := m.sessionRepo.CreateSession(session); err != nil {
		m.log.Error("Failed to create session in DB", "error", err, "staffID", staff.ID)
		return ""
	}

	m.log.Info("Session created", "staffID", staff.ID, "role", staff.Role)
	return token
}

func (m *AuthMiddleware) DestroySession(token string) {
	tokenHash := hashToken(token)
	if err := m.sessionRepo.DeleteSessionByTokenHash(tokenHash); err != nil {
		m.log.Error("Failed to destroy session", "error", err)
	}
}

func (m *AuthMiddleware) GetStaff(token string) (*domain.Staff, bool) {
	if token == "" {
		return nil, false
	}
	tokenHash := hashToken(token)
	sess, err := m.sessionRepo.GetSessionByTokenHash(tokenHash)
	if err != nil || sess == nil {
		return nil, false
	}

	// Fetch fresh staff details so we reflect role/status changes instantly
	staff, err := m.staffRepo.GetByID(sess.StaffID)
	if err != nil || (staff.IsActive != nil && !*staff.IsActive) {
		m.sessionRepo.DeleteSession(sess.ID)
		return nil, false
	}

	return staff, true
}

func (m *AuthMiddleware) cleanupSessions() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	for range ticker.C {
		if err := m.sessionRepo.CleanExpiredSessions(); err != nil {
			m.log.Error("Failed to clean expired sessions", "error", err)
		}
	}
}

func RequirePermission(staff *domain.Staff, permission string) bool {
	if staff == nil {
		return false
	}
	perms, ok := RolePermissions[staff.Role]
	if !ok {
		return false
	}
	return perms[permission]
}

func GetRolePermissions(role string) []string {
	rolePerms, ok := RolePermissions[role]
	if !ok {
		return []string{}
	}
	perms := make([]string, 0, len(rolePerms))
	for p, has := range rolePerms {
		if has {
			perms = append(perms, p)
		}
	}
	return perms
}

func generateToken() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
