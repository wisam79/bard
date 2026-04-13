package sqlite

import (
	"log/slog"
	"os"
	"path/filepath"
	"time"

	"bard/internal/audit"
	"bard/internal/domain"
	migration "bard/migrations"
	"bard/pkg/utils"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func boolPtr(b bool) *bool { return &b }

// NewDatabase creates and initializes the database
func NewDatabase() (*gorm.DB, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}

	appDir := filepath.Join(configDir, "BardPOS")
	if err := os.MkdirAll(appDir, 0700); err != nil {
		return nil, err
	}

	dbPath := filepath.Join(appDir, "bard.db")

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.Exec("PRAGMA journal_mode=WAL;")
	sqlDB.Exec("PRAGMA busy_timeout=5000;")
	sqlDB.Exec("PRAGMA foreign_keys=ON;")

	// Run versioned migrations (goose) for schema changes.
	// AutoMigrate is kept temporarily for backward compatibility during transition.
	// Once all schema changes go through goose, AutoMigrate can be removed.
	migRunner := migration.NewRunner(sqlDB, slog.Default())
	if err := migRunner.Up(); err != nil {
		// Non-fatal: log and continue with AutoMigrate as fallback
		slog.Warn("Goose migration failed, falling back to AutoMigrate", "error", err)
	}

	// Auto migrate all models
	err = db.AutoMigrate(
		&domain.Product{},
		&domain.Sale{},
		&domain.SaleItem{},
		&domain.Customer{},
		&domain.Supplier{},
		&domain.Expense{},
		&domain.Payment{},
		&domain.Category{},
		&domain.StockMovement{},
		&domain.AppPreferences{},
		&domain.Discount{},
		&domain.Staff{},
		&audit.AuditLog{},
		&domain.ActivityLog{},
		&domain.SecurityLog{},
		&domain.ParkedSale{},
		&domain.Shift{},
		&domain.CashMovement{},
		&domain.LoginAttempt{},
		&domain.PurchaseOrder{},
		&domain.PurchaseOrderItem{},
		&domain.LoyaltyTier{},
		&domain.LoyaltyRule{},
		&domain.LoyaltyTransaction{},
		&domain.LoyaltyRedemption{},
		&domain.NotificationTemplate{},
		&domain.NotificationLog{},
		&domain.NotificationSettings{},
		&domain.Branch{},
		&domain.StockTransfer{},
		&domain.StockTransferItem{},
		&domain.ProductKit{},
		&domain.ProductKitItem{},
		&domain.RecurringInvoice{},
		&domain.RecurringInvoiceItem{},
		&domain.GiftCard{},
		&domain.GiftCardTransaction{},
		&domain.Voucher{},
		&domain.KitchenOrder{},
		&domain.KitchenOrderItem{},
		&domain.KitchenStation{},
		&domain.CustomerWallet{},
		&domain.WalletTransaction{},
		&domain.StockAdjustment{},
		&domain.WasteRecord{},
		&domain.Currency{},
		&domain.CurrencyTransaction{},
		&domain.MessagingProvider{},
		&domain.MessageTemplate{},
		&domain.MessageLog{},
		&domain.CommissionRule{},
		&domain.CommissionPayment{},
		&domain.CustomerSegment{},
		&domain.CustomerSegmentMember{},
		&domain.Campaign{},
		&domain.TaxRate{},
		&domain.ProductTax{},
		&domain.KioskLayout{},
		&domain.KioskSession{},
		&domain.DeliveryDriver{},
		&domain.DeliveryOrder{},
		&domain.ReorderRule{},
		&domain.Budget{},
		&domain.ExpenseApproval{},
		&domain.ApprovalWorkflow{},
		&domain.ReportTemplate{},
		&domain.ScheduledExport{},
	)
	if err != nil {
		return nil, err
	}

	// Add composite indexes for performance
	if sqlDB != nil {
		indexes := []string{
			"CREATE INDEX IF NOT EXISTS idx_sale_items_sale_product ON sale_items(sale_id, product_id)",
			"CREATE INDEX IF NOT EXISTS idx_sales_date_status ON sales(date, status)",
			"CREATE INDEX IF NOT EXISTS idx_products_category_name ON products(category, name)",
			"CREATE INDEX IF NOT EXISTS idx_sales_customer_status ON sales(customer_id, status)",
			"CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id)",
		}
		for _, idx := range indexes {
			sqlDB.Exec(idx)
		}
	}

	// Seed default preferences
	var prefs domain.AppPreferences
	if result := db.First(&prefs); result.Error != nil {
		defaultPrefs := domain.AppPreferences{
			StoreName:        "Bard",
			Currency:         "د.ع",
			Theme:            "dark",
			Language:         "ar",
			FontSize:         "medium",
			LowStockTrigger:  5,
			EnableSound:      true,
			AutoPrint:        false,
			AutoPrintFormat:  "thermal",
			ThermalPaperSize: "80mm",
		}
		if err := db.Create(&defaultPrefs).Error; err != nil {
			return nil, err
		}
	}

	// Seed default admin user
	var adminCount int64
	db.Model(&domain.Staff{}).Count(&adminCount)
	if adminCount == 0 {
		hashedPassword, err := utils.HashPassword("admin")
		if err != nil {
			return nil, err
		}
		defaultAdmin := domain.Staff{
			ID:                 uuid.New().String(),
			Username:           "admin",
			Password:           hashedPassword,
			Name:               "المدير",
			Role:               "admin",
			IsActive: boolPtr(true),
			MustChangePassword: true,
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}
		if err := db.Create(&defaultAdmin).Error; err != nil {
			return nil, err
		}
	}

	// Seed demo products (only if no products exist)
	var productCount int64
	db.Model(&domain.Product{}).Count(&productCount)
	if productCount == 0 {
		now := time.Now()
		demoProducts := []domain.Product{
			// ── Beverages ──
			{ID: uuid.New().String(), Name: "قهوة تركية 200 غ", Barcode: "1000001", Price: 5000, Cost: 3000, Stock: 45, MinStock: 10, Category: "مشروبات", WholesalePrice: 4000, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "نسكافيه جولد 100 غ", Barcode: "1000002", Price: 8500, Cost: 6000, Stock: 30, MinStock: 5, Category: "مشروبات", WholesalePrice: 7000, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "شاي ربيع 100 كيس", Barcode: "1000003", Price: 3000, Cost: 1800, Stock: 60, MinStock: 10, Category: "مشروبات", WholesalePrice: 2500, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "بيبسي 330 مل", Barcode: "1000004", Price: 500, Cost: 300, Stock: 200, MinStock: 50, Category: "مشروبات", WholesalePrice: 400, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "عصير راني مانجو 1 لتر", Barcode: "1000005", Price: 1500, Cost: 900, Stock: 40, MinStock: 10, Category: "مشروبات", WholesalePrice: 1200, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "ماء صحي 500 مل", Barcode: "1000006", Price: 250, Cost: 100, Stock: 500, MinStock: 100, Category: "مشروبات", WholesalePrice: 150, CreatedAt: now, UpdatedAt: now},
			// ── Snacks ──
			{ID: uuid.New().String(), Name: "شيبس ليز كلاسيك", Barcode: "2000001", Price: 750, Cost: 450, Stock: 80, MinStock: 20, Category: "مأكولات", WholesalePrice: 600, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "شوكولاتة كيت كات", Barcode: "2000002", Price: 1000, Cost: 650, Stock: 55, MinStock: 15, Category: "حلويات", WholesalePrice: 800, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "كيك لاير شوكو", Barcode: "2000003", Price: 1500, Cost: 900, Stock: 25, MinStock: 5, Category: "حلويات", WholesalePrice: 1200, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "بسكويت اوريو", Barcode: "2000004", Price: 1250, Cost: 750, Stock: 70, MinStock: 15, Category: "حلويات", WholesalePrice: 1000, CreatedAt: now, UpdatedAt: now},
			// ── Dairy ──
			{ID: uuid.New().String(), Name: "حليب كامل الدسم 1 لتر", Barcode: "3000001", Price: 1500, Cost: 1000, Stock: 35, MinStock: 10, Category: "ألبان", WholesalePrice: 1200, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "جبنة كرافت شرائح", Barcode: "3000002", Price: 3500, Cost: 2200, Stock: 20, MinStock: 5, Category: "ألبان", WholesalePrice: 2800, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "بيض طازج 30 حبة", Barcode: "3000003", Price: 7500, Cost: 5500, Stock: 15, MinStock: 5, Category: "ألبان", WholesalePrice: 6500, CreatedAt: now, UpdatedAt: now},
			// ── Staples ──
			{ID: uuid.New().String(), Name: "تمن عنبر عراقي 10 كغ", Barcode: "4000001", Price: 25000, Cost: 18000, Stock: 20, MinStock: 5, Category: "مواد غذائية", WholesalePrice: 22000, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "زيت زيتون 1 لتر", Barcode: "4000002", Price: 12000, Cost: 8500, Stock: 18, MinStock: 5, Category: "مواد غذائية", WholesalePrice: 10000, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "معجون طماطم 400 غ", Barcode: "4000003", Price: 1500, Cost: 900, Stock: 50, MinStock: 10, Category: "مواد غذائية", WholesalePrice: 1200, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "سكر أبيض 1 كغ", Barcode: "4000004", Price: 2000, Cost: 1400, Stock: 40, MinStock: 10, Category: "مواد غذائية", WholesalePrice: 1700, CreatedAt: now, UpdatedAt: now},
			// ── Electronics ──
			{ID: uuid.New().String(), Name: "شاحن ايفون تايب سي", Barcode: "5000001", Price: 15000, Cost: 8000, Stock: 12, MinStock: 3, Category: "إلكترونيات", WholesalePrice: 11000, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "سماعات بلوتوث لاسلكية", Barcode: "5000002", Price: 25000, Cost: 14000, Stock: 8, MinStock: 3, Category: "إلكترونيات", WholesalePrice: 20000, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "باور بانك 10000 أمبير", Barcode: "5000003", Price: 20000, Cost: 12000, Stock: 10, MinStock: 3, Category: "إلكترونيات", WholesalePrice: 16000, CreatedAt: now, UpdatedAt: now},
			// ── Cleaning ──
			{ID: uuid.New().String(), Name: "صابون سائل فيري", Barcode: "6000001", Price: 3500, Cost: 2200, Stock: 30, MinStock: 10, Category: "تنظيف", WholesalePrice: 2800, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "مسحوق غسيل تايد 3 كغ", Barcode: "6000002", Price: 8000, Cost: 5500, Stock: 15, MinStock: 5, Category: "تنظيف", WholesalePrice: 6500, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "كلينكس مناديل 200 ورقة", Barcode: "6000003", Price: 2000, Cost: 1200, Stock: 45, MinStock: 10, Category: "تنظيف", WholesalePrice: 1500, CreatedAt: now, UpdatedAt: now},
			// ── Personal Care ──
			{ID: uuid.New().String(), Name: "شامبو هيد اند شولدرز", Barcode: "7000001", Price: 6000, Cost: 3800, Stock: 25, MinStock: 5, Category: "عناية شخصية", WholesalePrice: 5000, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "معجون اسنان كولجيت", Barcode: "7000002", Price: 2500, Cost: 1500, Stock: 40, MinStock: 10, Category: "عناية شخصية", WholesalePrice: 2000, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "عطر بودي سبراي", Barcode: "7000003", Price: 5000, Cost: 2500, Stock: 18, MinStock: 5, Category: "عناية شخصية", WholesalePrice: 3500, CreatedAt: now, UpdatedAt: now},
			// ── Health ──
			{ID: uuid.New().String(), Name: "بنادول أزرق 24 حبة", Barcode: "8000001", Price: 3000, Cost: 1800, Stock: 50, MinStock: 15, Category: "صحة", WholesalePrice: 2500, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "حفاضات بامبرز حجم 4", Barcode: "8000002", Price: 18000, Cost: 12000, Stock: 10, MinStock: 3, Category: "صحة", WholesalePrice: 15000, CreatedAt: now, UpdatedAt: now},
			// ── Stationery ──
			{ID: uuid.New().String(), Name: "دفتر مسطر 100 ورقة", Barcode: "9000001", Price: 1500, Cost: 800, Stock: 60, MinStock: 15, Category: "قرطاسية", WholesalePrice: 1100, CreatedAt: now, UpdatedAt: now},
			{ID: uuid.New().String(), Name: "قلم حبر جاف أزرق", Barcode: "9000002", Price: 500, Cost: 200, Stock: 100, MinStock: 30, Category: "قرطاسية", WholesalePrice: 350, CreatedAt: now, UpdatedAt: now},
		}
		for _, p := range demoProducts {
			db.Create(&p)
		}
	}

	return db, nil
}
