package service

import (
	"bard/internal/domain"
	"bard/internal/errors"
	"bard/internal/logger"
	"bard/internal/repository"
	"bard/pkg/utils"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ProductService handles product business logic
type ProductService struct {
	repo repository.ProductRepository
	log  *logger.Logger
}

func NewProductService(repo repository.ProductRepository, log *logger.Logger) *ProductService {
	return &ProductService{repo: repo, log: log}
}

func (s *ProductService) GetAll(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
	return s.repo.GetAll(page, limit, search, category)
}

func (s *ProductService) GetByID(id string) (*domain.Product, error) {
	return s.repo.GetByID(id)
}

func (s *ProductService) GetByBarcode(barcode string) (*domain.Product, error) {
	return s.repo.GetByBarcode(barcode)
}

func (s *ProductService) Create(product *domain.Product) error {
	if product.Name == "" {
		return errors.NewValidationError(domain.ModuleProduct, "name", "Name is required")
	}
	if product.Barcode == "" {
		return errors.NewValidationError(domain.ModuleProduct, "barcode", "Barcode is required")
	}
	if product.Price < 0 {
		return errors.NewValidationError(domain.ModuleProduct, "price", "Price cannot be negative")
	}
	if product.Stock < 0 {
		return errors.NewValidationError(domain.ModuleProduct, "stock", "Stock cannot be negative")
	}
	product.ID = uuid.New().String()
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()
	s.log.Info("Creating product", "name", product.Name)
	return s.repo.Create(product)
}

func (s *ProductService) Update(product *domain.Product) error {
	if product.Name == "" {
		return errors.NewValidationError(domain.ModuleProduct, "name", "Name is required")
	}
	if product.Barcode == "" {
		return errors.NewValidationError(domain.ModuleProduct, "barcode", "Barcode is required")
	}
	if product.Price < 0 {
		return errors.NewValidationError(domain.ModuleProduct, "price", "Price cannot be negative")
	}
	if product.Stock < 0 {
		return errors.NewValidationError(domain.ModuleProduct, "stock", "Stock cannot be negative")
	}
	product.UpdatedAt = time.Now()
	s.log.Info("Updating product", "id", product.ID)
	return s.repo.Update(product)
}

func (s *ProductService) Delete(id string) error {
	s.log.Info("Deleting product", "id", id)
	return s.repo.Delete(id)
}

func (s *ProductService) GetCategories() ([]string, error) {
	return s.repo.GetCategories()
}

func (s *ProductService) CreateCategory(cat *domain.Category) error {
	cat.ID = uuid.New().String()
	return s.repo.CreateCategory(cat)
}

func (s *ProductService) GetStats() (*domain.ProductStats, error) {
	return s.repo.GetStats()
}

func (s *ProductService) GetLowStock(threshold int) ([]domain.Product, error) {
	return s.repo.GetLowStock(threshold)
}

func (s *ProductService) Search(query string, limit int) ([]domain.Product, error) {
	return s.repo.Search(query, limit)
}

// CustomerService handles customer business logic
type CustomerService struct {
	repo repository.CustomerRepository
	log  *logger.Logger
}

func NewCustomerService(repo repository.CustomerRepository, log *logger.Logger) *CustomerService {
	return &CustomerService{repo: repo, log: log}
}

func (s *CustomerService) GetAll(page, limit int, search string) ([]domain.Customer, int64, error) {
	return s.repo.GetAll(page, limit, search)
}

func (s *CustomerService) GetByID(id string) (*domain.Customer, error) {
	return s.repo.GetByID(id)
}

func (s *CustomerService) GetByPhone(phone string) (*domain.Customer, error) {
	return s.repo.GetByPhone(phone)
}

func (s *CustomerService) Create(customer *domain.Customer) error {
	customer.Name = strings.TrimSpace(customer.Name)
	if customer.Name == "" {
		return errors.NewValidationError(domain.ModuleCustomer, "name", "Customer name is required")
	}
	customer.ID = uuid.New().String()
	customer.CreatedAt = time.Now()
	customer.UpdatedAt = time.Now()
	s.log.Info("Creating customer", "name", customer.Name)
	return s.repo.Create(customer)
}

func (s *CustomerService) Update(customer *domain.Customer) error {
	customer.Name = strings.TrimSpace(customer.Name)
	if customer.Name == "" {
		return errors.NewValidationError(domain.ModuleCustomer, "name", "Customer name is required")
	}
	
	// Fetch existing customer to preserve critical financial fields
	// This prevents accidental debt/installment_debt deletion on partial updates
	existingCustomer, err := s.repo.GetByID(customer.ID)
	if err == nil && existingCustomer != nil {
		// Preserve debt fields if not explicitly provided in the update
		if customer.Debt == 0 && existingCustomer.Debt != 0 {
			customer.Debt = existingCustomer.Debt
		}
		if customer.InstallmentDebt == 0 && existingCustomer.InstallmentDebt != 0 {
			customer.InstallmentDebt = existingCustomer.InstallmentDebt
		}
		if customer.TotalPurchases == 0 && existingCustomer.TotalPurchases != 0 {
			customer.TotalPurchases = existingCustomer.TotalPurchases
		}
	}
	
	customer.UpdatedAt = time.Now()
	return s.repo.Update(customer)
}

func (s *CustomerService) Delete(id string) error {
	s.log.Info("Deleting customer", "id", id)
	return s.repo.Delete(id)
}

func (s *CustomerService) GetTop(limit int) ([]domain.Customer, error) {
	return s.repo.GetTop(limit)
}

// StaffService handles staff business logic
type StaffService struct {
	repo repository.StaffRepository
	log  *logger.Logger
}

func NewStaffService(repo repository.StaffRepository, log *logger.Logger) *StaffService {
	return &StaffService{repo: repo, log: log}
}

func (s *StaffService) GetAll() ([]domain.Staff, error) {
	return s.repo.GetAll()
}

func (s *StaffService) GetByID(id string) (*domain.Staff, error) {
	return s.repo.GetByID(id)
}

func (s *StaffService) Create(staff *domain.Staff) error {
	staff.Username = strings.TrimSpace(staff.Username)
	staff.Name = strings.TrimSpace(staff.Name)
	if staff.Username == "" {
		return errors.NewValidationError(domain.ModuleStaff, "username", "Username is required")
	}
	if staff.Name == "" {
		return errors.NewValidationError(domain.ModuleStaff, "name", "Name is required")
	}
	if staff.Role == "" {
		return errors.NewValidationError(domain.ModuleStaff, "role", "Role is required")
	}
	staff.ID = uuid.New().String()
	staff.CreatedAt = time.Now()
	staff.UpdatedAt = time.Now()

	// Hash password if not already hashed
	if staff.Password != "" && !utils.IsHashed(staff.Password) {
		hashedPassword, err := utils.HashPassword(staff.Password)
		if err != nil {
			return err
		}
		staff.Password = hashedPassword
	}

	return s.repo.Create(staff)
}

func (s *StaffService) Update(staff *domain.Staff) error {
	staff.Name = strings.TrimSpace(staff.Name)
	if staff.Name == "" {
		return errors.NewValidationError(domain.ModuleStaff, "name", "Name is required")
	}
	staff.UpdatedAt = time.Now()

	// Only update password if a new non-empty password is provided
	// This prevents accidental password deletion when updating other fields
	if staff.Password != "" && !utils.IsHashed(staff.Password) {
		hashedPassword, err := utils.HashPassword(staff.Password)
		if err != nil {
			return err
		}
		staff.Password = hashedPassword
	} else if staff.Password == "" {
		// If password is empty, fetch existing staff to preserve the password
		existingStaff, err := s.repo.GetByID(staff.ID)
		if err == nil && existingStaff != nil {
			staff.Password = existingStaff.Password
		}
	}

	return s.repo.Update(staff)
}

func (s *StaffService) Delete(id string) error {
	return s.repo.Delete(id)
}

func (s *StaffService) Authenticate(username, password string) (*domain.Staff, error) {
	s.log.Info("Authentication attempt", "username", username)
	staff, err := s.repo.Authenticate(username, password)
	if err != nil {
		s.log.Error("Authentication failed in repo", "error", err)
		return nil, err
	}
	s.log.Info("Authentication passed in repo, returning staff object")
	return staff, nil
}

// SettingsService handles settings business logic
type SettingsService struct {
	repo repository.SettingsRepository
	log  *logger.Logger
}

func NewSettingsService(repo repository.SettingsRepository, log *logger.Logger) *SettingsService {
	return &SettingsService{repo: repo, log: log}
}

func (s *SettingsService) GetPreferences() (*domain.AppPreferences, error) {
	return s.repo.GetPreferences()
}

func (s *SettingsService) UpdatePreferences(prefs *domain.AppPreferences) error {
	return s.repo.UpdatePreferences(prefs)
}

func (s *SettingsService) ResetDatabase() error {
	return s.repo.ResetDatabase()
}

func (s *SettingsService) ExportDatabase() (*domain.DatabaseExport, error) {
	return s.repo.ExportDatabase()
}

func (s *SettingsService) ImportDatabase(data *domain.DatabaseExport) error {
	return s.repo.ImportDatabase(data)
}
