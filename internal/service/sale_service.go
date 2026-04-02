package service

import (
	"math"
	"time"

	"bard/internal/domain"
	"bard/internal/errors"
	"bard/internal/logger"
	"bard/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SaleService handles sale business logic
type SaleService struct {
	db           *gorm.DB
	saleRepo     repository.SaleRepository
	productRepo  repository.ProductRepository
	customerRepo repository.CustomerRepository
	log          *logger.Logger
}

func NewSaleService(
	db *gorm.DB,
	saleRepo repository.SaleRepository,
	productRepo repository.ProductRepository,
	customerRepo repository.CustomerRepository,
	log *logger.Logger,
) *SaleService {
	return &SaleService{
		db:           db,
		saleRepo:     saleRepo,
		productRepo:  productRepo,
		customerRepo: customerRepo,
		log:          log,
	}
}

func (s *SaleService) GetAll(page, limit int, search, status string) (*domain.PaginatedSales, error) {
	return s.saleRepo.GetAll(page, limit, search, status)
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

		
		// Check stock availability (soft check before transaction)
		product, err := s.productRepo.GetByID(sale.Items[i].ProductID)
		if err == nil && product.Stock < float64(sale.Items[i].Quantity) {
			return errors.NewInsufficientStockError(product.Name, product.Stock)
		}

		subtotal += sale.Items[i].Total
		totalCost += sale.Items[i].Cost * sale.Items[i].Quantity
	}

	sale.Subtotal = subtotal
	sale.Total = subtotal - sale.Discount + sale.VAT
	sale.ItemsCount = float64(len(sale.Items))

	s.log.Info("Creating sale", "id", sale.ID, "total", sale.Total)

	// Use repository transaction for data consistency
	return s.saleRepo.CreateSaleWithStockUpdate(sale)
}

func (s *SaleService) ProcessReturn(originalSaleID string) (*domain.Sale, error) {
	original, err := s.saleRepo.GetByID(originalSaleID)
	if err != nil {
		return nil, err
	}

	returnSale := &domain.Sale{
		ID:            uuid.New().String(),
		CustomerID:    original.CustomerID,
		CustomerName:  original.CustomerName,
		StaffID:       original.StaffID,
		StaffName:     original.StaffName,
		Date:          time.Now().Format("2006-01-02"),
		Timestamp:     time.Now().Unix(),
		Status:        "return",
		PaymentMethod: original.PaymentMethod,
		Note:          "إرجاع - " + original.ID,
	}

	var total float64
	for _, item := range original.Items {
		returnItem := domain.SaleItem{
			ProductID: item.ProductID,
			Name:      item.Name,
			Price:     item.Price,
			Quantity:  item.Quantity,
			Total:     -item.Total,
			Cost:      item.Cost,
		}
		returnSale.Items = append(returnSale.Items, returnItem)
		total += item.Total
	}

	returnSale.Subtotal = -total
	returnSale.Total = -total

	// Use transaction for data consistency
	var createdReturn *domain.Sale
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// Restore stock within transaction
		for _, item := range original.Items {
			var product domain.Product
			if err := tx.First(&product, "id = ?", item.ProductID).Error; err != nil {
				s.log.Warn("Product not found for stock restore", "productId", item.ProductID)
				continue
			}
			newStock := product.Stock + item.Quantity
			if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
				return err
			}
		}

		// Reverse debt
		if original.PaymentMethod == "credit" && original.CustomerID != "" {
			if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
				UpdateColumn("debt", gorm.Expr("debt - ?", total)).Error; err != nil {
				return err
			}
		} else if original.PaymentMethod == "installment" && original.CustomerID != "" {
			if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
				UpdateColumn("installment_debt", gorm.Expr("installment_debt - ?", total)).Error; err != nil {
				return err
			}
		}

		// Create the return sale
		if err := tx.Create(returnSale).Error; err != nil {
			return err
		}
		createdReturn = returnSale
		return nil
	})

	if err != nil {
		return nil, err
	}
	return createdReturn, nil
}

// PartialReturnItem specifies which item and how much to return
type PartialReturnItem struct {
	ProductID string
	Quantity  float64
}

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

	// Build lookup: productID → original item
	originalByProduct := make(map[string]*domain.SaleItem, len(original.Items))
	for i := range original.Items {
		originalByProduct[original.Items[i].ProductID] = &original.Items[i]
	}

	// Validate each return item
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
		if ri.Quantity <= 0 || ri.Quantity > available {
			return nil, &domain.AppError{
				Module:  domain.ModuleSales,
				Code:    "INVALID_RETURN_QTY",
				Message: "الكمية المُرجعة غير صالحة أو تتجاوز الكمية المتاحة",
			}
		}
	}

	// Build return sale
	returnSale := &domain.Sale{
		ID:            uuid.New().String(),
		CustomerID:    original.CustomerID,
		CustomerName:  original.CustomerName,
		StaffID:       original.StaffID,
		StaffName:     original.StaffName,
		Date:          time.Now().Format("2006-01-02"),
		Timestamp:     time.Now().Unix(),
		Status:        "return",
		PaymentMethod: original.PaymentMethod,
		Note:          "إرجاع جزئي - " + original.ID,
	}

	var returnTotal float64
	for _, ri := range returnItems {
		orig := originalByProduct[ri.ProductID]
		unitPrice := orig.Total / orig.Quantity
		returnItem := domain.SaleItem{
			SaleID:    returnSale.ID,
			ProductID: orig.ProductID,
			Name:      orig.Name,
			Price:     orig.Price,
			Quantity:  ri.Quantity,
			Total:     -(unitPrice * ri.Quantity),
			Cost:      orig.Cost,
		}
		returnSale.Items = append(returnSale.Items, returnItem)
		returnTotal += unitPrice * ri.Quantity
	}

	returnSale.Subtotal = -returnTotal
	returnSale.Total = -returnTotal

	s.log.Info("Processing partial return",
		"originalID", originalSaleID,
		"returnTotal", returnTotal,
		"itemCount", len(returnItems),
	)

	// Execute inside a transaction
	var created *domain.Sale
	err = s.db.Transaction(func(tx *gorm.DB) error {
		for _, ri := range returnItems {
			// 1. Restore stock
			var product domain.Product
			if err := tx.First(&product, "id = ?", ri.ProductID).Error; err != nil {
				s.log.Warn("Product not found for stock restore", "productId", ri.ProductID)
			} else {
				newStock := product.Stock + ri.Quantity
				if err := tx.Model(&product).Update("stock", newStock).Error; err != nil {
					return err
				}
			}

			// 2. Update returnedQty on original item
			if err := tx.Model(&domain.SaleItem{}).
				Where("sale_id = ? AND product_id = ?", originalSaleID, ri.ProductID).
				UpdateColumn("returned_qty", gorm.Expr("returned_qty + ?", ri.Quantity)).Error; err != nil {
				return err
			}
		}

		// 3. Adjust debt proportionally (if credit or installment sale)
		if original.CustomerID != "" {
			ratio := returnTotal / math.Abs(original.Total)
			debtReduction := original.Total * ratio
			switch original.PaymentMethod {
			case "credit":
				if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
					UpdateColumn("debt", gorm.Expr("debt - ?", debtReduction)).Error; err != nil {
					return err
				}
			case "installment":
				if err := tx.Model(&domain.Customer{}).Where("id = ?", original.CustomerID).
					UpdateColumn("installment_debt", gorm.Expr("installment_debt - ?", debtReduction)).Error; err != nil {
					return err
				}
			}
		}

		// 4. Create return sale record
		if err := tx.Create(returnSale).Error; err != nil {
			return err
		}
		created = returnSale
		return nil
	})

	if err != nil {
		return nil, err
	}
	return created, nil
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
	return s.saleRepo.GetRecent(limit)
}

func (s *SaleService) CalculateInstallmentPlan(total, downPayment float64, months int) (*domain.InstallmentPlan, error) {
	if months <= 0 || total <= 0 {
		return nil, &domain.AppError{
			Module:  domain.ModuleSales,
			Code:    "INVALID_PARAMS",
			Message: "Invalid installment parameters",
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

	if payment.CustomerID != "" {
		return s.repo.CreatePayment(payment)
	}
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
