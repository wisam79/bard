# Bard POS API Documentation

## نظرة عامة

واجهة برمجة التطبيقات (API) لنظام Bard POS تستخدم بروتوكول Wails للربط بين الواجهة الأمامية والخلفية.

##.Base URL

```
http://localhost:5173 (Development)
```

## Authentication

### Login

تسجيل الدخول للحصول على جلسة المستخدم.

```http
POST /api/auth/login
```

**Parameters:**

| الاسم | النوع | الوصف |
|------|-------|-------|
| username | string | اسم المستخدم |
| password | string | كلمة المرور |

**Response:**

```json
{
  "id": "uuid",
  "username": "admin",
  "name": "المدير",
  "role": "admin",
  "isActive": true
}
```

---

## Products (المنتجات)

### Get Products

الحصول على قائمة المنتجات مع التقسيم على صفحات.

```go
func (a *App) GetProducts(page, limit int, search, category string) (*domain.PaginatedProducts, error)
```

**Parameters:**

| الاسم | النوع | الوصف |
|------|-------|-------|
| page | int | رقم الصفحة |
| limit | int | عدد العناصر في الصفحة |
| search | string | نص البحث |
| category | string | تصفية حسب الفئة |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "قهوة تركية",
      "barcode": "1000001",
      "price": 5000,
      "cost": 3000,
      "stock": 45,
      "minStock": 10,
      "category": "مشروبات"
    }
  ],
  "total": 100,
  "totalPages": 5,
  "page": 1,
  "stats": {
    "totalStock": 5000,
    "totalValue": 250000,
    "totalCost": 150000,
    "profit": 100000
  }
}
```

### Get Product by ID

الحصول على منتج واحد بالمعرف.

```go
func (a *App) GetProduct(id string) (*domain.Product, error)
```

### Get Product by Barcode

الحصول على منتج بالباركود.

```go
func (a *App) GetProductByBarcode(barcode string) (*domain.Product, error)
```

### Create Product

إنشاء منتج جديد.

```go
func (a *App) CreateProduct(product domain.Product) error
```

**Example:**

```json
{
  "name": "قهوة تركية",
  "barcode": "1000001",
  "price": 5000,
  "cost": 3000,
  "stock": 45,
  "minStock": 10,
  "category": "مشروبات"
}
```

### Update Product

تحديث منتج موجود.

```go
func (a *App) UpdateProduct(product domain.Product) error
```

### Delete Product

حذف منتج.

```go
func (a *App) DeleteProduct(id string) error
```

### Search Products

البحث عن منتجات.

```go
func (a *App) SearchProducts(query string, limit int) ([]domain.Product, error)
```

---

## Sales (المبيعات)

### Get Sales

الحصول على قائمة المبيعات.

```go
func (a *App) GetSales(page, limit int, search, status string) (*domain.PaginatedSales, error)
```

**Parameters:**

| الاسم | النوع | الوصف |
|------|-------|-------|
| page | int | رقم الصفحة |
| limit | int | عدد العناصر |
| search | string | البحث |
| status | string | الحالة (completed, pending, return) |

### Get Sale by ID

الحصول على فاتورة واحدة.

```go
func (a *App) GetSale(id string) (*domain.Sale, error)
```

### Create Sale

إنشاء عملية بيع جديدة.

```go
func (a *App) CreateSale(sale domain.Sale) error
```

**Example:**

```json
{
  "customerId": "uuid",
  "customerName": "أحمد",
  "staffId": "uuid",
  "staffName": "المدير",
  "paymentMethod": "cash",
  "items": [
    {
      "productId": "uuid",
      "name": "قهوة تركية",
      "price": 5000,
      "quantity": 2,
      "total": 10000
    }
  ],
  "discount": 0,
  "vat": 0,
  "total": 10000
}
```

### Process Return

معالجة المرتجع الكامل.

```go
func (a *App) ProcessReturn(saleID string) (*domain.Sale, error)
```

### Get Parked Sales

الحصول على المبيعات المتوقفة.

```go
func (a *App) GetParkedSales() ([]domain.ParkedSale, error)
```

### Park Sale

إيقاف عملية بيع مؤقتاً.

```go
func (a *App) ParkSale(parked domain.ParkedSale) error
```

### Calculate Installment Plan

حساب خطة التقسيط.

```go
func (a *App) CalculateInstallmentPlan(total, downPayment float64, months int) (*domain.InstallmentPlan, error)
```

---

## Customers (العملاء)

### Get Customers

الحصول على قائمة العملاء.

```go
func (a *App) GetCustomers(page, limit int, search string) ([]domain.Customer, int64, error)
```

### Get Customer by ID

الحصول على عميل واحد.

```go
func (a *App) GetCustomer(id string) (*domain.Customer, error)
```

### Create Customer

إنشاء عميل جديد.

```go
func (a *App) CreateCustomer(customer domain.Customer) error
```

### Update Customer

تحديث بيانات عميل.

```go
func (a *App) UpdateCustomer(customer domain.Customer) error
```

### Delete Customer

حذف عميل.

```go
func (a *App) DeleteCustomer(id string) error
```

### Search Customer by Phone

البحث عن عميل بالهاتف.

```go
func (a *App) SearchCustomerByPhone(phone string) (*domain.Customer, error)
```

---

## Finance (المالية)

### Get Expenses

الحصول على المصروفات.

```go
func (a *App) GetExpenses(page, limit int, category string) ([]domain.Expense, int64, error)
```

### Create Expense

إنشاء مصروف جديد.

```go
func (a *App) CreateExpense(expense domain.Expense) error
```

### Update Expense

تحديث مصروف.

```go
func (a *App) UpdateExpense(expense domain.Expense) error
```

### Delete Expense

حذف مصروف.

```go
func (a *App) DeleteExpense(id string) error
```

### Create Payment

إنشاء دفعة.

```go
func (a *App) CreatePayment(payment domain.Payment) error
```

### Get Payments

الحصول على المدفوعات لعملية بيع.

```go
func (a *App) GetPayments(saleID string) ([]domain.Payment, error)
```

---

## Staff (الموظفين)

### Get Staff

الحصول على قائمة الموظفين.

```go
func (a *App) GetStaff() ([]domain.Staff, error)
```

### Create Staff

إنشاء موظف جديد.

```go
func (a *App) CreateStaff(staff domain.Staff) error
```

### Update Staff

تحديث موظف.

```go
func (a *App) UpdateStaff(staff domain.Staff) error
```

### Delete Staff

حذف موظف.

```go
func (a *App) DeleteStaff(id string) error
```

---

## Settings (الإعدادات)

### Get Preferences

الحصول على إعدادات التطبيق.

```go
func (a *App) GetPreferences() (*domain.AppPreferences, error)
```

### Update Preferences

تحديث إعدادات التطبيق.

```go
func (a *App) UpdatePreferences(prefs domain.AppPreferences) error
```

### Export Database

تصدير قاعدة البيانات.

```go
func (a *App) ExportDatabase() (*domain.DatabaseExport, error)
```

### Import Database

استيراد قاعدة البيانات.

```go
func (a *App) ImportDatabase(data domain.DatabaseExport) error
```

### Reset Database

إعادة تعيين قاعدة البيانات.

```go
func (a *App) ResetDatabase() error
```

---

## Shifts (الورديات)

### Get Shifts

الحصول على الورديات.

```go
func (a *App) GetShifts(page, limit int) ([]domain.Shift, int64, error)
```

### Get Active Shift

الحصول على الوردية النشطة.

```go
func (a *App) GetActiveShift(staffID string) (*domain.Shift, error)
```

### Start Shift

بدء وردية جديدة.

```go
func (a *App) StartShift(staffID, staffName string, startCash float64) (*domain.Shift, error)
```

### Close Shift

إغلاق وردية.

```go
func (a *App) CloseShift(shiftID string, endCash float64) (*domain.Shift, error)
```

### Add Cash Movement

إضافة حركة نقدية.

```go
func (a *App) AddCashMovement(shiftID, staffID, movementType, reason string, amount float64) error
```

---

## Suppliers (الموردين)

### Get Suppliers

الحصول على قائمة الموردين.

```go
func (a *App) GetSuppliers() ([]domain.Supplier, error)
```

### Create Supplier

إنشاء مورد جديد.

```go
func (a *App) CreateSupplier(supplier domain.Supplier) error
```

### Update Supplier

تحديث مورد.

```go
func (a *App) UpdateSupplier(supplier domain.Supplier) error
```

### Delete Supplier

حذف مورد.

```go
func (a *App) DeleteSupplier(id string) error
```

---

## Purchase Orders (أوامر الشراء)

### Get Purchase Orders

الحصول على أوامر الشراء.

```go
func (a *App) GetPurchaseOrders(page, limit int, status string) (*domain.PaginatedResponse[domain.PurchaseOrder], error)
```

### Create Purchase Order

إنشاء أمر شراء.

```go
func (a *App) CreatePurchaseOrder(order domain.PurchaseOrder) error
```

### Receive Purchase Order

استلام أمر الشراء.

```go
func (a *App) ReceivePurchaseOrder(id string) error
```

---

## Dashboard (لوحة التحكم)

### Get Dashboard Stats

الحصول على إحصائيات لوحة التحكم.

```go
func (a *App) GetDashboardStats() (*domain.DashboardStats, error)
```

**Response:**

```json
{
  "todaySales": 150000,
  "todayOrders": 25,
  "monthSales": 4500000,
  "monthOrders": 750,
  "totalProducts": 150,
  "totalCustomers": 200,
  "totalDebt": 500000,
  "lowStockCount": 5,
  "topProducts": [
    {
      "productId": "uuid",
      "name": "قهوة تركية",
      "totalQty": 100,
      "totalAmount": 500000
    }
  ],
  "recentSales": []
}
```

---

## Roles and Permissions

### الأدوار المتاحة

| الدور | الوصف |
|------|-------|
| admin | مدير النظام - جميع الصلاحيات |
| manager | مدير المحل - صلاحيات متعددة |
| cashier | كاشير - عمليات البيع فقط |
| viewer | مراقب - عرض فقط |

### صلاحيات الأدوار

**Admin:**
- جميع الصلاحيات

**Manager:**
- عرض وإدارة المبيعات والمنتجات والعملاء
- عرض التقارير والتصدير
- إدارة الموردين وأوامر الشراء

**Cashier:**
- عمليات البيع والشراء
- إدارة العملاء الأساسية

**Viewer:**
- عرض التقارير والمنتجات والعملاء فقط

---

## Error Responses

### أنواع الأخطاء

```json
{
  "module": "PRODUCT",
  "code": "NOT_FOUND",
  "message": "المنتج غير موجود",
  "field": "id"
}
```

### رموز الأخطاء

| الكود | الوصف |
|-------|-------|
| NOT_FOUND | السجل غير موجود |
| DUPLICATE | السجل مكرر |
| VALIDATION_ERROR | خطأ في التحقق |
| UNAUTHORIZED | غير مصرح |
| INSUFFICIENT_STOCK | مخزون غير كافٍ |
| INTERNAL_ERROR | خطأ داخلي |
| SHIFT_REQUIRED | يجب فتح وردية |
