//go:build wireinject
// +build wireinject

// Package di provides dependency injection wiring using google/wire.
//
// This package defines provider sets that group related dependencies
// and an injector function that wire uses to generate the initialization code.
//
// Usage:
//   1. Install wire: go install github.com/google/wire/cmd/wire@latest
//   2. Generate code: cd internal/di && wire
//   3. Use InitializeApp() in main.go instead of manual wiring
package di

import (
	"bard/internal/audit"
	"bard/internal/cache"
	"bard/internal/crypto"
	"bard/internal/handler"
	"bard/internal/logger"
	"bard/internal/middleware"
	"bard/internal/repository"
	"bard/internal/repository/sqlite"
	"bard/internal/service"
	"time"

	"github.com/google/wire"
	"gorm.io/gorm"
)

// ─── Provider Functions ─────────────────────────────────────────────────────

// ProvideLogger creates a new application logger.
func ProvideLogger() *logger.Logger {
	return logger.New(logger.LevelInfo, true)
}

// ProvideCaches creates all cache instances.
func ProvideDashboardCache() *cache.DashboardCache { return cache.NewDashboardCache() }
func ProvideProductCache() *cache.ProductCache     { return cache.NewProductCache() }
func ProvideSaleCache() *cache.SaleCache           { return cache.NewSaleCache() }
func ProvideCustomerCache() *cache.CustomerCache   { return cache.NewCustomerCache() }

// ProvideRateLimiter creates the rate limiter middleware.
func ProvideRateLimiter() *middleware.RateLimiter {
	return middleware.NewRateLimiter(5, 15*time.Minute, 30*time.Minute)
}

// ProvideAuthMiddleware creates the authentication middleware.
func ProvideAuthMiddleware(log *logger.Logger, rl *middleware.RateLimiter, sessionRepo repository.SessionRepository, staffRepo repository.StaffRepository) *middleware.AuthMiddleware {
	return middleware.NewAuthMiddleware(log, rl, sessionRepo, staffRepo)
}

// ProvideEncryptor creates the encryption service.
func ProvideEncryptor() *crypto.Encryptor {
	km, err := crypto.NewKeyManager()
	if err != nil {
		return &crypto.Encryptor{}
	}
	key, err := km.GetOrCreateKey()
	if err != nil {
		return &crypto.Encryptor{}
	}
	enc, err := crypto.NewEncryptor(key)
	if err != nil {
		return &crypto.Encryptor{}
	}
	crypto.GlobalEncryptor = enc
	return enc
}

// ─── Wire Provider Sets ─────────────────────────────────────────────────────

// InfrastructureSet groups infrastructure providers (logging, caching, middleware).
var InfrastructureSet = wire.NewSet(
	ProvideLogger,
	ProvideDashboardCache,
	ProvideProductCache,
	ProvideSaleCache,
	ProvideCustomerCache,
	ProvideRateLimiter,
	ProvideAuthMiddleware,
	ProvideEncryptor,
)

// RepositorySet groups all repository providers.
var RepositorySet = wire.NewSet(sqlite.NewProductRepository, sqlite.NewSaleRepository, sqlite.NewCustomerRepository, sqlite.NewStaffRepository, sqlite.NewFinanceRepository, sqlite.NewSettingsRepository, sqlite.NewStatsRepository, sqlite.NewShiftRepository, sqlite.NewSupplierRepository, sqlite.NewPurchaseOrderRepository, sqlite.NewLoyaltyRepository, sqlite.NewNotificationRepository, sqlite.NewBranchRepository, sqlite.NewKitRepository, sqlite.NewRecurringInvoiceRepository, sqlite.NewGiftCardRepository, sqlite.NewKitchenRepository, sqlite.NewWalletRepository, sqlite.NewStockAdjustmentRepository, sqlite.NewCurrencyRepository, sqlite.NewMessagingRepository, sqlite.NewCommissionRepository, sqlite.NewSegmentRepository, sqlite.NewTaxRepository, sqlite.NewKioskRepository, sqlite.NewDeliveryRepository, sqlite.NewReorderRepository, sqlite.NewBudgetRepository, sqlite.NewReportBuilderRepository, sqlite.NewAuditRepository, sqlite.NewSessionRepository)

// ServiceSet groups all service providers.
var ServiceSet = wire.NewSet(
	service.NewProductService,
	service.NewSaleService,
	service.NewCustomerService,
	service.NewStaffService,
	service.NewFinanceService,
	service.NewSettingsService,
	service.NewStatsService,
	service.NewShiftService,
	service.NewSupplierService,
	service.NewPurchaseOrderService,
	service.NewLoyaltyService,
	service.NewNotificationService,
	service.NewBranchService,
	service.NewKitService,
	service.NewRecurringInvoiceService,
	service.NewAnalyticsService,
	service.NewGiftCardService,
	service.NewKitchenService,
	service.NewWalletService,
	service.NewStockAdjustmentService,
	service.NewCurrencyService,
	service.NewMessagingService,
	service.NewCommissionService,
	service.NewCampaignService,
	service.NewTaxService,
	service.NewKioskService,
	service.NewDeliveryService,
	service.NewReorderService,
	service.NewBudgetService,
	service.NewReportBuilderService,
	audit.NewAuditService,
)

// AppSet groups everything needed to build the handler.App.
var AppSet = wire.NewSet(
	InfrastructureSet,
	RepositorySet,
	ServiceSet,
	handler.NewApp,
)

// ─── Injector (wire generates implementation) ──────────────────────────────

// InitializeApp builds and returns a fully wired handler.App.
// Wire will generate the actual implementation in wire_gen.go.
func InitializeApp(db *gorm.DB) (*handler.App, func(), error) {
	wire.Build(AppSet)
	return nil, nil, nil
}
