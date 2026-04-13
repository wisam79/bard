package domain

// ErrorModule represents the module where the error occurred
type ErrorModule string

const (
	ModuleStaff     ErrorModule = "STAFF"
	ModuleProduct   ErrorModule = "PRODUCT"
	ModuleCustomer  ErrorModule = "CUSTOMER"
	ModuleSales     ErrorModule = "SALES"
	ModulePayment   ErrorModule = "PAYMENT"
	ModuleFinance   ErrorModule = "FINANCE"
	ModuleInventory ErrorModule = "INVENTORY"
	ModuleDiscount  ErrorModule = "DISCOUNT"
	ModuleSettings  ErrorModule = "SETTINGS"
)

// AppError represents a unified application error
type AppError struct {
	Module  ErrorModule `json:"module"`
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Hint    string      `json:"hint,omitempty"`
	Field   string      `json:"field,omitempty"`
}

// Error implements the error interface
func (e *AppError) Error() string {
	if e.Hint != "" {
		return e.Message + ". " + e.Hint
	}
	return e.Message
}

// ToUserMessage returns a localized Arabic user-friendly message
func (e *AppError) ToUserMessage() string {
	switch e.Code {
	case "NOT_FOUND":
		return "لم يتم العثور على السجل المطلوب"
	case "DUPLICATE":
		return "هذا السجل موجود مسبقاً (" + e.Field + ")"
	case "VALIDATION_ERROR":
		return "بيانات غير صالحة: " + e.Message
	case "UNAUTHORIZED":
		return "غير مصرح لك بإجراء هذه العملية"
	case "INSUFFICIENT_STOCK":
		return "المخزون غير كافٍ. " + e.Hint
	case "INTERNAL_ERROR":
		return "حدث خطأ داخلي في النظام"
	case "SHIFT_REQUIRED":
		return "يجب فتح وردية (شفت) لتنفيذ هذه العملية"
	case "INVALID_PARAMS":
		return "المعاملات المدخلة غير صحيحة"
	default:
		return "حدث خطأ غير متوقع: " + e.Message
	}
}

// DashboardStats holds dashboard statistics
type DashboardStats struct {
	TodaySales  int64  `json:"todaySales"`
	TodayOrders    int          `json:"todayOrders"`
	MonthSales  int64  `json:"monthSales"`
	MonthOrders    int          `json:"monthOrders"`
	TotalProducts  int          `json:"totalProducts"`
	TotalCustomers int          `json:"totalCustomers"`
	TotalDebt  int64  `json:"totalDebt"`
	LowStockCount  int          `json:"lowStockCount"`
	TopProducts    []TopProduct `json:"topProducts"`
	RecentSales    []Sale       `json:"recentSales"`
}

// TopProduct represents a top-selling product
type TopProduct struct {
	ProductID   string  `json:"productId"`
	Name        string  `json:"name"`
	TotalQty  int64  `json:"totalQty"`
	TotalAmount  int64  `json:"totalAmount"`
}

// DatabaseExport represents exported database data
type DatabaseExport struct {
	Products    []Product      `json:"products"`
	Sales       []Sale         `json:"sales"`
	Customers   []Customer     `json:"customers"`
	Suppliers   []Supplier     `json:"suppliers"`
	Expenses    []Expense      `json:"expenses"`
	Staff       []Staff        `json:"staff"`
	Preferences AppPreferences `json:"preferences"`
}

// InstallmentPlanCalculation represents calculation result
type InstallmentPlanCalculation struct {
	TotalAmount  int64  `json:"totalAmount"`
	DownPayment  int64  `json:"downPayment"`
	MonthlyAmount  int64  `json:"monthlyAmount"`
	Months        int     `json:"months"`
	StartDate     string  `json:"startDate"`
}

// PaginatedResponse is a generic paginated response
type PaginatedResponse[T any] struct {
	Data       []T   `json:"data"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
	Page       int   `json:"page"`
}
