package handler

import (
	"bard/internal/audit"
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/middleware"
	"bard/internal/service"
	"context"
	"fmt"
)

type App struct {
	ctx             context.Context
	products        *service.ProductService
	sales           *service.SaleService
	customers       *service.CustomerService
	staff           *service.StaffService
	finance         *service.FinanceService
	settings        *service.SettingsService
	stats           *service.StatsService
	shifts          *service.ShiftService
	suppliers       *service.SupplierService
	purchaseOrders  *service.PurchaseOrderService
	authMiddleware  *middleware.AuthMiddleware
	rateLimiter     *middleware.RateLimiter
	audit           *audit.AuditService
	log             *logger.Logger
	loyalty         *service.LoyaltyService
	notification    *service.NotificationService
	branch          *service.BranchService
	kit             *service.KitService
	recurring       *service.RecurringInvoiceService
	analytics       *service.AnalyticsService
	giftCard        *service.GiftCardService
	kitchen         *service.KitchenService
	wallet          *service.WalletService
	stockAdjustment *service.StockAdjustmentService
	currency        *service.CurrencyService
	messaging       *service.MessagingService
	commission      *service.CommissionService
	campaign        *service.CampaignService
	tax             *service.TaxService
	kiosk           *service.KioskService
	delivery        *service.DeliveryService
	reorder         *service.ReorderService
	budget          *service.BudgetService
	reportBuilder   *service.ReportBuilderService
}

func NewApp(
	products *service.ProductService,
	sales *service.SaleService,
	customers *service.CustomerService,
	staff *service.StaffService,
	finance *service.FinanceService,
	settings *service.SettingsService,
	stats *service.StatsService,
	shifts *service.ShiftService,
	suppliers *service.SupplierService,
	purchaseOrders *service.PurchaseOrderService,
	authMiddleware *middleware.AuthMiddleware,
	rateLimiter *middleware.RateLimiter,
	audit *audit.AuditService,
	log *logger.Logger,
	loyalty *service.LoyaltyService,
	notification *service.NotificationService,
	branch *service.BranchService,
	kit *service.KitService,
	recurring *service.RecurringInvoiceService,
	analytics *service.AnalyticsService,
	giftCard *service.GiftCardService,
	kitchen *service.KitchenService,
	wallet *service.WalletService,
	stockAdjustment *service.StockAdjustmentService,
	currency *service.CurrencyService,
	messaging *service.MessagingService,
	commission *service.CommissionService,
	campaign *service.CampaignService,
	tax *service.TaxService,
	kiosk *service.KioskService,
	delivery *service.DeliveryService,
	reorder *service.ReorderService,
	budget *service.BudgetService,
	reportBuilder *service.ReportBuilderService,
) *App {
	return &App{
		products:        products,
		sales:           sales,
		customers:       customers,
		staff:           staff,
		finance:         finance,
		settings:        settings,
		stats:           stats,
		shifts:          shifts,
		suppliers:       suppliers,
		purchaseOrders:  purchaseOrders,
		authMiddleware:  authMiddleware,
		rateLimiter:     rateLimiter,
		audit:           audit,
		log:             log,
		loyalty:         loyalty,
		notification:    notification,
		branch:          branch,
		kit:             kit,
		recurring:       recurring,
		analytics:       analytics,
		giftCard:        giftCard,
		kitchen:         kitchen,
		wallet:          wallet,
		stockAdjustment: stockAdjustment,
		currency:        currency,
		messaging:       messaging,
		commission:      commission,
		campaign:        campaign,
		tax:             tax,
		kiosk:           kiosk,
		delivery:        delivery,
		reorder:         reorder,
		budget:          budget,
		reportBuilder:   reportBuilder,
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.log.Info("Application started")
}

func (a *App) checkPermission(token, permission string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "UNAUTHORIZED",
			Message: "لم يتم تسجيل الدخول",
		}
	}
	if !middleware.RequirePermission(staff, permission) {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "FORBIDDEN",
			Message: fmt.Sprintf("صلاحية مطلوبة: %s", permission),
		}
	}
	return nil
}

func (a *App) requireAdmin(token string) error {
	staff, ok := a.authMiddleware.GetStaff(token)
	if !ok {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "UNAUTHORIZED",
			Message: "لم يتم تسجيل الدخول",
		}
	}
	if staff.Role != "admin" {
		return &domain.AppError{
			Module:  domain.ModuleStaff,
			Code:    "FORBIDDEN",
			Message: "هذه العملية تتطلب صلاحيات المدير",
		}
	}
	return nil
}
