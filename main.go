package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"bard/internal/handler"
	"bard/internal/logger"
	"bard/internal/repository/sqlite"
	"bard/internal/service"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	appLogger := logger.New(logger.LevelInfo, true)

	db, err := sqlite.NewDatabase()
	if err != nil {
		appLogger.Fatal("Failed to initialize database", "error", err)
		return
	}

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

	productSvc := service.NewProductService(productRepo, appLogger)
	saleSvc := service.NewSaleService(db, saleRepo, productRepo, customerRepo, appLogger)
	customerSvc := service.NewCustomerService(customerRepo, appLogger)
	staffSvc := service.NewStaffService(staffRepo, appLogger)
	financeSvc := service.NewFinanceService(financeRepo, appLogger)
	settingsSvc := service.NewSettingsService(settingsRepo, appLogger)
	statsSvc := service.NewStatsService(statsRepo, appLogger)
	shiftSvc := service.NewShiftService(shiftRepo, appLogger)
	supplierSvc := service.NewSupplierService(supplierRepo, appLogger)
	poSvc := service.NewPurchaseOrderService(poRepo, productRepo, appLogger)

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
		appLogger,
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
		appLogger.Fatal("Application error", "error", err)
	}
}
