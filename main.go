package main

import (
	"embed"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"bard/internal/di"
	"bard/internal/logger"
	"bard/internal/repository/sqlite"
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

	app, cleanup, err := di.InitializeApp(db)
	if err != nil {
		appLogger.Error("Failed to initialize app components", "error", err)
		os.Exit(1)
	}
	defer cleanup()

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
