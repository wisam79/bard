package domain_test

import (
	"bard/internal/domain"
	"testing"
)

func TestAppError_Error(t *testing.T) {
	t.Run("error without hint", func(t *testing.T) {
		err := &domain.AppError{
			Module:  domain.ModuleProduct,
			Code:    "NOT_FOUND",
			Message: "Product not found",
		}
		
		if err.Error() != "Product not found" {
			t.Fatalf("Expected 'Product not found', got '%s'", err.Error())
		}
	})
	
	t.Run("error with hint", func(t *testing.T) {
		err := &domain.AppError{
			Module:  domain.ModuleProduct,
			Code:    "NOT_FOUND",
			Message: "Product not found",
			Hint:    "Check the product ID",
		}
		
		if err.Error() != "Product not found. Check the product ID" {
			t.Fatalf("Expected 'Product not found. Check the product ID', got '%s'", err.Error())
		}
	})
}

func TestAppError_ToUserMessage(t *testing.T) {
	tests := []struct {
		code     string
		message  string
		expected string
	}{
		{"NOT_FOUND", "test", "لم يتم العثور على السجل المطلوب"},
		{"DUPLICATE", "test", "هذا السجل موجود مسبقاً ()"},
		{"VALIDATION_ERROR", "بيانات غير صالحة", "بيانات غير صالحة: بيانات غير صالحة"},
		{"UNAUTHORIZED", "test", "غير مصرح لك بإجراء هذه العملية"},
		{"INSUFFICIENT_STOCK", "test", "المخزون غير كافٍ. "},
		{"INTERNAL_ERROR", "test", "حدث خطأ داخلي في النظام"},
		{"SHIFT_REQUIRED", "test", "يجب فتح وردية (شفت) لتنفيذ هذه العملية"},
		{"INVALID_PARAMS", "test", "المعاملات المدخلة غير صحيحة"},
		{"UNKNOWN_CODE", "حدث خطأ", "حدث خطأ غير متوقع: حدث خطأ"},
	}
	
	for _, tt := range tests {
		t.Run(tt.code, func(t *testing.T) {
			err := &domain.AppError{
				Module:  domain.ModuleProduct,
				Code:    tt.code,
				Message: tt.message,
			}
			
			msg := err.ToUserMessage()
			if msg != tt.expected {
				t.Fatalf("Expected '%s', got '%s'", tt.expected, msg)
			}
		})
	}
}

func TestAppError_WithField(t *testing.T) {
	err := &domain.AppError{
		Module:  domain.ModuleProduct,
		Code:    "VALIDATION_ERROR",
		Message: "Price is required",
		Field:   "price",
	}
	
	if err.Field != "price" {
		t.Fatalf("Expected field 'price', got '%s'", err.Field)
	}
}

func TestErrorModuleConstants(t *testing.T) {
	modules := []domain.ErrorModule{
		domain.ModuleStaff,
		domain.ModuleProduct,
		domain.ModuleCustomer,
		domain.ModuleSales,
		domain.ModulePayment,
		domain.ModuleFinance,
		domain.ModuleInventory,
		domain.ModuleDiscount,
		domain.ModuleSettings,
	}
	
	for _, module := range modules {
		if module == "" {
			t.Errorf("Module constant is empty")
		}
	}
}

func TestDashboardStats(t *testing.T) {
	stats := domain.DashboardStats{
		TodaySales:     1000.0,
		TodayOrders:    10,
		MonthSales:     30000.0,
		MonthOrders:    300,
		TotalProducts:  500,
		TotalCustomers: 200,
		TotalDebt: 5000,
		LowStockCount:  15,
		TopProducts: []domain.TopProduct{
			{ProductID: "p1", Name: "Product 1", TotalQty: 100, TotalAmount: 5000},
			{ProductID: "p2", Name: "Product 2", TotalQty: 80, TotalAmount: 4000},
		},
		RecentSales: []domain.Sale{
			{ID: "s1", Total: 500},
			{ID: "s2", Total: 750},
		},
	}
	
	if stats.TodaySales != 1000.0 {
		t.Errorf("Expected TodaySales 1000.0, got %d", stats.TodaySales)
	}
	
	if len(stats.TopProducts) != 2 {
		t.Errorf("Expected 2 top products, got %d", len(stats.TopProducts))
	}
	
	if len(stats.RecentSales) != 2 {
		t.Errorf("Expected 2 recent sales, got %d", len(stats.RecentSales))
	}
}

func TestTopProduct(t *testing.T) {
	product := domain.TopProduct{
		ProductID:   "prod-1",
		Name:        "Test Product",
		TotalQty:    150.0,
		TotalAmount: 7500,
	}
	
	if product.ProductID != "prod-1" {
		t.Errorf("Expected ProductID 'prod-1', got '%s'", product.ProductID)
	}
	
	if product.TotalQty != 150.0 {
		t.Errorf("Expected TotalQty 150.0, got %d", product.TotalQty)
	}
}

func TestPaginatedResponse(t *testing.T) {
	type TestItem struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	
	items := []TestItem{
		{ID: "1", Name: "Item 1"},
		{ID: "2", Name: "Item 2"},
		{ID: "3", Name: "Item 3"},
	}
	
	paginated := domain.PaginatedResponse[TestItem]{
		Data:       items,
		Total:      100,
		TotalPages: 10,
		Page:       1,
	}
	
	if len(paginated.Data) != 3 {
		t.Errorf("Expected 3 items, got %d", len(paginated.Data))
	}
	
	if paginated.Total != 100 {
		t.Errorf("Expected Total 100, got %d", paginated.Total)
	}
	
	if paginated.TotalPages != 10 {
		t.Errorf("Expected TotalPages 10, got %d", paginated.TotalPages)
	}
}

func TestDatabaseExport(t *testing.T) {
	export := domain.DatabaseExport{
		Products: []domain.Product{
			{ID: "p1", Name: "Product 1"},
		},
		Sales: []domain.Sale{
			{ID: "s1", Total: 100},
		},
		Customers: []domain.Customer{
			{ID: "c1", Name: "Customer 1"},
		},
		Suppliers: []domain.Supplier{
			{ID: "sup1", Name: "Supplier 1"},
		},
		Expenses: []domain.Expense{
			{ID: "e1", Amount: 500},
		},
		Staff: []domain.Staff{
			{ID: "staff1", Name: "Staff 1"},
		},
		Preferences: domain.AppPreferences{
			StoreName: "Test Store",
		},
	}
	
	if len(export.Products) != 1 {
		t.Errorf("Expected 1 product, got %d", len(export.Products))
	}
	
	if export.Preferences.StoreName != "Test Store" {
		t.Errorf("Expected StoreName 'Test Store', got '%s'", export.Preferences.StoreName)
	}
}

func TestInstallmentPlanCalculation(t *testing.T) {
	calc := domain.InstallmentPlanCalculation{
		TotalAmount: 1200,
		DownPayment:   200.0,
		MonthlyAmount: 100,
		Months:        10,
		StartDate:     "2024-01-01",
	}
	
	if calc.TotalAmount != 1200.0 {
		t.Errorf("Expected TotalAmount 1200.0, got %d", calc.TotalAmount)
	}
	
	if calc.Months != 10 {
		t.Errorf("Expected Months 10, got %d", calc.Months)
	}
}
