package audit_test

import (
	"bard/internal/audit"
	"bard/internal/logger"
	"context"
	"testing"
)

func TestNewAuditService(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	
	if service == nil {
		t.Fatal("NewAuditService returned nil")
	}
}

func TestAuditActionConstants(t *testing.T) {
	// Verify action constants are defined
	actions := []string{
		audit.ActionLogin,
		audit.ActionLogout,
		audit.ActionCreate,
		audit.ActionUpdate,
		audit.ActionDelete,
		audit.ActionView,
		audit.ActionExport,
		audit.ActionPrint,
		audit.ActionProcessReturn,
		audit.ActionPartialReturn,
		audit.ActionReceiveOrder,
		audit.ActionStartShift,
		audit.ActionCloseShift,
		audit.ActionRefund,
		audit.ActionVoidSale,
		audit.ActionUpdateDebt,
		audit.ActionPayment,
		audit.ActionSettingsChange,
		audit.ActionPasswordChange,
		audit.ActionBackup,
		audit.ActionRestore,
		audit.Action2FAEnable,
		audit.Action2FADisable,
		audit.ActionSessionTimeout,
	}
	
	for _, action := range actions {
		if action == "" {
			t.Errorf("Action constant is empty")
		}
	}
}

func TestAuditEntityTypeConstants(t *testing.T) {
	// Verify entity type constants are defined
	entityTypes := []string{
		audit.EntityProduct,
		audit.EntitySale,
		audit.EntityCustomer,
		audit.EntityStaff,
		audit.EntitySupplier,
		audit.EntityExpense,
		audit.EntityPayment,
		audit.EntitySettings,
		audit.EntityShift,
		audit.EntityPurchase,
		audit.EntityCategory,
		audit.EntityDiscount,
		audit.EntityReport,
	}
	
	for _, entityType := range entityTypes {
		if entityType == "" {
			t.Errorf("Entity type constant is empty")
		}
	}
}

func TestLogAction(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	// Should not panic
	service.LogAction(
		ctx,
		audit.ActionCreate,
		audit.EntityProduct,
		"prod-123",
		"staff-1",
		"John Doe",
		"Created new product",
	)
	
	t.Log("LogAction completed without errors")
}

func TestLogSaleAction(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	service.LogSaleAction(
		ctx,
		audit.ActionCreate,
		"sale-123",
		"staff-1",
		"John Doe",
		"Created new sale",
	)
	
	t.Log("LogSaleAction completed without errors")
}

func TestLogProductAction(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	service.LogProductAction(
		ctx,
		audit.ActionUpdate,
		"prod-123",
		"staff-1",
		"John Doe",
		"Updated product price",
	)
	
	t.Log("LogProductAction completed without errors")
}

func TestLogCustomerAction(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	service.LogCustomerAction(
		ctx,
		audit.ActionDelete,
		"cust-123",
		"staff-1",
		"John Doe",
		"Deleted customer",
	)
	
	t.Log("LogCustomerAction completed without errors")
}

func TestLogStaffAction(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	service.LogStaffAction(
		ctx,
		audit.ActionUpdate,
		"staff-456",
		"staff-1",
		"Admin User",
		"Updated staff role",
	)
	
	t.Log("LogStaffAction completed without errors")
}

func TestLogSettingsAction(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	service.LogSettingsAction(
		ctx,
		"staff-1",
		"Admin User",
		"store_info",
		"Changed store name",
	)
	
	t.Log("LogSettingsAction completed without errors")
}

func TestLogLoginAction(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	t.Run("successful login", func(t *testing.T) {
		service.LogLoginAction(ctx, "admin", "192.168.1.1", true)
		t.Log("LogLoginAction (success) completed without errors")
	})
	
	t.Run("failed login", func(t *testing.T) {
		service.LogLoginAction(ctx, "unknown", "192.168.1.2", false)
		t.Log("LogLoginAction (failure) completed without errors")
	})
}

func TestLogSensitiveAction(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	service.LogSensitiveAction(
		ctx,
		audit.ActionDelete,
		audit.EntitySale,
		"sale-123",
		"staff-1",
		"Admin User",
		"Voided sale",
	)
	
	t.Log("LogSensitiveAction completed without errors")
}

func TestLogChanges(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	type Product struct {
		ID    string  `json:"id"`
		Name  string  `json:"name"`
		Price float64 `json:"price"`
	}
	
	before := Product{ID: "prod-1", Name: "Old Name", Price: 100}
	after := Product{ID: "prod-1", Name: "New Name", Price: 150}
	
	service.LogChanges(
		ctx,
		audit.ActionUpdate,
		audit.EntityProduct,
		"prod-1",
		"staff-1",
		"John Doe",
		before,
		after,
	)
	
	t.Log("LogChanges completed without errors")
}

func TestLogChangesWithNilValues(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	// Should not panic with nil values
	service.LogChanges(
		ctx,
		audit.ActionCreate,
		audit.EntityProduct,
		"prod-1",
		"staff-1",
		"John Doe",
		nil,
		map[string]interface{}{"id": "prod-1"},
	)
	
	t.Log("LogChanges with nil before completed without errors")
}

func TestAuditServiceConcurrentLogging(t *testing.T) {
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	done := make(chan bool)
	
	// Start multiple goroutines logging concurrently
	for i := 0; i < 10; i++ {
		go func(id int) {
			for j := 0; j < 10; j++ {
				service.LogAction(
					ctx,
					audit.ActionView,
					audit.EntityProduct,
					string(rune('a'+id)),
					"staff-1",
					"Test User",
					"Concurrent access test",
				)
			}
			done <- true
		}(i)
	}
	
	// Wait for all goroutines
	for i := 0; i < 10; i++ {
		<-done
	}
	
	t.Log("Concurrent logging test passed")
}

func TestAuditActionCoverage(t *testing.T) {
	// Ensure all important actions are tested
	testCases := []struct {
		action     string
		entityType string
	}{
		{audit.ActionLogin, audit.EntityStaff},
		{audit.ActionLogout, audit.EntityStaff},
		{audit.ActionCreate, audit.EntityProduct},
		{audit.ActionUpdate, audit.EntityProduct},
		{audit.ActionDelete, audit.EntityProduct},
		{audit.ActionView, audit.EntityProduct},
		{audit.ActionExport, audit.EntityReport},
		{audit.ActionPrint, audit.EntitySale},
		{audit.ActionProcessReturn, audit.EntitySale},
		{audit.ActionPartialReturn, audit.EntitySale},
		{audit.ActionReceiveOrder, audit.EntityPurchase},
		{audit.ActionStartShift, audit.EntityShift},
		{audit.ActionCloseShift, audit.EntityShift},
		{audit.ActionRefund, audit.EntitySale},
		{audit.ActionVoidSale, audit.EntitySale},
		{audit.ActionUpdateDebt, audit.EntityCustomer},
		{audit.ActionPayment, audit.EntityPayment},
		{audit.ActionSettingsChange, audit.EntitySettings},
		{audit.ActionPasswordChange, audit.EntityStaff},
		{audit.ActionBackup, audit.EntitySettings},
		{audit.ActionRestore, audit.EntitySettings},
	}
	
	log := logger.New(logger.LevelInfo, false)
	service := audit.NewAuditService(log)
	ctx := context.Background()
	
	for _, tc := range testCases {
		service.LogAction(ctx, tc.action, tc.entityType, "test-id", "staff-1", "Test", "Test action")
	}
	
	t.Logf("Tested %d action/entity combinations", len(testCases))
}
