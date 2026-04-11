package service

import (
	"math"
	"time"

	"bard/internal/cache"
	"bard/internal/domain"
	"bard/internal/logger"
	"bard/internal/repository"

	"github.com/google/uuid"
)

// SaleService handles sale business logic
type SaleService struct {
	saleRepo     repository.SaleRepository
	productRepo  repository.ProductRepository
	customerRepo repository.CustomerRepository
	cache        *cache.SaleCache
	log          *logger.Logger
}

func NewSaleService(
	saleRepo repository.SaleRepository,
	productRepo repository.ProductRepository,
	customerRepo repository.CustomerRepository,
	cache *cache.SaleCache,
	log *logger.Logger,
) *SaleService {
	return &SaleService{
		saleRepo:     saleRepo,
		productRepo:  productRepo,
		customerRepo: customerRepo,
		cache:        cache,
		log:          log,
	}
}

func (s *SaleService) GetAll(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	if cached, ok := s.cache.GetSaleList(page, limit, search, status); ok {
		return cached.(*domain.PaginatedSales), nil
	}

	result, err := s.saleRepo.GetAll(page, limit, search, status)
	if err != nil {
		return nil, err
	}

	s.cache.SetSaleList(page, limit, search, status, result)
	return result, nil
}

func (s *SaleService) GetByID(id string) (*domain.Sale, error) {
	return s.saleRepo.GetByID(id)
}

func (s *SaleService) Create(sale *domain.Sale) error {
	// 1. Validation
	if err := ValidateSale(sale); err != nil {
		return err
	}

	sale.ID = uuid.New().String()
	sale.Date = time.Now().Format("2006-01-02")
	sale.Timestamp = time.Now().Unix()

	// Calculate totals
	var subtotal, totalCost float64
	for i := range sale.Items {
		sale.Items[i].SaleID = sale.ID
		subtotal += sale.Items[i].Total
		totalCost += sale.Items[i].Cost * sale.Items[i].Quantity
	}

	sale.Subtotal = subtotal
	sale.Total = subtotal - sale.Discount + sale.VAT
	sale.TotalCost = totalCost
	sale.ItemsCount = float64(len(sale.Items))

	s.log.Info("Creating sale", "id", sale.ID, "total", sale.Total)

	// Use repository transaction for data consistency (stock check is inside transaction)
	err := s.saleRepo.CreateSaleWithStockUpdate(sale)
	if err == nil {
		s.cache.InvalidateAllSales()
	}
	return err
}

func (s *SaleService) ProcessReturn(originalSaleID string) (*domain.Sale, error) {
	_, err := s.saleRepo.GetByID(originalSaleID)
	if err != nil {
		return nil, err
	}

	result, err := s.saleRepo.ProcessReturnWithStockUpdate(originalSaleID)
	if err == nil {
		s.cache.InvalidateAllSales()
	}
	return result, err
}

// PartialReturnItem specifies which item and how much to return
type PartialReturnItem = repository.PartialReturnItem

// ProcessPartialReturn creates a return for a subset of original sale items.
// returnItems: map[productID]qtyToReturn
func (s *SaleService) ProcessPartialReturn(originalSaleID string, returnItems []PartialReturnItem) (*domain.Sale, error) {
	if len(returnItems) == 0 {
		return nil, &domain.AppError{
			Module:  domain.ModuleSales,
			Code:    "EMPTY_RETURN",
			Message: "يجب تحديد عنصر واحد على الأقل للإرجاع",
		}
	}

	original, err := s.saleRepo.GetByID(originalSaleID)
	if err != nil {
		return nil, err
	}

	originalByProduct := make(map[string]*domain.SaleItem, len(original.Items))
	for i := range original.Items {
		originalByProduct[original.Items[i].ProductID] = &original.Items[i]
	}

	for _, ri := range returnItems {
		orig, found := originalByProduct[ri.ProductID]
		if !found {
			return nil, &domain.AppError{
				Module:  domain.ModuleSales,
				Code:    "PRODUCT_NOT_IN_SALE",
				Message: "المنتج غير موجود في الفاتورة الأصلية",
			}
		}
		available := orig.Quantity - orig.ReturnedQty
		if ri.Qty <= 0 || ri.Qty > available {
			return nil, &domain.AppError{
				Module:  domain.ModuleSales,
				Code:    "INVALID_RETURN_QTY",
				Message: "الكمية المُرجعة غير صالحة أو تتجاوز الكمية المتاحة",
			}
		}
	}

	s.log.Info("Processing partial return",
		"originalID", originalSaleID,
		"itemCount", len(returnItems),
	)

	repoItems := make([]repository.PartialReturnItem, len(returnItems))
	for i, ri := range returnItems {
		repoItems[i] = repository.PartialReturnItem{
			ProductID: ri.ProductID,
			Qty:       ri.Qty,
		}
	}

	result, err := s.saleRepo.ProcessPartialReturnWithStockUpdate(originalSaleID, repoItems)
	if err == nil {
		s.cache.InvalidateAllSales()
	}
	return result, err
}

func (s *SaleService) GetParkedSales() ([]domain.ParkedSale, error) {
	return s.saleRepo.GetParkedSales()
}

func (s *SaleService) ParkSale(parked *domain.ParkedSale) error {
	parked.CreatedAt = time.Now()
	return s.saleRepo.CreateParkedSale(parked)
}

func (s *SaleService) DeleteParkedSale(id uint) error {
	return s.saleRepo.DeleteParkedSale(id)
}

func (s *SaleService) GetRecent(limit int) ([]domain.Sale, error) {
	if cached, ok := s.cache.GetRecentSales(limit); ok {
		return cached.([]domain.Sale), nil
	}

	result, err := s.saleRepo.GetRecent(limit)
	if err != nil {
		return nil, err
	}

	s.cache.SetRecentSales(limit, result)
	return result, nil
}

func (s *SaleService) CalculateInstallmentPlan(total, downPayment float64, months int) (*domain.InstallmentPlan, error) {
	if months <= 0 || total <= 0 {
		return nil, &domain.AppError{
			Module:  domain.ModuleSales,
			Code:    "INVALID_PARAMS",
			Message: "Invalid installment parameters",
		}
	}

	if downPayment < 0 {
		return nil, &domain.AppError{
			Module:  domain.ModuleSales,
			Code:    "INVALID_DOWN_PAYMENT",
			Message: "Down payment cannot be negative",
		}
	}

	remaining := total - downPayment
	if remaining <= 0 {
		return nil, &domain.AppError{
			Module:  domain.ModuleSales,
			Code:    "INVALID_DOWN_PAYMENT",
			Message: "Down payment cannot exceed total",
		}
	}

	monthlyAmount := math.Round(remaining/float64(months)*100) / 100
	startDate := time.Now()

	schedule := make([]domain.Installment, months)
	for i := 0; i < months; i++ {
		dueDate := startDate.AddDate(0, i+1, 0)
		amount := monthlyAmount
		if i == months-1 {
			amount = remaining - (monthlyAmount * float64(months-1))
		}
		schedule[i] = domain.Installment{
			Number:  i + 1,
			DueDate: dueDate.Format("2006-01-02"),
			Amount:  math.Round(amount*100) / 100,
			Status:  "pending",
		}
	}

	return &domain.InstallmentPlan{
		TotalAmount: total,
		DownPayment: downPayment,
		Months:      months,
		StartDate:   startDate.Format("2006-01-02"),
		Schedule:    schedule,
	}, nil
}

// FinanceService handles finance business logic
type FinanceService struct {
	repo repository.FinanceRepository
	log  *logger.Logger
}

func NewFinanceService(repo repository.FinanceRepository, log *logger.Logger) *FinanceService {
	return &FinanceService{repo: repo, log: log}
}

func (s *FinanceService) GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error) {
	return s.repo.GetExpenses(page, limit, category)
}

func (s *FinanceService) CreateExpense(expense *domain.Expense) error {
	expense.ID = uuid.New().String()
	expense.CreatedAt = time.Now()
	expense.UpdatedAt = time.Now()
	return s.repo.CreateExpense(expense)
}

func (s *FinanceService) UpdateExpense(expense *domain.Expense) error {
	expense.UpdatedAt = time.Now()
	return s.repo.UpdateExpense(expense)
}

func (s *FinanceService) DeleteExpense(id string) error {
	return s.repo.DeleteExpense(id)
}

func (s *FinanceService) GetExpenseCategories() ([]string, error) {
	return s.repo.GetExpenseCategories()
}

func (s *FinanceService) GetDiscounts() ([]domain.Discount, error) {
	return s.repo.GetDiscounts()
}

func (s *FinanceService) CreateDiscount(discount *domain.Discount) error {
	discount.ID = uuid.New().String()
	return s.repo.CreateDiscount(discount)
}

func (s *FinanceService) CreatePayment(payment *domain.Payment) error {
	payment.Timestamp = time.Now().Unix()
	payment.CreatedAt = time.Now()
	return s.repo.CreatePayment(payment)
}

func (s *FinanceService) GetPayments(saleID string) ([]domain.Payment, error) {
	return s.repo.GetPayments(saleID)
}

// StatsService handles dashboard statistics
type StatsService struct {
	repo repository.StatsRepository
	log  *logger.Logger
}

func NewStatsService(repo repository.StatsRepository, log *logger.Logger) *StatsService {
	return &StatsService{repo: repo, log: log}
}

func (s *StatsService) GetDashboardStats() (*domain.DashboardStats, error) {
	return s.repo.GetDashboardStats()
}
