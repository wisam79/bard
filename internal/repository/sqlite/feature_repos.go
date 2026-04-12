package sqlite

import (
	"bard/internal/domain"
	"bard/internal/repository"

	"gorm.io/gorm"
)

type currencyRepository struct {
	db *gorm.DB
}

func NewCurrencyRepository(db *gorm.DB) repository.CurrencyRepository {
	return &currencyRepository{db: db}
}

func (r *currencyRepository) GetAll() ([]domain.Currency, error) {
	var currencies []domain.Currency
	err := r.db.Where("is_active = ?", true).Order("code ASC").Find(&currencies).Error
	return currencies, err
}

func (r *currencyRepository) GetByID(id string) (*domain.Currency, error) {
	var c domain.Currency
	if err := r.db.First(&c, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "currency")
	}
	return &c, nil
}

func (r *currencyRepository) GetByCode(code string) (*domain.Currency, error) {
	var c domain.Currency
	if err := r.db.Where("code = ?", code).First(&c).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "currency")
	}
	return &c, nil
}

func (r *currencyRepository) Create(currency *domain.Currency) error {
	return r.db.Create(currency).Error
}

func (r *currencyRepository) Update(currency *domain.Currency) error {
	return r.db.Save(currency).Error
}

func (r *currencyRepository) Delete(id string) error {
	return r.db.Delete(&domain.Currency{}, "id = ?", id).Error
}

func (r *currencyRepository) CreateTransaction(tx *domain.CurrencyTransaction) error {
	return r.db.Create(tx).Error
}

func (r *currencyRepository) GetTransactions(saleID string) ([]domain.CurrencyTransaction, error) {
	var txs []domain.CurrencyTransaction
	err := r.db.Where("sale_id = ?", saleID).Order("timestamp DESC").Find(&txs).Error
	return txs, err
}

func (r *currencyRepository) GetBaseCurrency() (*domain.Currency, error) {
	var c domain.Currency
	if err := r.db.Where("is_base = ?", true).First(&c).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "currency")
	}
	return &c, nil
}

type messagingRepository struct {
	db *gorm.DB
}

func NewMessagingRepository(db *gorm.DB) repository.MessagingRepository {
	return &messagingRepository{db: db}
}

func (r *messagingRepository) GetProviders() ([]domain.MessagingProvider, error) {
	var providers []domain.MessagingProvider
	err := r.db.Order("name ASC").Find(&providers).Error
	return providers, err
}

func (r *messagingRepository) GetProviderByID(id string) (*domain.MessagingProvider, error) {
	var p domain.MessagingProvider
	if err := r.db.First(&p, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSettings, "messaging_provider")
	}
	return &p, nil
}

func (r *messagingRepository) CreateProvider(p *domain.MessagingProvider) error {
	return r.db.Create(p).Error
}

func (r *messagingRepository) UpdateProvider(p *domain.MessagingProvider) error {
	return r.db.Save(p).Error
}

func (r *messagingRepository) DeleteProvider(id string) error {
	return r.db.Delete(&domain.MessagingProvider{}, "id = ?", id).Error
}

func (r *messagingRepository) GetTemplates() ([]domain.MessageTemplate, error) {
	var templates []domain.MessageTemplate
	err := r.db.Order("name ASC").Find(&templates).Error
	return templates, err
}

func (r *messagingRepository) CreateTemplate(t *domain.MessageTemplate) error {
	return r.db.Create(t).Error
}

func (r *messagingRepository) UpdateTemplate(t *domain.MessageTemplate) error {
	return r.db.Save(t).Error
}

func (r *messagingRepository) DeleteTemplate(id string) error {
	return r.db.Delete(&domain.MessageTemplate{}, "id = ?", id).Error
}

func (r *messagingRepository) CreateLog(log *domain.MessageLog) error {
	return r.db.Create(log).Error
}

func (r *messagingRepository) GetLogs(page, limit int) ([]domain.MessageLog, int64, error) {
	var logs []domain.MessageLog
	var total int64
	r.db.Model(&domain.MessageLog{}).Count(&total)
	offset := (page - 1) * limit
	err := r.db.Offset(offset).Limit(limit).Order("timestamp DESC").Find(&logs).Error
	return logs, total, err
}

type commissionRepository struct {
	db *gorm.DB
}

func NewCommissionRepository(db *gorm.DB) repository.CommissionRepository {
	return &commissionRepository{db: db}
}

func (r *commissionRepository) GetRules() ([]domain.CommissionRule, error) {
	var rules []domain.CommissionRule
	err := r.db.Order("name ASC").Find(&rules).Error
	return rules, err
}

func (r *commissionRepository) GetRuleByID(id string) (*domain.CommissionRule, error) {
	var rule domain.CommissionRule
	if err := r.db.First(&rule, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleStaff, "commission_rule")
	}
	return &rule, nil
}

func (r *commissionRepository) CreateRule(rule *domain.CommissionRule) error {
	return r.db.Create(rule).Error
}

func (r *commissionRepository) UpdateRule(rule *domain.CommissionRule) error {
	return r.db.Save(rule).Error
}

func (r *commissionRepository) DeleteRule(id string) error {
	return r.db.Delete(&domain.CommissionRule{}, "id = ?", id).Error
}

func (r *commissionRepository) CreatePayment(payment *domain.CommissionPayment) error {
	return r.db.Create(payment).Error
}

func (r *commissionRepository) GetPaymentsByStaff(staffID string) ([]domain.CommissionPayment, error) {
	var payments []domain.CommissionPayment
	err := r.db.Where("staff_id = ?", staffID).Order("created_at DESC").Find(&payments).Error
	return payments, err
}

func (r *commissionRepository) GetPaymentsByPeriod(periodStart, periodEnd string) ([]domain.CommissionPayment, error) {
	var payments []domain.CommissionPayment
	err := r.db.Where("period_start >= ? AND period_end <= ?", periodStart, periodEnd).Order("created_at DESC").Find(&payments).Error
	return payments, err
}

func (r *commissionRepository) UpdatePaymentStatus(id uint, status string) error {
	return r.db.Model(&domain.CommissionPayment{}).Where("id = ?", id).Update("status", status).Error
}

type segmentRepository struct {
	db *gorm.DB
}

func NewSegmentRepository(db *gorm.DB) repository.SegmentRepository {
	return &segmentRepository{db: db}
}

func (r *segmentRepository) GetSegments() ([]domain.CustomerSegment, error) {
	var segments []domain.CustomerSegment
	err := r.db.Order("name ASC").Find(&segments).Error
	return segments, err
}

func (r *segmentRepository) GetSegmentByID(id string) (*domain.CustomerSegment, error) {
	var seg domain.CustomerSegment
	if err := r.db.First(&seg, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleCustomer, "customer_segment")
	}
	return &seg, nil
}

func (r *segmentRepository) CreateSegment(seg *domain.CustomerSegment) error {
	return r.db.Create(seg).Error
}

func (r *segmentRepository) UpdateSegment(seg *domain.CustomerSegment) error {
	return r.db.Save(seg).Error
}

func (r *segmentRepository) DeleteSegment(id string) error {
	r.db.Where("segment_id = ?", id).Delete(&domain.CustomerSegmentMember{})
	return r.db.Delete(&domain.CustomerSegment{}, "id = ?", id).Error
}

func (r *segmentRepository) AddMember(member *domain.CustomerSegmentMember) error {
	return r.db.Create(member).Error
}

func (r *segmentRepository) RemoveMember(segmentID, customerID string) error {
	return r.db.Where("segment_id = ? AND customer_id = ?", segmentID, customerID).Delete(&domain.CustomerSegmentMember{}).Error
}

func (r *segmentRepository) GetSegmentMembers(segmentID string) ([]domain.CustomerSegmentMember, error) {
	var members []domain.CustomerSegmentMember
	err := r.db.Where("segment_id = ?", segmentID).Find(&members).Error
	return members, err
}

func (r *segmentRepository) GetCampaigns() ([]domain.Campaign, error) {
	var campaigns []domain.Campaign
	err := r.db.Order("created_at DESC").Find(&campaigns).Error
	return campaigns, err
}

func (r *segmentRepository) GetCampaignByID(id string) (*domain.Campaign, error) {
	var c domain.Campaign
	if err := r.db.First(&c, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSales, "campaign")
	}
	return &c, nil
}

func (r *segmentRepository) CreateCampaign(c *domain.Campaign) error {
	return r.db.Create(c).Error
}

func (r *segmentRepository) UpdateCampaign(c *domain.Campaign) error {
	return r.db.Save(c).Error
}

func (r *segmentRepository) DeleteCampaign(id string) error {
	return r.db.Delete(&domain.Campaign{}, "id = ?", id).Error
}

type taxRepository struct {
	db *gorm.DB
}

func NewTaxRepository(db *gorm.DB) repository.TaxRepository {
	return &taxRepository{db: db}
}

func (r *taxRepository) GetTaxRates() ([]domain.TaxRate, error) {
	var rates []domain.TaxRate
	err := r.db.Order("name ASC").Find(&rates).Error
	return rates, err
}

func (r *taxRepository) GetTaxRateByID(id string) (*domain.TaxRate, error) {
	var rate domain.TaxRate
	if err := r.db.First(&rate, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "tax_rate")
	}
	return &rate, nil
}

func (r *taxRepository) GetTaxRateByCode(code string) (*domain.TaxRate, error) {
	var rate domain.TaxRate
	if err := r.db.Where("code = ?", code).First(&rate).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "tax_rate")
	}
	return &rate, nil
}

func (r *taxRepository) CreateTaxRate(rate *domain.TaxRate) error {
	return r.db.Create(rate).Error
}

func (r *taxRepository) UpdateTaxRate(rate *domain.TaxRate) error {
	return r.db.Save(rate).Error
}

func (r *taxRepository) DeleteTaxRate(id string) error {
	r.db.Where("tax_rate_id = ?", id).Delete(&domain.ProductTax{})
	return r.db.Delete(&domain.TaxRate{}, "id = ?", id).Error
}

func (r *taxRepository) CreateProductTax(pt *domain.ProductTax) error {
	return r.db.Create(pt).Error
}

func (r *taxRepository) DeleteProductTax(productID, taxRateID string) error {
	return r.db.Where("product_id = ? AND tax_rate_id = ?", productID, taxRateID).Delete(&domain.ProductTax{}).Error
}

func (r *taxRepository) GetProductTaxes(productID string) ([]domain.ProductTax, error) {
	var pts []domain.ProductTax
	err := r.db.Where("product_id = ?", productID).Find(&pts).Error
	return pts, err
}

func (r *taxRepository) GetDefaultTaxRate() (*domain.TaxRate, error) {
	var rate domain.TaxRate
	if err := r.db.Where("is_default = ? AND is_active = ?", true, true).First(&rate).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "tax_rate")
	}
	return &rate, nil
}

type kioskRepository struct {
	db *gorm.DB
}

func NewKioskRepository(db *gorm.DB) repository.KioskRepository {
	return &kioskRepository{db: db}
}

func (r *kioskRepository) GetLayouts() ([]domain.KioskLayout, error) {
	var layouts []domain.KioskLayout
	err := r.db.Order("name ASC").Find(&layouts).Error
	return layouts, err
}

func (r *kioskRepository) GetLayoutByID(id string) (*domain.KioskLayout, error) {
	var layout domain.KioskLayout
	if err := r.db.First(&layout, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSettings, "kiosk_layout")
	}
	return &layout, nil
}

func (r *kioskRepository) CreateLayout(layout *domain.KioskLayout) error {
	return r.db.Create(layout).Error
}

func (r *kioskRepository) UpdateLayout(layout *domain.KioskLayout) error {
	return r.db.Save(layout).Error
}

func (r *kioskRepository) DeleteLayout(id string) error {
	return r.db.Delete(&domain.KioskLayout{}, "id = ?", id).Error
}

func (r *kioskRepository) CreateSession(session *domain.KioskSession) error {
	return r.db.Create(session).Error
}

func (r *kioskRepository) UpdateSession(session *domain.KioskSession) error {
	return r.db.Save(session).Error
}

func (r *kioskRepository) GetActiveSessions() ([]domain.KioskSession, error) {
	var sessions []domain.KioskSession
	err := r.db.Where("status = ?", "active").Order("started_at DESC").Find(&sessions).Error
	return sessions, err
}

type deliveryRepository struct {
	db *gorm.DB
}

func NewDeliveryRepository(db *gorm.DB) repository.DeliveryRepository {
	return &deliveryRepository{db: db}
}

func (r *deliveryRepository) GetDrivers() ([]domain.DeliveryDriver, error) {
	var drivers []domain.DeliveryDriver
	err := r.db.Where("is_active = ?", true).Order("name ASC").Find(&drivers).Error
	return drivers, err
}

func (r *deliveryRepository) GetDriverByID(id string) (*domain.DeliveryDriver, error) {
	var driver domain.DeliveryDriver
	if err := r.db.First(&driver, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleStaff, "delivery_driver")
	}
	return &driver, nil
}

func (r *deliveryRepository) CreateDriver(driver *domain.DeliveryDriver) error {
	return r.db.Create(driver).Error
}

func (r *deliveryRepository) UpdateDriver(driver *domain.DeliveryDriver) error {
	return r.db.Save(driver).Error
}

func (r *deliveryRepository) DeleteDriver(id string) error {
	return r.db.Delete(&domain.DeliveryDriver{}, "id = ?", id).Error
}

func (r *deliveryRepository) GetOrders(page, limit int, status string) ([]domain.DeliveryOrder, int64, error) {
	var orders []domain.DeliveryOrder
	var total int64
	query := r.db.Model(&domain.DeliveryOrder{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&orders).Error
	return orders, total, err
}

func (r *deliveryRepository) GetOrderByID(id string) (*domain.DeliveryOrder, error) {
	var order domain.DeliveryOrder
	if err := r.db.First(&order, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSales, "delivery_order")
	}
	return &order, nil
}

func (r *deliveryRepository) GetOrderBySaleID(saleID string) (*domain.DeliveryOrder, error) {
	var order domain.DeliveryOrder
	if err := r.db.Where("sale_id = ?", saleID).First(&order).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSales, "delivery_order")
	}
	return &order, nil
}

func (r *deliveryRepository) CreateOrder(order *domain.DeliveryOrder) error {
	return r.db.Create(order).Error
}

func (r *deliveryRepository) UpdateOrder(order *domain.DeliveryOrder) error {
	return r.db.Save(order).Error
}

type reorderRepository struct {
	db *gorm.DB
}

func NewReorderRepository(db *gorm.DB) repository.ReorderRepository {
	return &reorderRepository{db: db}
}

func (r *reorderRepository) GetRules() ([]domain.ReorderRule, error) {
	var rules []domain.ReorderRule
	err := r.db.Order("product_name ASC").Find(&rules).Error
	return rules, err
}

func (r *reorderRepository) GetRuleByID(id string) (*domain.ReorderRule, error) {
	var rule domain.ReorderRule
	if err := r.db.First(&rule, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleInventory, "reorder_rule")
	}
	return &rule, nil
}

func (r *reorderRepository) GetRuleByProductID(productID string) (*domain.ReorderRule, error) {
	var rule domain.ReorderRule
	if err := r.db.Where("product_id = ?", productID).First(&rule).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleInventory, "reorder_rule")
	}
	return &rule, nil
}

func (r *reorderRepository) CreateRule(rule *domain.ReorderRule) error {
	return r.db.Create(rule).Error
}

func (r *reorderRepository) UpdateRule(rule *domain.ReorderRule) error {
	return r.db.Save(rule).Error
}

func (r *reorderRepository) DeleteRule(id string) error {
	return r.db.Delete(&domain.ReorderRule{}, "id = ?", id).Error
}

func (r *reorderRepository) GetAlerts() ([]domain.ReorderAlert, error) {
	var alerts []domain.ReorderAlert
	err := r.db.Raw(`
		SELECT r.id, r.product_id, p.name as product_name, p.stock as current_stock,
			r.reorder_point, r.reorder_qty as suggested_qty, r.supplier_id,
			COALESCE(s.name, '') as supplier_name, 0 as days_until_stockout
		FROM reorder_rules r
		JOIN products p ON p.id = r.product_id
		LEFT JOIN suppliers s ON s.id = r.supplier_id
		WHERE r.is_active = ? AND p.stock <= r.reorder_point
	`, true).Scan(&alerts).Error
	return alerts, err
}

type budgetRepository struct {
	db *gorm.DB
}

func NewBudgetRepository(db *gorm.DB) repository.BudgetRepository {
	return &budgetRepository{db: db}
}

func (r *budgetRepository) GetBudgets() ([]domain.Budget, error) {
	var budgets []domain.Budget
	err := r.db.Order("name ASC").Find(&budgets).Error
	return budgets, err
}

func (r *budgetRepository) GetBudgetByID(id string) (*domain.Budget, error) {
	var b domain.Budget
	if err := r.db.First(&b, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "budget")
	}
	return &b, nil
}

func (r *budgetRepository) CreateBudget(budget *domain.Budget) error {
	return r.db.Create(budget).Error
}

func (r *budgetRepository) UpdateBudget(budget *domain.Budget) error {
	return r.db.Save(budget).Error
}

func (r *budgetRepository) DeleteBudget(id string) error {
	return r.db.Delete(&domain.Budget{}, "id = ?", id).Error
}

func (r *budgetRepository) CreateExpenseApproval(approval *domain.ExpenseApproval) error {
	return r.db.Create(approval).Error
}

func (r *budgetRepository) GetExpenseApprovals(expenseID string) ([]domain.ExpenseApproval, error) {
	var approvals []domain.ExpenseApproval
	err := r.db.Where("expense_id = ?", expenseID).Order("created_at ASC").Find(&approvals).Error
	return approvals, err
}

func (r *budgetRepository) GetApprovalWorkflows() ([]domain.ApprovalWorkflow, error) {
	var workflows []domain.ApprovalWorkflow
	err := r.db.Order("min_amount ASC").Find(&workflows).Error
	return workflows, err
}

func (r *budgetRepository) CreateApprovalWorkflow(wf *domain.ApprovalWorkflow) error {
	return r.db.Create(wf).Error
}

func (r *budgetRepository) UpdateApprovalWorkflow(wf *domain.ApprovalWorkflow) error {
	return r.db.Save(wf).Error
}

func (r *budgetRepository) DeleteApprovalWorkflow(id string) error {
	return r.db.Delete(&domain.ApprovalWorkflow{}, "id = ?", id).Error
}

func (r *budgetRepository) GetSpentForBudget(budgetID string) (float64, error) {
	var b domain.Budget
	if err := r.db.First(&b, "id = ?", budgetID).Error; err != nil {
		return 0, err
	}
	var total float64
	r.db.Model(&domain.Expense{}).Where("category = ? AND date >= ? AND date <= ?", b.Category, b.StartDate, b.EndDate).Select("COALESCE(SUM(amount), 0)").Scan(&total)
	return total, nil
}

type reportBuilderRepository struct {
	db *gorm.DB
}

func NewReportBuilderRepository(db *gorm.DB) repository.ReportBuilderRepository {
	return &reportBuilderRepository{db: db}
}

func (r *reportBuilderRepository) GetTemplates() ([]domain.ReportTemplate, error) {
	var templates []domain.ReportTemplate
	err := r.db.Order("name ASC").Find(&templates).Error
	return templates, err
}

func (r *reportBuilderRepository) GetTemplateByID(id string) (*domain.ReportTemplate, error) {
	var t domain.ReportTemplate
	if err := r.db.First(&t, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSettings, "report_template")
	}
	return &t, nil
}

func (r *reportBuilderRepository) CreateTemplate(t *domain.ReportTemplate) error {
	return r.db.Create(t).Error
}

func (r *reportBuilderRepository) UpdateTemplate(t *domain.ReportTemplate) error {
	return r.db.Save(t).Error
}

func (r *reportBuilderRepository) DeleteTemplate(id string) error {
	return r.db.Delete(&domain.ReportTemplate{}, "id = ?", id).Error
}

func (r *reportBuilderRepository) GetScheduledExports() ([]domain.ScheduledExport, error) {
	var exports []domain.ScheduledExport
	err := r.db.Order("name ASC").Find(&exports).Error
	return exports, err
}

func (r *reportBuilderRepository) CreateScheduledExport(e *domain.ScheduledExport) error {
	return r.db.Create(e).Error
}

func (r *reportBuilderRepository) UpdateScheduledExport(e *domain.ScheduledExport) error {
	return r.db.Save(e).Error
}

func (r *reportBuilderRepository) DeleteScheduledExport(id string) error {
	return r.db.Delete(&domain.ScheduledExport{}, "id = ?", id).Error
}

func (r *reportBuilderRepository) GetDueExports() ([]domain.ScheduledExport, error) {
	var exports []domain.ScheduledExport
	err := r.db.Where("is_active = ? AND next_run_at <= datetime('now')", true).Find(&exports).Error
	return exports, err
}
