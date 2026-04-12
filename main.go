package main

import (
	"embed"
	"os"
	"time"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"bard/internal/audit"
	"bard/internal/cache"
	"bard/internal/crypto"
	"bard/internal/handler"
	"bard/internal/logger"
	"bard/internal/middleware"
	"bard/internal/repository/sqlite"
	"bard/internal/service"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	appLogger := logger.New(logger.LevelInfo, true)
	defer appLogger.Close()

	db, err := sqlite.NewDatabase()
	if err != nil {
		appLogger.Error("Failed to initialize database", "error", err)
		os.Exit(1)
	}

	// Initialize cache instances
	dashboardCache := cache.NewDashboardCache()
	productCache := cache.NewProductCache()
	saleCache := cache.NewSaleCache()
	customerCache := cache.NewCustomerCache()

	// Use cache instances (suppress unused error for now)
	_ = dashboardCache

	// Initialize audit service
	auditSvc := audit.NewAuditService(appLogger)

	// Initialize crypto key manager
	keyManager, err := crypto.NewKeyManager()
	if err != nil {
		appLogger.Warn("Failed to initialize key manager, crypto disabled", "error", err)
	}
	encryptor := &crypto.Encryptor{}
	if keyManager != nil {
		key, err := keyManager.GetOrCreateKey()
		if err == nil {
			encryptor, err = crypto.NewEncryptor(key)
			if err != nil {
				appLogger.Warn("Failed to create encryptor", "error", err)
			}
		}
	}
	_ = encryptor

	productRepo := sqlite.NewProductRepository(db)
	saleRepo := sqlite.NewSaleRepository(db)
	customerRepo := sqlite.NewCustomerRepository(db)
	staffRepo := sqlite.NewStaffRepository(db)
	financeRepo := sqlite.NewFinanceRepository(db)
	settingsRepo := sqlite.NewSettingsRepository(db)
	statsRepo := sqlite.NewStatsRepository(db)

	shiftRepo := sqlite.NewShiftRepository(db)
	supplierRepo := sqlite.NewSupplierRepository(db)
	poRepo := sqlite.NewPurchaseOrderRepository(db)

	loyaltyRepo := sqlite.NewLoyaltyRepository(db)
	notificationRepo := sqlite.NewNotificationRepository(db)
	branchRepo := sqlite.NewBranchRepository(db)
	kitRepo := sqlite.NewKitRepository(db)
	recurringRepo := sqlite.NewRecurringInvoiceRepository(db)
	giftCardRepo := sqlite.NewGiftCardRepository(db)
	kitchenRepo := sqlite.NewKitchenRepository(db)
	walletRepo := sqlite.NewWalletRepository(db)
	stockAdjRepo := sqlite.NewStockAdjustmentRepository(db)

	currencyRepo := sqlite.NewCurrencyRepository(db)
	messagingRepo := sqlite.NewMessagingRepository(db)
	commissionRepo := sqlite.NewCommissionRepository(db)
	segmentRepo := sqlite.NewSegmentRepository(db)
	taxRepo := sqlite.NewTaxRepository(db)
	kioskRepo := sqlite.NewKioskRepository(db)
	deliveryRepo := sqlite.NewDeliveryRepository(db)
	reorderRepo := sqlite.NewReorderRepository(db)
	budgetRepo := sqlite.NewBudgetRepository(db)
	reportBuilderRepo := sqlite.NewReportBuilderRepository(db)

	rateLimiter := middleware.NewRateLimiter(5, 15*time.Minute, 30*time.Minute)
	authMiddleware := middleware.NewAuthMiddleware(appLogger, rateLimiter)

	productSvc := service.NewProductService(productRepo, productCache, appLogger)
	saleSvc := service.NewSaleService(saleRepo, productRepo, customerRepo, saleCache, appLogger)
	customerSvc := service.NewCustomerService(customerRepo, customerCache, appLogger)
	staffSvc := service.NewStaffService(staffRepo, appLogger)
	financeSvc := service.NewFinanceService(financeRepo, appLogger)
	settingsSvc := service.NewSettingsService(settingsRepo, appLogger)
	statsSvc := service.NewStatsService(statsRepo, appLogger)
	shiftSvc := service.NewShiftService(shiftRepo, appLogger)
	supplierSvc := service.NewSupplierService(supplierRepo, appLogger)
	poSvc := service.NewPurchaseOrderService(poRepo, productRepo, appLogger)

	loyaltySvc := service.NewLoyaltyService(loyaltyRepo, appLogger)
	notificationSvc := service.NewNotificationService(notificationRepo, appLogger)
	branchSvc := service.NewBranchService(branchRepo, appLogger)
	kitSvc := service.NewKitService(kitRepo, appLogger)
	recurringSvc := service.NewRecurringInvoiceService(recurringRepo, appLogger)
	analyticsSvc := service.NewAnalyticsService(saleRepo, productRepo, customerRepo, appLogger)
	giftCardSvc := service.NewGiftCardService(giftCardRepo, appLogger)
	kitchenSvc := service.NewKitchenService(kitchenRepo, appLogger)
	walletSvc := service.NewWalletService(walletRepo, appLogger)
	stockAdjSvc := service.NewStockAdjustmentService(stockAdjRepo, productRepo, appLogger)

	currencySvc := service.NewCurrencyService(currencyRepo, appLogger)
	messagingSvc := service.NewMessagingService(messagingRepo, appLogger)
	commissionSvc := service.NewCommissionService(commissionRepo, saleRepo, appLogger)
	campaignSvc := service.NewCampaignService(segmentRepo, customerRepo, appLogger)
	taxSvc := service.NewTaxService(taxRepo, appLogger)
	kioskSvc := service.NewKioskService(kioskRepo, appLogger)
	deliverySvc := service.NewDeliveryService(deliveryRepo, appLogger)
	reorderSvc := service.NewReorderService(reorderRepo, productRepo, appLogger)
	budgetSvc := service.NewBudgetService(budgetRepo, appLogger)
	reportBuilderSvc := service.NewReportBuilderService(reportBuilderRepo, appLogger)

	app := handler.NewApp(
		productSvc,
		saleSvc,
		customerSvc,
		staffSvc,
		financeSvc,
		settingsSvc,
		statsSvc,
		shiftSvc,
		supplierSvc,
		poSvc,
		authMiddleware,
		rateLimiter,
		auditSvc,
		appLogger,
		loyaltySvc,
		notificationSvc,
		branchSvc,
		kitSvc,
		recurringSvc,
		analyticsSvc,
		giftCardSvc,
		kitchenSvc,
		walletSvc,
		stockAdjSvc,
		currencySvc,
		messagingSvc,
		commissionSvc,
		campaignSvc,
		taxSvc,
		kioskSvc,
		deliverySvc,
		reorderSvc,
		budgetSvc,
		reportBuilderSvc,
	)

	err = wails.Run(&options.App{
		Title:     "Bard - POS System",
		Width:     1280,
		Height:    800,
		MinWidth:  1024,
		MinHeight: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 33, G: 33, B: 36, A: 255},
		OnStartup:        app.Startup,
		Frameless:        true,
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		appLogger.Error("Application error", "error", err)
	}
}
