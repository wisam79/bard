package sqlite

import (
	"bard/internal/domain"
	"bard/internal/repository"
	"bard/pkg/utils"

	"gorm.io/gorm"
)

type customerRepository struct {
	db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) repository.CustomerRepository {
	return &customerRepository{db: db}
}

func (r *customerRepository) GetAll(page, limit int, search string) ([]domain.Customer, int64, error) {
	var customers []domain.Customer
	var total int64

	query := r.db.Model(&domain.Customer{})
	if search != "" {
		query = query.Where("name LIKE ? OR phone LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("name ASC").Find(&customers).Error
	return customers, total, err
}

func (r *customerRepository) GetByID(id string) (*domain.Customer, error) {
	var customer domain.Customer
	if err := r.db.First(&customer, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *customerRepository) GetByPhone(phone string) (*domain.Customer, error) {
	var customer domain.Customer
	if err := r.db.First(&customer, "phone = ?", phone).Error; err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *customerRepository) Create(customer *domain.Customer) error {
	return r.db.Create(customer).Error
}

func (r *customerRepository) Update(customer *domain.Customer) error {
	return r.db.Save(customer).Error
}

func (r *customerRepository) Delete(id string) error {
	return r.db.Delete(&domain.Customer{}, "id = ?", id).Error
}

func (r *customerRepository) UpdateDebt(id string, amount float64) error {
	return r.db.Model(&domain.Customer{}).Where("id = ?", id).
		UpdateColumn("debt", gorm.Expr("debt + ?", amount)).Error
}

func (r *customerRepository) UpdateInstallmentDebt(id string, amount float64) error {
	return r.db.Model(&domain.Customer{}).Where("id = ?", id).
		UpdateColumn("installment_debt", gorm.Expr("installment_debt + ?", amount)).Error
}

func (r *customerRepository) GetTop(limit int) ([]domain.Customer, error) {
	var customers []domain.Customer
	err := r.db.Order("total_purchases DESC").Limit(limit).Find(&customers).Error
	return customers, err
}

type staffRepository struct {
	db *gorm.DB
}

func NewStaffRepository(db *gorm.DB) repository.StaffRepository {
	return &staffRepository{db: db}
}

func (r *staffRepository) GetAll() ([]domain.Staff, error) {
	var staff []domain.Staff
	err := r.db.Find(&staff).Error
	return staff, err
}

func (r *staffRepository) GetByID(id string) (*domain.Staff, error) {
	var staff domain.Staff
	if err := r.db.First(&staff, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &staff, nil
}

func (r *staffRepository) GetByUsername(username string) (*domain.Staff, error) {
	var staff domain.Staff
	if err := r.db.First(&staff, "username = ?", username).Error; err != nil {
		return nil, err
	}
	return &staff, nil
}

func (r *staffRepository) Create(staff *domain.Staff) error {
	return r.db.Create(staff).Error
}

func (r *staffRepository) Update(staff *domain.Staff) error {
	return r.db.Save(staff).Error
}

func (r *staffRepository) Delete(id string) error {
	return r.db.Delete(&domain.Staff{}, "id = ?", id).Error
}

func (r *staffRepository) Authenticate(username, password string) (*domain.Staff, error) {
	var staff domain.Staff
	if err := r.db.Where("username = ? AND is_active = ?", username, true).First(&staff).Error; err != nil {
		return nil, err
	}
	// Verify password using bcrypt
	if !utils.CheckPassword(password, staff.Password) {
		return nil, gorm.ErrRecordNotFound
	}
	return &staff, nil
}

func (r *staffRepository) UpdatePassword(id, hashedPassword string) error {
	return r.db.Model(&domain.Staff{}).Where("id = ?", id).Update("password", hashedPassword).Error
}

type financeRepository struct {
	db *gorm.DB
}

func NewFinanceRepository(db *gorm.DB) repository.FinanceRepository {
	return &financeRepository{db: db}
}

func (r *financeRepository) GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error) {
	var expenses []domain.Expense
	var total int64

	query := r.db.Model(&domain.Expense{})
	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)
	offset := (page - 1) * limit
	err := query.Offset(offset).Limit(limit).Order("date DESC").Find(&expenses).Error
	return expenses, total, err
}

func (r *financeRepository) CreateExpense(expense *domain.Expense) error {
	return r.db.Create(expense).Error
}

func (r *financeRepository) UpdateExpense(expense *domain.Expense) error {
	return r.db.Save(expense).Error
}

func (r *financeRepository) DeleteExpense(id string) error {
	return r.db.Delete(&domain.Expense{}, "id = ?", id).Error
}

func (r *financeRepository) GetExpenseCategories() ([]string, error) {
	var categories []string
	err := r.db.Model(&domain.Expense{}).Distinct().Pluck("category", &categories).Error
	return categories, err
}

func (r *financeRepository) GetDiscounts() ([]domain.Discount, error) {
	var discounts []domain.Discount
	err := r.db.Find(&discounts).Error
	return discounts, err
}

func (r *financeRepository) CreateDiscount(discount *domain.Discount) error {
	return r.db.Create(discount).Error
}

func (r *financeRepository) UpdateDiscount(discount *domain.Discount) error {
	return r.db.Save(discount).Error
}

func (r *financeRepository) DeleteDiscount(id string) error {
	return r.db.Delete(&domain.Discount{}, "id = ?", id).Error
}

func (r *financeRepository) GetPayments(saleID string) ([]domain.Payment, error) {
	var payments []domain.Payment
	err := r.db.Where("sale_id = ?", saleID).Order("timestamp DESC").Find(&payments).Error
	return payments, err
}

func (r *financeRepository) CreatePayment(payment *domain.Payment) error {
	return r.db.Create(payment).Error
}

func (r *financeRepository) GetPaymentsByCustomerID(customerID string) ([]domain.Payment, error) {
	var payments []domain.Payment
	err := r.db.Where("customer_id = ?", customerID).Order("timestamp DESC").Find(&payments).Error
	return payments, err
}

type settingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) repository.SettingsRepository {
	return &settingsRepository{db: db}
}

func (r *settingsRepository) GetPreferences() (*domain.AppPreferences, error) {
	var prefs domain.AppPreferences
	if err := r.db.First(&prefs).Error; err != nil {
		return nil, err
	}
	return &prefs, nil
}

func (r *settingsRepository) UpdatePreferences(prefs *domain.AppPreferences) error {
	return r.db.Save(prefs).Error
}

func (r *settingsRepository) ResetDatabase() error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		tables := []interface{}{
			&domain.Product{}, &domain.Sale{}, &domain.SaleItem{},
			&domain.Customer{}, &domain.Supplier{}, &domain.Expense{},
			&domain.Payment{}, &domain.StockMovement{}, &domain.ActivityLog{},
			&domain.ParkedSale{}, &domain.PurchaseOrder{}, &domain.PurchaseOrderItem{},
		}
		for _, table := range tables {
			if err := tx.Where("1 = 1").Delete(table).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *settingsRepository) ExportDatabase() (*domain.DatabaseExport, error) {
	var products []domain.Product
	var sales []domain.Sale
	var customers []domain.Customer
	var suppliers []domain.Supplier
	var expenses []domain.Expense
	var staff []domain.Staff
	var prefs domain.AppPreferences

	r.db.Find(&products)
	r.db.Preload("Items").Find(&sales)
	r.db.Find(&customers)
	r.db.Find(&suppliers)
	r.db.Find(&expenses)
	r.db.Find(&staff)
	r.db.First(&prefs)

	return &domain.DatabaseExport{
		Products:    products,
		Sales:       sales,
		Customers:   customers,
		Suppliers:   suppliers,
		Expenses:    expenses,
		Staff:       staff,
		Preferences: prefs,
	}, nil
}

func (r *settingsRepository) ImportDatabase(data *domain.DatabaseExport) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for i := range data.Products {
			if err := tx.Save(&data.Products[i]).Error; err != nil {
				return err
			}
		}
		for i := range data.Customers {
			if err := tx.Save(&data.Customers[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
