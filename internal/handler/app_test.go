package handler

import (
	"testing"
	"time"

	"bard/internal/audit"
	"bard/internal/cache"
	"bard/internal/crypto"
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/middleware"
	"bard/internal/mocks"
	"bard/internal/service"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func newTestEncryptor(t *testing.T) *crypto.Encryptor {
	t.Helper()
	key := make([]byte, 32)
	enc, err := crypto.NewEncryptor(key)
	if err != nil {
		t.Fatalf("failed to create test encryptor: %v", err)
	}
	return enc
}

type fakeSessionRepo struct {
	sessions map[string]*domain.Session
}
func (f *fakeSessionRepo) CreateSession(session *domain.Session) error {
	f.sessions[session.TokenHash] = session
	return nil
}
func (f *fakeSessionRepo) GetSessionByTokenHash(hash string) (*domain.Session, error) {
	if s, ok := f.sessions[hash]; ok {
		return s, nil
	}
	return nil, nil // error not strict for tests
}
func (f *fakeSessionRepo) UpdateLastActive(id string, activeTime time.Time) error { return nil }
func (f *fakeSessionRepo) DeleteSession(id string) error { return nil }
func (f *fakeSessionRepo) DeleteSessionByTokenHash(hash string) error {
	delete(f.sessions, hash)
	return nil
}
func (f *fakeSessionRepo) CleanExpiredSessions() error { return nil }

func newTestApp(t *testing.T) (*App, *middleware.AuthMiddleware) {
	t.Helper()
	log := logger.New(logger.LevelInfo, false)
	rateLimiter := middleware.NewRateLimiter(5, 15*time.Minute, 30*time.Minute)

	mockProductRepo := new(mocks.ProductRepository)
	mockSaleRepo := new(mocks.SaleRepository)
	mockCustomerRepo := new(mocks.CustomerRepository)
	mockStaffRepo := new(mocks.StaffRepository)
	
	fsr := &fakeSessionRepo{sessions: make(map[string]*domain.Session)}

	// Since we need to know the Staff Role, cache staff object during CreateSession via the tests
	mockStaffRepo.On("GetByID", mock.Anything).Return(func(id string) *domain.Staff {
		active := true
		for _, s := range fsr.sessions {
			if s.StaffID == id {
				return &domain.Staff{ID: id, Role: s.StaffRole, IsActive: &active}
			}
		}
		return &domain.Staff{ID: id, IsActive: &active}
	}, nil)

	authMiddleware := middleware.NewAuthMiddleware(log, rateLimiter, fsr, mockStaffRepo)

	mockFinanceRepo := new(mocks.FinanceRepository)
	mockSettingsRepo := new(mocks.SettingsRepository)
	mockStatsRepo := new(mocks.StatsRepository)
	mockShiftRepo := new(mocks.ShiftRepository)
	mockSupplierRepo := new(mocks.SupplierRepository)
	mockPORespo := new(mocks.PurchaseOrderRepository)

	productSvc := service.NewProductService(mockProductRepo, cache.NewProductCache(), log)
	saleSvc := service.NewSaleService(mockSaleRepo, mockProductRepo, mockCustomerRepo, cache.NewSaleCache(), log)
	customerSvc := service.NewCustomerService(mockCustomerRepo, cache.NewCustomerCache(), log)
	staffSvc := service.NewStaffService(mockStaffRepo, log)
	financeSvc := service.NewFinanceService(mockFinanceRepo, log)
	settingsSvc := service.NewSettingsService(mockSettingsRepo, newTestEncryptor(t), log)
	statsSvc := service.NewStatsService(mockStatsRepo, cache.NewDashboardCache(), log)
	shiftSvc := service.NewShiftService(mockShiftRepo, log)
	supplierSvc := service.NewSupplierService(mockSupplierRepo, log)
	poSvc := service.NewPurchaseOrderService(mockPORespo, mockProductRepo, log)
	auditSvc := audit.NewAuditService(nil, log)

	mockLoyaltyRepo := new(mocks.LoyaltyRepository)
	mockNotificationRepo := new(mocks.NotificationRepository)
	mockBranchRepo := new(mocks.BranchRepository)
	mockKitRepo := new(mocks.KitRepository)
	mockRecurringRepo := new(mocks.RecurringInvoiceRepository)
	mockGiftCardRepo := new(mocks.GiftCardRepository)
	mockKitchenRepo := new(mocks.KitchenRepository)
	mockWalletRepo := new(mocks.WalletRepository)
	mockStockAdjRepo := new(mocks.StockAdjustmentRepository)

	loyaltySvc := service.NewLoyaltyService(mockLoyaltyRepo, mockCustomerRepo, log)
	notificationSvc := service.NewNotificationService(mockNotificationRepo, log)
	branchSvc := service.NewBranchService(mockBranchRepo, log)
	kitSvc := service.NewKitService(mockKitRepo, log)
	recurringSvc := service.NewRecurringInvoiceService(mockRecurringRepo, log)
	analyticsSvc := service.NewAnalyticsService(mockSaleRepo, mockProductRepo, mockCustomerRepo, log)
	giftCardSvc := service.NewGiftCardService(mockGiftCardRepo, log)
	kitchenSvc := service.NewKitchenService(mockKitchenRepo, log)
	walletSvc := service.NewWalletService(mockWalletRepo, log)
	stockAdjSvc := service.NewStockAdjustmentService(mockStockAdjRepo, mockProductRepo, log)

	mockCurrencyRepo := new(mocks.CurrencyRepository)
	mockMessagingRepo := new(mocks.MessagingRepository)
	mockCommissionRepo := new(mocks.CommissionRepository)
	mockSegmentRepo := new(mocks.SegmentRepository)
	mockTaxRepo := new(mocks.TaxRepository)
	mockKioskRepo := new(mocks.KioskRepository)
	mockDeliveryRepo := new(mocks.DeliveryRepository)
	mockReorderRepo := new(mocks.ReorderRepository)
	mockBudgetRepo := new(mocks.BudgetRepository)
	mockReportBuilderRepo := new(mocks.ReportBuilderRepository)

	currencySvc := service.NewCurrencyService(mockCurrencyRepo, log)
	messagingSvc := service.NewMessagingService(mockMessagingRepo, log)
	commissionSvc := service.NewCommissionService(mockCommissionRepo, mockSaleRepo, log)
	campaignSvc := service.NewCampaignService(mockSegmentRepo, mockCustomerRepo, log)
	taxSvc := service.NewTaxService(mockTaxRepo, log)
	kioskSvc := service.NewKioskService(mockKioskRepo, log)
	deliverySvc := service.NewDeliveryService(mockDeliveryRepo, log)
	reorderSvc := service.NewReorderService(mockReorderRepo, mockProductRepo, log)
	budgetSvc := service.NewBudgetService(mockBudgetRepo, log)
	reportBuilderSvc := service.NewReportBuilderService(mockReportBuilderRepo, log)

	app := NewApp(
		productSvc, saleSvc, customerSvc, staffSvc, financeSvc,
		settingsSvc, statsSvc, shiftSvc, supplierSvc, poSvc,
		authMiddleware, rateLimiter, auditSvc, log,
		loyaltySvc, notificationSvc, branchSvc, kitSvc, recurringSvc,
		analyticsSvc, giftCardSvc, kitchenSvc, walletSvc, stockAdjSvc,
		currencySvc, messagingSvc, commissionSvc, campaignSvc, taxSvc,
		kioskSvc, deliverySvc, reorderSvc, budgetSvc, reportBuilderSvc,
	)

	return app, authMiddleware
}

func TestApp_checkPermission_NoSession(t *testing.T) {
	app, _ := newTestApp(t)

	err := app.checkPermission("nonexistent-token", middleware.PermCreateProduct)

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "UNAUTHORIZED", appErr.Code)
}

func TestApp_checkPermission_InsufficientRole(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	err := app.checkPermission(token, middleware.PermManageStaff)

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "FORBIDDEN", appErr.Code)
}

func TestApp_checkPermission_AdminHasAllPerms(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	admin := &domain.Staff{
		ID:       "staff-1",
		Username: "admin",
		Name:     "المدير",
		Role:     "admin",
	}
	token := authMiddleware.CreateSession(admin)

	perms := []string{
		middleware.PermCreateProduct,
		middleware.PermEditProduct,
		middleware.PermDeleteProduct,
		middleware.PermManageStaff,
		middleware.PermEditSettings,
		middleware.PermResetDatabase,
		middleware.PermExportReports,
	}

	for _, perm := range perms {
		err := app.checkPermission(token, perm)
		assert.NoError(t, err, "Admin should have permission: %s", perm)
	}
}

func TestApp_checkPermission_CashierLimitedPerms(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	allowed := []string{
		middleware.PermViewDashboard,
		middleware.PermViewSales,
		middleware.PermViewProducts,
		middleware.PermViewCustomers,
		middleware.PermCreateSale,
		middleware.PermCreateCustomer,
		middleware.PermEditCustomer,
	}

	for _, perm := range allowed {
		err := app.checkPermission(token, perm)
		assert.NoError(t, err, "Cashier should have permission: %s", perm)
	}

	denied := []string{
		middleware.PermManageStaff,
		middleware.PermEditSettings,
		middleware.PermDeleteProduct,
		middleware.PermDeleteSale,
		middleware.PermViewFinance,
	}

	for _, perm := range denied {
		err := app.checkPermission(token, perm)
		assert.Error(t, err, "Cashier should NOT have permission: %s", perm)
	}
}

func TestApp_checkPermission_ManagerHasBroadPerms(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	manager := &domain.Staff{
		ID:       "staff-1",
		Username: "manager1",
		Name:     "مدير",
		Role:     "manager",
	}
	token := authMiddleware.CreateSession(manager)

	allowed := []string{
		middleware.PermViewDashboard,
		middleware.PermViewFinance,
		middleware.PermDeleteProduct,
		middleware.PermDeleteSale,
		middleware.PermEditSettings,
		middleware.PermViewFullReport,
		middleware.PermExportReports,
	}

	for _, perm := range allowed {
		err := app.checkPermission(token, perm)
		assert.NoError(t, err, "Manager should have permission: %s", perm)
	}

	err := app.checkPermission(token, middleware.PermManageStaff)
	assert.Error(t, err, "Manager should NOT have manage:staff")
}

func TestApp_requireAdmin_RejectsNonAdmin(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	err := app.requireAdmin(token)

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "FORBIDDEN", appErr.Code)
}

func TestApp_requireAdmin_AcceptsAdmin(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	admin := &domain.Staff{
		ID:       "staff-1",
		Username: "admin",
		Name:     "المدير",
		Role:     "admin",
	}
	token := authMiddleware.CreateSession(admin)

	err := app.requireAdmin(token)

	assert.NoError(t, err)
}

func TestApp_requireAdmin_RejectsManager(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	manager := &domain.Staff{
		ID:       "staff-1",
		Username: "manager1",
		Name:     "مدير",
		Role:     "manager",
	}
	token := authMiddleware.CreateSession(manager)

	err := app.requireAdmin(token)

	assert.Error(t, err)
}

func TestApp_requireAdmin_RejectsNoSession(t *testing.T) {
	app, _ := newTestApp(t)

	err := app.requireAdmin("fake-token")

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "UNAUTHORIZED", appErr.Code)
}

func TestApp_CreateProduct_RequiresPermission(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	product := domain.Product{
		Name:    "Test Product",
		Barcode: "123456",
		Price:   100,
	}

	err := app.CreateProduct(token, product)

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "FORBIDDEN", appErr.Code)
}

func TestApp_DeleteProduct_RequiresPermission(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	err := app.DeleteProduct(token, "prod-1")

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "FORBIDDEN", appErr.Code)
}

func TestApp_GetStaff_RequiresManageStaff(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	result, err := app.GetStaff(token)

	assert.Error(t, err)
	assert.Nil(t, result)
}

func TestApp_ResetDatabase_RequiresAdmin(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	manager := &domain.Staff{
		ID:       "staff-1",
		Username: "manager1",
		Name:     "مدير",
		Role:     "manager",
	}
	token := authMiddleware.CreateSession(manager)

	err := app.ResetDatabase(token)

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "FORBIDDEN", appErr.Code)
}

func TestApp_ExportDatabase_RequiresExportPerm(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	result, err := app.ExportDatabase(token)

	assert.Error(t, err)
	assert.Nil(t, result)
}

func TestApp_ReceivePurchaseOrder_RequiresPerm(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	err := app.ReceivePurchaseOrder(token, "order-1")

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "FORBIDDEN", appErr.Code)
}

func TestApp_CreateExpense_RequiresFinancePerm(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	cashier := &domain.Staff{
		ID:       "staff-1",
		Username: "cashier1",
		Name:     "كاشير",
		Role:     "cashier",
	}
	token := authMiddleware.CreateSession(cashier)

	expense := domain.Expense{
		Title:  "Test Expense",
		Amount: 100,
	}

	err := app.CreateExpense(token, expense)

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.Equal(t, "FORBIDDEN", appErr.Code)
}

func TestMiddleware_RequirePermission_NilStaff(t *testing.T) {
	result := middleware.RequirePermission(nil, middleware.PermCreateProduct)
	assert.False(t, result)
}

func TestMiddleware_RequirePermission_UnknownRole(t *testing.T) {
	staff := &domain.Staff{
		ID:   "staff-1",
		Role: "unknown_role",
	}
	result := middleware.RequirePermission(staff, middleware.PermCreateProduct)
	assert.False(t, result)
}

func TestMiddleware_GetRolePermissions(t *testing.T) {
	adminPerms := middleware.GetRolePermissions("admin")
	assert.True(t, len(adminPerms) > len(middleware.GetRolePermissions("cashier")))

	cashierPerms := middleware.GetRolePermissions("cashier")
	assert.True(t, len(cashierPerms) > 0)

	unknownPerms := middleware.GetRolePermissions("unknown")
	assert.Equal(t, 0, len(unknownPerms))
}

func TestMiddleware_GetRolePermissions_CashierCannotManageStaff(t *testing.T) {
	cashierPerms := middleware.GetRolePermissions("cashier")
	for _, p := range cashierPerms {
		assert.NotEqual(t, middleware.PermManageStaff, p)
		assert.NotEqual(t, middleware.PermEditSettings, p)
		assert.NotEqual(t, middleware.PermResetDatabase, p)
	}
}

func TestApp_Login_RateLimiting(t *testing.T) {
	app, _ := newTestApp(t)

	mockStaffRepo := new(mocks.StaffRepository)
	app.staff = service.NewStaffService(mockStaffRepo, app.log)

	mockStaffRepo.On("Authenticate", "admin", "wrong").Return((*domain.Staff)(nil), &domain.AppError{
		Module: domain.ModuleStaff,
		Code:   "INVALID_CREDENTIALS",
	})

	for i := 0; i < 5; i++ {
		_, err := app.Login("admin", "wrong")
		assert.Error(t, err)
	}

	_, err := app.Login("admin", "wrong")

	assert.Error(t, err)
	appErr, ok := err.(*domain.AppError)
	assert.True(t, ok)
	assert.True(t, appErr.Code == "TOO_MANY_ATTEMPTS" || appErr.Code == "INVALID_CREDENTIALS", "Should be rate limited or invalid credentials")
}

func TestApp_Logout_DestroysSession(t *testing.T) {
	app, authMiddleware := newTestApp(t)

	admin := &domain.Staff{
		ID:       "staff-1",
		Username: "admin",
		Name:     "المدير",
		Role:     "admin",
	}
	token := authMiddleware.CreateSession(admin)

	staff, exists := authMiddleware.GetStaff(token)
	assert.True(t, exists)
	assert.NotNil(t, staff)

	err := app.Logout(token)
	assert.NoError(t, err)

	staff, exists = authMiddleware.GetStaff(token)
	assert.False(t, exists)
	assert.Nil(t, staff)
}
