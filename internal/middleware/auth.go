package middleware

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"sync"
	"time"
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

type sessionInfo struct {
	staff      *domain.Staff
	createdAt  time.Time
	lastActive time.Time
}

type AuthMiddleware struct {
	log         *logger.Logger
	rateLimiter *RateLimiter
	mu          sync.RWMutex
	sessions    map[string]*sessionInfo
}

func NewAuthMiddleware(log *logger.Logger, rateLimiter *RateLimiter) *AuthMiddleware {
	am := &AuthMiddleware{
		log:         log,
		rateLimiter: rateLimiter,
		sessions:    make(map[string]*sessionInfo),
	}
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
				m.mu.RLock()
				sess, exists := m.sessions[token]
				m.mu.RUnlock()

				if exists && time.Since(sess.lastActive) < 30*time.Minute {
					sess.lastActive = time.Now()
					next.ServeHTTP(w, r)
					return
				} else if exists {
					m.mu.Lock()
					delete(m.sessions, token)
					m.mu.Unlock()
				}
			}

			m.log.Info("Request received", "method", r.Method, "path", r.URL.Path)
			next.ServeHTTP(w, r)
		})
	}
}

func (m *AuthMiddleware) CreateSession(staff *domain.Staff) string {
	token := generateToken()
	m.mu.Lock()
	m.sessions[token] = &sessionInfo{
		staff:      staff,
		createdAt:  time.Now(),
		lastActive: time.Now(),
	}
	m.mu.Unlock()
	m.log.Info("Session created", "staffID", staff.ID, "role", staff.Role)
	return token
}

func (m *AuthMiddleware) DestroySession(token string) {
	m.mu.Lock()
	delete(m.sessions, token)
	m.mu.Unlock()
}

func (m *AuthMiddleware) GetStaff(token string) (*domain.Staff, bool) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	sess, exists := m.sessions[token]
	if !exists || time.Since(sess.lastActive) > 30*time.Minute {
		return nil, false
	}
	return sess.staff, true
}

func (m *AuthMiddleware) cleanupSessions() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		m.mu.Lock()
		now := time.Now()
		for token, sess := range m.sessions {
			if now.Sub(sess.lastActive) > 30*time.Minute {
				delete(m.sessions, token)
			}
		}
		m.mu.Unlock()
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
