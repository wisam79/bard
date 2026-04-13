package handler

import (
	"bard/internal/domain"
	"bard/internal/middleware"
)

func (a *App) GetBranches() ([]domain.Branch, error) {
	return a.branch.GetAll()
}

func (a *App) GetBranch(id string) (*domain.Branch, error) {
	return a.branch.GetByID(id)
}

func (a *App) CreateBranch(token string, branch domain.Branch) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.branch.Create(&branch)
}

func (a *App) UpdateBranch(token string, branch domain.Branch) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.branch.Update(&branch)
}

func (a *App) DeleteBranch(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.branch.Delete(id)
}

func (a *App) GetRecurringInvoices(page, limit int, status string) ([]domain.RecurringInvoice, int64, error) {
	return a.recurring.GetAll(page, limit, status)
}

func (a *App) GetRecurringInvoice(id string) (*domain.RecurringInvoice, error) {
	return a.recurring.GetByID(id)
}

func (a *App) CreateRecurringInvoice(token string, invoice domain.RecurringInvoice) error {
	if err := a.checkPermission(token, middleware.PermCreateProduct); err != nil {
		return err
	}
	return a.recurring.Create(&invoice)
}

func (a *App) UpdateRecurringInvoice(token string, invoice domain.RecurringInvoice) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.recurring.Update(&invoice)
}

func (a *App) DeleteRecurringInvoice(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermDeleteSale); err != nil {
		return err
	}
	return a.recurring.Delete(id)
}

func (a *App) PauseRecurringInvoice(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.recurring.Pause(id)
}

func (a *App) ResumeRecurringInvoice(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.recurring.Resume(id)
}

func (a *App) GetReorderRules() ([]domain.ReorderRule, error) {
	return a.reorder.GetRules()
}

func (a *App) CreateReorderRule(token string, rule domain.ReorderRule) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.reorder.CreateRule(&rule)
}

func (a *App) UpdateReorderRule(token string, rule domain.ReorderRule) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.reorder.UpdateRule(&rule)
}

func (a *App) DeleteReorderRule(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditProduct); err != nil {
		return err
	}
	return a.reorder.DeleteRule(id)
}

func (a *App) GetReorderAlerts() ([]domain.ReorderAlert, error) {
	return a.reorder.GetAlerts()
}

func (a *App) AutoReorder(token string) (int, error) {
	if err := a.requireAdmin(token); err != nil {
		return 0, err
	}
	return a.reorder.AutoReorder()
}

func (a *App) GetBudgets() ([]domain.Budget, error) {
	return a.budget.GetBudgets()
}

func (a *App) CreateBudget(token string, budget domain.Budget) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.CreateBudget(&budget)
}

func (a *App) UpdateBudget(token string, budget domain.Budget) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.UpdateBudget(&budget)
}

func (a *App) DeleteBudget(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.budget.DeleteBudget(id)
}

func (a *App) CheckBudgetLimit(category string, amount float64) (bool, float64, error) {
	return a.budget.CheckBudgetLimit(category, amount)
}

func (a *App) GetReportTemplates() ([]domain.ReportTemplate, error) {
	return a.reportBuilder.GetTemplates()
}

func (a *App) GetReportTemplate(id string) (*domain.ReportTemplate, error) {
	return a.reportBuilder.GetTemplateByID(id)
}

func (a *App) CreateReportTemplate(token string, template domain.ReportTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.reportBuilder.CreateTemplate(&template)
}

func (a *App) UpdateReportTemplate(token string, template domain.ReportTemplate) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.reportBuilder.UpdateTemplate(&template)
}

func (a *App) DeleteReportTemplate(token string, id string) error {
	if err := a.checkPermission(token, middleware.PermEditSettings); err != nil {
		return err
	}
	return a.reportBuilder.DeleteTemplate(id)
}

func (a *App) GenerateReport(templateID string) (interface{}, error) {
	return a.reportBuilder.GenerateReport(templateID)
}

func (a *App) GetScheduledExports() ([]domain.ScheduledExport, error) {
	return a.reportBuilder.GetScheduledExports()
}

func (a *App) CreateScheduledExport(token string, export domain.ScheduledExport) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.reportBuilder.CreateScheduledExport(&export)
}

func (a *App) UpdateScheduledExport(token string, export domain.ScheduledExport) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.reportBuilder.UpdateScheduledExport(&export)
}

func (a *App) DeleteScheduledExport(token string, id string) error {
	if err := a.requireAdmin(token); err != nil {
		return err
	}
	return a.reportBuilder.DeleteScheduledExport(id)
}
