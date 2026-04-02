package middleware

import (
	"bard/internal/domain"
	"bard/internal/logger"
	"net/http"
)

// Permission constants
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
)

// RolePermissions maps roles to their permissions
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

// AuthMiddleware provides authentication middleware
type AuthMiddleware struct {
	log *logger.Logger
}

// NewAuthMiddleware creates a new auth middleware
func NewAuthMiddleware(log *logger.Logger) *AuthMiddleware {
	return &AuthMiddleware{log: log}
}

// StaffContextKey is the key for staff in context
const StaffContextKey = "staff"

// MiddlewareFunc returns the middleware function
func (m *AuthMiddleware) MiddlewareFunc() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip auth for health check
			if r.URL.Path == "/health" {
				next.ServeHTTP(w, r)
				return
			}

			// In Wails, authentication is handled via the frontend
			// We log the request for audit purposes
			m.log.Info("Request received", "method", r.Method, "path", r.URL.Path)

			next.ServeHTTP(w, r)
		})
	}
}

// RequirePermission checks if staff has required permission
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

// GetRolePermissions returns permissions for a role
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
