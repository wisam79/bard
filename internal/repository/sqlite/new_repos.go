package sqlite

import (
	"bard/internal/domain"
	"bard/internal/repository"

	"gorm.io/gorm"
)

type loyaltyRepository struct {
	db *gorm.DB
}

func NewLoyaltyRepository(db *gorm.DB) repository.LoyaltyRepository {
	return &loyaltyRepository{db: db}
}

func (r *loyaltyRepository) GetTiers() ([]domain.LoyaltyTier, error) {
	var tiers []domain.LoyaltyTier
	err := r.db.Order("min_points ASC").Find(&tiers).Error
	return tiers, err
}

func (r *loyaltyRepository) CreateTier(tier *domain.LoyaltyTier) error {
	return r.db.Create(tier).Error
}

func (r *loyaltyRepository) UpdateTier(tier *domain.LoyaltyTier) error {
	return r.db.Save(tier).Error
}

func (r *loyaltyRepository) DeleteTier(id string) error {
	return r.db.Delete(&domain.LoyaltyTier{}, "id = ?", id).Error
}

func (r *loyaltyRepository) GetRules() ([]domain.LoyaltyRule, error) {
	var rules []domain.LoyaltyRule
	err := r.db.Order("created_at DESC").Find(&rules).Error
	return rules, err
}

func (r *loyaltyRepository) CreateRule(rule *domain.LoyaltyRule) error {
	return r.db.Create(rule).Error
}

func (r *loyaltyRepository) UpdateRule(rule *domain.LoyaltyRule) error {
	return r.db.Save(rule).Error
}

func (r *loyaltyRepository) GetActiveRule() (*domain.LoyaltyRule, error) {
	var rule domain.LoyaltyRule
	if err := r.db.Where("is_active = ?", true).First(&rule).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleDiscount, "loyalty_rule")
	}
	return &rule, nil
}

func (r *loyaltyRepository) CreateTransaction(tx *domain.LoyaltyTransaction) error {
	return r.db.Create(tx).Error
}

func (r *loyaltyRepository) GetTransactionsByCustomer(customerID string) ([]domain.LoyaltyTransaction, error) {
	var txs []domain.LoyaltyTransaction
	err := r.db.Where("customer_id = ?", customerID).Order("timestamp DESC").Find(&txs).Error
	return txs, err
}

func (r *loyaltyRepository) CreateRedemption(redemption *domain.LoyaltyRedemption) error {
	return r.db.Create(redemption).Error
}

func (r *loyaltyRepository) GetRedemptionsByCustomer(customerID string) ([]domain.LoyaltyRedemption, error) {
	var redemptions []domain.LoyaltyRedemption
	err := r.db.Where("customer_id = ?", customerID).Order("timestamp DESC").Find(&redemptions).Error
	return redemptions, err
}

type notificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) repository.NotificationRepository {
	return &notificationRepository{db: db}
}

func (r *notificationRepository) GetTemplates() ([]domain.NotificationTemplate, error) {
	var templates []domain.NotificationTemplate
	err := r.db.Order("name ASC").Find(&templates).Error
	return templates, err
}

func (r *notificationRepository) CreateTemplate(t *domain.NotificationTemplate) error {
	return r.db.Create(t).Error
}

func (r *notificationRepository) UpdateTemplate(t *domain.NotificationTemplate) error {
	return r.db.Save(t).Error
}

func (r *notificationRepository) DeleteTemplate(id string) error {
	return r.db.Delete(&domain.NotificationTemplate{}, "id = ?", id).Error
}

func (r *notificationRepository) GetSettings() (*domain.NotificationSettings, error) {
	var s domain.NotificationSettings
	if err := r.db.First(&s).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSettings, "notification_settings")
	}
	return &s, nil
}

func (r *notificationRepository) UpdateSettings(s *domain.NotificationSettings) error {
	return r.db.Save(s).Error
}

func (r *notificationRepository) CreateLog(log *domain.NotificationLog) error {
	return r.db.Create(log).Error
}

func (r *notificationRepository) GetLogs(page, limit int) ([]domain.NotificationLog, int64, error) {
	var logs []domain.NotificationLog
	var total int64
	r.db.Model(&domain.NotificationLog{}).Count(&total)
	offset := (page - 1) * limit
	err := r.db.Offset(offset).Limit(limit).Order("created_at DESC").Find(&logs).Error
	return logs, total, err
}

type branchRepository struct {
	db *gorm.DB
}

func NewBranchRepository(db *gorm.DB) repository.BranchRepository {
	return &branchRepository{db: db}
}

func (r *branchRepository) GetAll() ([]domain.Branch, error) {
	var branches []domain.Branch
	err := r.db.Order("name ASC").Find(&branches).Error
	return branches, err
}

func (r *branchRepository) GetByID(id string) (*domain.Branch, error) {
	var branch domain.Branch
	if err := r.db.First(&branch, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSettings, "branch")
	}
	return &branch, nil
}

func (r *branchRepository) Create(branch *domain.Branch) error {
	return r.db.Create(branch).Error
}

func (r *branchRepository) Update(branch *domain.Branch) error {
	return r.db.Save(branch).Error
}

func (r *branchRepository) Delete(id string) error {
	return r.db.Delete(&domain.Branch{}, "id = ?", id).Error
}

func (r *branchRepository) CreateStockTransfer(transfer *domain.StockTransfer) error {
	return r.db.Create(transfer).Error
}

func (r *branchRepository) GetStockTransfers(page, limit int, status string) ([]domain.StockTransfer, int64, error) {
	var transfers []domain.StockTransfer
	var total int64
	query := r.db.Model(&domain.StockTransfer{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	offset := (page - 1) * limit
	err := query.Preload("Items").Offset(offset).Limit(limit).Order("created_at DESC").Find(&transfers).Error
	return transfers, total, err
}

func (r *branchRepository) GetStockTransferByID(id string) (*domain.StockTransfer, error) {
	var transfer domain.StockTransfer
	if err := r.db.Preload("Items").First(&transfer, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleInventory, "stock_transfer")
	}
	return &transfer, nil
}

func (r *branchRepository) UpdateStockTransferStatus(id, status string) error {
	return r.db.Model(&domain.StockTransfer{}).Where("id = ?", id).Update("status", status).Error
}

type kitRepository struct {
	db *gorm.DB
}

func NewKitRepository(db *gorm.DB) repository.KitRepository {
	return &kitRepository{db: db}
}

func (r *kitRepository) GetAll() ([]domain.ProductKit, error) {
	var kits []domain.ProductKit
	err := r.db.Preload("Items").Order("name ASC").Find(&kits).Error
	return kits, err
}

func (r *kitRepository) GetByID(id string) (*domain.ProductKit, error) {
	var kit domain.ProductKit
	if err := r.db.Preload("Items").First(&kit, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleProduct, "product_kit")
	}
	return &kit, nil
}

func (r *kitRepository) Create(kit *domain.ProductKit) error {
	return r.db.Create(kit).Error
}

func (r *kitRepository) Update(kit *domain.ProductKit) error {
	return r.db.Save(kit).Error
}

func (r *kitRepository) Delete(id string) error {
	return r.db.Delete(&domain.ProductKit{}, "id = ?", id).Error
}

type recurringInvoiceRepository struct {
	db *gorm.DB
}

func NewRecurringInvoiceRepository(db *gorm.DB) repository.RecurringInvoiceRepository {
	return &recurringInvoiceRepository{db: db}
}

func (r *recurringInvoiceRepository) GetAll(page, limit int, status string) ([]domain.RecurringInvoice, int64, error) {
	var invoices []domain.RecurringInvoice
	var total int64
	query := r.db.Model(&domain.RecurringInvoice{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	offset := (page - 1) * limit
	err := query.Preload("Items").Offset(offset).Limit(limit).Order("created_at DESC").Find(&invoices).Error
	return invoices, total, err
}

func (r *recurringInvoiceRepository) GetByID(id string) (*domain.RecurringInvoice, error) {
	var invoice domain.RecurringInvoice
	if err := r.db.Preload("Items").First(&invoice, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSales, "recurring_invoice")
	}
	return &invoice, nil
}

func (r *recurringInvoiceRepository) Create(invoice *domain.RecurringInvoice) error {
	return r.db.Create(invoice).Error
}

func (r *recurringInvoiceRepository) Update(invoice *domain.RecurringInvoice) error {
	return r.db.Save(invoice).Error
}

func (r *recurringInvoiceRepository) Delete(id string) error {
	return r.db.Delete(&domain.RecurringInvoice{}, "id = ?", id).Error
}

func (r *recurringInvoiceRepository) GetDueInvoices() ([]domain.RecurringInvoice, error) {
	var invoices []domain.RecurringInvoice
	err := r.db.Preload("Items").Where("status = ? AND next_run_date <= date('now')", "active").Find(&invoices).Error
	return invoices, err
}

func (r *recurringInvoiceRepository) MarkRun(id string, saleID string) error {
	return r.db.Model(&domain.RecurringInvoice{}).Where("id = ?", id).Updates(map[string]interface{}{
		"last_run_date": gorm.Expr("date('now')"),
		"next_run_date": gorm.Expr("date('now', '+' || (CASE WHEN frequency = 'daily' THEN '1' WHEN frequency = 'weekly' THEN '7' WHEN frequency = 'monthly' THEN '30' WHEN frequency = 'yearly' THEN '365' ELSE '30' END) || ' days')"),
		"run_count":     gorm.Expr("run_count + 1"),
	}).Error
}

type giftCardRepository struct {
	db *gorm.DB
}

func NewGiftCardRepository(db *gorm.DB) repository.GiftCardRepository {
	return &giftCardRepository{db: db}
}

func (r *giftCardRepository) GetAll(page, limit int) ([]domain.GiftCard, int64, error) {
	var cards []domain.GiftCard
	var total int64
	r.db.Model(&domain.GiftCard{}).Count(&total)
	offset := (page - 1) * limit
	err := r.db.Offset(offset).Limit(limit).Order("created_at DESC").Find(&cards).Error
	return cards, total, err
}

func (r *giftCardRepository) GetByID(id string) (*domain.GiftCard, error) {
	var card domain.GiftCard
	if err := r.db.First(&card, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "gift_card")
	}
	return &card, nil
}

func (r *giftCardRepository) GetByCode(code string) (*domain.GiftCard, error) {
	var card domain.GiftCard
	if err := r.db.Where("code = ? AND is_active = ?", code, true).First(&card).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleFinance, "gift_card")
	}
	return &card, nil
}

func (r *giftCardRepository) Create(card *domain.GiftCard) error {
	return r.db.Create(card).Error
}

func (r *giftCardRepository) Update(card *domain.GiftCard) error {
	return r.db.Save(card).Error
}

func (r *giftCardRepository) Delete(id string) error {
	return r.db.Delete(&domain.GiftCard{}, "id = ?", id).Error
}

func (r *giftCardRepository) CreateTransaction(tx *domain.GiftCardTransaction) error {
	return r.db.Create(tx).Error
}

func (r *giftCardRepository) GetTransactions(cardID string) ([]domain.GiftCardTransaction, error) {
	var txs []domain.GiftCardTransaction
	err := r.db.Where("gift_card_id = ?", cardID).Order("timestamp DESC").Find(&txs).Error
	return txs, err
}

func (r *giftCardRepository) GetVouchers() ([]domain.Voucher, error) {
	var vouchers []domain.Voucher
	err := r.db.Order("created_at DESC").Find(&vouchers).Error
	return vouchers, err
}

func (r *giftCardRepository) GetVoucherByCode(code string) (*domain.Voucher, error) {
	var v domain.Voucher
	if err := r.db.Where("code = ? AND is_active = ?", code, true).First(&v).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleDiscount, "voucher")
	}
	return &v, nil
}

func (r *giftCardRepository) CreateVoucher(v *domain.Voucher) error {
	return r.db.Create(v).Error
}

func (r *giftCardRepository) UpdateVoucher(v *domain.Voucher) error {
	return r.db.Save(v).Error
}

func (r *giftCardRepository) DeleteVoucher(id string) error {
	return r.db.Delete(&domain.Voucher{}, "id = ?", id).Error
}

func (r *giftCardRepository) IncrementVoucherUsage(id string) error {
	return r.db.Model(&domain.Voucher{}).Where("id = ?", id).UpdateColumn("used_count", gorm.Expr("used_count + 1")).Error
}

type kitchenRepository struct {
	db *gorm.DB
}

func NewKitchenRepository(db *gorm.DB) repository.KitchenRepository {
	return &kitchenRepository{db: db}
}

func (r *kitchenRepository) GetPendingOrders() ([]domain.KitchenOrder, error) {
	var orders []domain.KitchenOrder
	err := r.db.Preload("Items").Where("status IN ?", []string{"pending", "preparing"}).Order("created_at ASC").Find(&orders).Error
	return orders, err
}

func (r *kitchenRepository) GetOrderByID(id string) (*domain.KitchenOrder, error) {
	var order domain.KitchenOrder
	if err := r.db.Preload("Items").First(&order, "id = ?", id).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSales, "kitchen_order")
	}
	return &order, nil
}

func (r *kitchenRepository) GetOrderBySaleID(saleID string) (*domain.KitchenOrder, error) {
	var order domain.KitchenOrder
	if err := r.db.Preload("Items").Where("sale_id = ?", saleID).First(&order).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleSales, "kitchen_order")
	}
	return &order, nil
}

func (r *kitchenRepository) CreateOrder(order *domain.KitchenOrder) error {
	return r.db.Create(order).Error
}

func (r *kitchenRepository) UpdateOrder(order *domain.KitchenOrder) error {
	return r.db.Save(order).Error
}

func (r *kitchenRepository) UpdateOrderItemStatus(orderID string, itemID uint, status string) error {
	return r.db.Model(&domain.KitchenOrderItem{}).Where("id = ? AND order_id = ?", itemID, orderID).Update("status", status).Error
}

func (r *kitchenRepository) GetStations() ([]domain.KitchenStation, error) {
	var stations []domain.KitchenStation
	err := r.db.Order("name ASC").Find(&stations).Error
	return stations, err
}

func (r *kitchenRepository) CreateStation(station *domain.KitchenStation) error {
	return r.db.Create(station).Error
}

func (r *kitchenRepository) UpdateStation(station *domain.KitchenStation) error {
	return r.db.Save(station).Error
}

func (r *kitchenRepository) DeleteStation(id string) error {
	return r.db.Delete(&domain.KitchenStation{}, "id = ?", id).Error
}

type walletRepository struct {
	db *gorm.DB
}

func NewWalletRepository(db *gorm.DB) repository.WalletRepository {
	return &walletRepository{db: db}
}

func (r *walletRepository) GetByCustomerID(customerID string) (*domain.CustomerWallet, error) {
	var wallet domain.CustomerWallet
	if err := r.db.Where("customer_id = ?", customerID).First(&wallet).Error; err != nil {
		return nil, handleDBError(err, domain.ModuleCustomer, "customer_wallet")
	}
	return &wallet, nil
}

func (r *walletRepository) Create(wallet *domain.CustomerWallet) error {
	return r.db.Create(wallet).Error
}

func (r *walletRepository) Update(wallet *domain.CustomerWallet) error {
	return r.db.Save(wallet).Error
}

func (r *walletRepository) CreateTransaction(tx *domain.WalletTransaction) error {
	return r.db.Create(tx).Error
}

func (r *walletRepository) GetTransactions(customerID string, page, limit int) ([]domain.WalletTransaction, int64, error) {
	var txs []domain.WalletTransaction
	var total int64
	query := r.db.Model(&domain.WalletTransaction{}).Where("customer_id = ?", customerID)
	query.Count(&total)
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("timestamp DESC").Find(&txs).Error
	return txs, total, err
}

type stockAdjustmentRepository struct {
	db *gorm.DB
}

func NewStockAdjustmentRepository(db *gorm.DB) repository.StockAdjustmentRepository {
	return &stockAdjustmentRepository{db: db}
}

func (r *stockAdjustmentRepository) CreateAdjustment(adj *domain.StockAdjustment) error {
	return r.db.Create(adj).Error
}

func (r *stockAdjustmentRepository) GetAdjustments(page, limit int, adjType string) ([]domain.StockAdjustment, int64, error) {
	var adjs []domain.StockAdjustment
	var total int64
	query := r.db.Model(&domain.StockAdjustment{})
	if adjType != "" {
		query = query.Where("type = ?", adjType)
	}
	query.Count(&total)
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&adjs).Error
	return adjs, total, err
}

func (r *stockAdjustmentRepository) CreateWasteRecord(record *domain.WasteRecord) error {
	return r.db.Create(record).Error
}

func (r *stockAdjustmentRepository) GetWasteRecords(page, limit int, wasteType string) ([]domain.WasteRecord, int64, error) {
	var records []domain.WasteRecord
	var total int64
	query := r.db.Model(&domain.WasteRecord{})
	if wasteType != "" {
		query = query.Where("waste_type = ?", wasteType)
	}
	query.Count(&total)
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&records).Error
	return records, total, err
}

func (r *stockAdjustmentRepository) GetWasteSummary(startDate, endDate string) ([]domain.WasteRecord, error) {
	var records []domain.WasteRecord
	query := r.db.Model(&domain.WasteRecord{})
	if startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("date <= ?", endDate)
	}
	err := query.Find(&records).Error
	return records, err
}
