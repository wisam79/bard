package audit

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"time"

	"bard/internal/logger"
)

type AuditLog struct {
	ID         string    `json:"id" gorm:"primaryKey"`
	Timestamp  time.Time `json:"timestamp" gorm:"index"`
	StaffID    string    `json:"staffId" gorm:"index"`
	StaffName  string    `json:"staffName"`
	Action     string    `json:"action" gorm:"index"`
	EntityType string    `json:"entityType" gorm:"index"`
	EntityID   string    `json:"entityId" gorm:"index"`
	Changes    string    `json:"changes"`
	IPAddress  string    `json:"ipAddress,omitempty"`
	Details    string    `json:"details,omitempty"`
	CreatedAt  time.Time `json:"createdAt"`
}

// Action constants
const (
	ActionLogin          = "LOGIN"
	ActionLogout         = "LOGOUT"
	ActionCreate         = "CREATE"
	ActionUpdate         = "UPDATE"
	ActionDelete         = "DELETE"
	ActionView           = "VIEW"
	ActionExport         = "EXPORT"
	ActionPrint          = "PRINT"
	ActionProcessReturn  = "PROCESS_RETURN"
	ActionPartialReturn  = "PARTIAL_RETURN"
	ActionReceiveOrder   = "RECEIVE_ORDER"
	ActionStartShift     = "START_SHIFT"
	ActionCloseShift     = "CLOSE_SHIFT"
	ActionRefund         = "REFUND"
	ActionVoidSale       = "VOID_SALE"
	ActionUpdateDebt     = "UPDATE_DEBT"
	ActionPayment        = "PAYMENT"
	ActionSettingsChange = "SETTINGS_CHANGE"
	ActionPasswordChange = "PASSWORD_CHANGE"
	ActionBackup         = "BACKUP"
	ActionRestore        = "RESTORE"
	Action2FAEnable      = "2FA_ENABLE"
	Action2FADisable     = "2FA_DISABLE"
	ActionSessionTimeout = "SESSION_TIMEOUT"
)

// EntityType constants
const (
	EntityProduct  = "PRODUCT"
	EntitySale     = "SALE"
	EntityCustomer = "CUSTOMER"
	EntityStaff    = "STAFF"
	EntitySupplier = "SUPPLIER"
	EntityExpense  = "EXPENSE"
	EntityPayment  = "PAYMENT"
	EntitySettings = "SETTINGS"
	EntityShift    = "SHIFT"
	EntityPurchase = "PURCHASE_ORDER"
	EntityCategory = "CATEGORY"
	EntityDiscount = "DISCOUNT"
	EntityReport   = "REPORT"
)

// Repository defines the interface for audit log storage
type Repository interface {
	Save(ctx context.Context, log *AuditLog) error
	GetRecent(ctx context.Context, limit int) ([]AuditLog, error)
}

// AuditService provides audit logging functionality
type AuditService struct {
	repo Repository
	log  *logger.Logger
}

// NewAuditService creates a new audit service
func NewAuditService(repo Repository, log *logger.Logger) *AuditService {
	return &AuditService{repo: repo, log: log}
}

// LogAction logs an action to the audit trail
func (s *AuditService) LogAction(ctx context.Context, action, entityType, entityID, staffID, staffName, details string) {
	// Log to console/file
	s.log.Info("Audit",
		"action", action,
		"entityType", entityType,
		"entityID", entityID,
		"staffID", staffID,
	)

	s.log.Audit(action, staffID, details)

	// Save to DB asynchronously to not block the current request
	go func() {
		// Create a background context since the original HTTP context might cancel
		bgCtx := context.Background()
		auditLog := &AuditLog{
			ID:         generateID(),
			Timestamp:  time.Now(),
			StaffID:    staffID,
			StaffName:  staffName,
			Action:     action,
			EntityType: entityType,
			EntityID:   entityID,
			Details:    details,
			CreatedAt:  time.Now(),
		}
		
		if s.repo != nil {
			if err := s.repo.Save(bgCtx, auditLog); err != nil {
				s.log.Error("Failed to save audit log to DB", "error", err, "action", action)
			}
		}
	}()
}

// LogSaleAction logs a sale-related action
func (s *AuditService) LogSaleAction(ctx context.Context, action, saleID, staffID, staffName string, details string) {
	s.LogAction(ctx, action, EntitySale, saleID, staffID, staffName, details)
}

// LogProductAction logs a product-related action
func (s *AuditService) LogProductAction(ctx context.Context, action, productID, staffID, staffName, details string) {
	s.LogAction(ctx, action, EntityProduct, productID, staffID, staffName, details)
}

// LogCustomerAction logs a customer-related action
func (s *AuditService) LogCustomerAction(ctx context.Context, action, customerID, staffID, staffName, details string) {
	s.LogAction(ctx, action, EntityCustomer, customerID, staffID, staffName, details)
}

// LogStaffAction logs a staff-related action
func (s *AuditService) LogStaffAction(ctx context.Context, action, staffID, targetStaffID, staffName, details string) {
	s.LogAction(ctx, action, EntityStaff, targetStaffID, staffID, staffName, details)
}

// LogSettingsAction logs a settings change
func (s *AuditService) LogSettingsAction(ctx context.Context, staffID, staffName, changeType, details string) {
	s.LogAction(ctx, ActionSettingsChange, EntitySettings, changeType, staffID, staffName, details)
}

// LogLoginAction logs a login attempt
func (s *AuditService) LogLoginAction(ctx context.Context, username, ipAddress string, success bool) {
	if !success {
		s.log.Warn("Login failed",
			"username", username,
			"ip", ipAddress,
		)
	} else {
		s.log.Info("Login successful",
			"username", username,
			"ip", ipAddress,
		)
	}
}

// LogSensitiveAction logs a sensitive action (delete, export, etc.)
func (s *AuditService) LogSensitiveAction(ctx context.Context, action, entityType, entityID, staffID, staffName, details string) {
	s.LogAction(ctx, action, entityType, entityID, staffID, staffName, details)
}

// LogChanges logs changes to an entity
func (s *AuditService) LogChanges(ctx context.Context, action, entityType, entityID, staffID, staffName string, before, after interface{}) {
	beforeJSON, _ := json.Marshal(before)
	afterJSON, _ := json.Marshal(after)

	details := map[string]interface{}{
		"before": string(beforeJSON),
		"after":  string(afterJSON),
	}

	detailsJSON, _ := json.Marshal(details)

	s.LogAction(ctx, action, entityType, entityID, staffID, staffName, string(detailsJSON))
}

// generateID generates a unique ID for audit log
func generateID() string {
	return "audit-" + time.Now().Format("20060102150405") + "-" + generateRandomSuffix(6)
}

func generateRandomSuffix(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "00000000000000000000000000000000"[:length]
	}
	return hex.EncodeToString(b)[:length]
}
