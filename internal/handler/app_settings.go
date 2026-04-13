package handler

import (
	"bard/internal/audit"
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetDashboardStats() (*domain.DashboardStats, error) {
	return a.stats.GetDashboardStats()
}

func (a *App) GetPreferences() (*domain.AppPreferences, error) {
	return a.settings.GetPreferences()
}

func (a *App) UpdatePreferences(token string, prefs domain.AppPreferences) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.settings.UpdatePreferences(&prefs)
}

func (a *App) ResetDatabase(token string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	if staff, ok := a.authMiddleware.GetStaff(token); ok {
		a.audit.LogSensitiveAction(a.ctx, audit.ActionBackup, audit.EntitySettings, "reset", staff.ID, staff.Name, "Database reset")
	}
	a.log.Warn("Database reset by admin")
	err := a.settings.ResetDatabase()
	if err == nil {
		// Invalidate all caches
	}
	return err
}

func (a *App) ExportDatabase(token string) (*domain.DatabaseExport, error) {
	if err := a.checkPermission(token, middleware.PermExportReports); err != nil {
		return nil, err
	}
	return a.settings.ExportDatabase()
}

func (a *App) ImportDatabase(token string, data domain.DatabaseExport) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	a.log.Warn("Database import by admin")
	return a.settings.ImportDatabase(&data)
}
