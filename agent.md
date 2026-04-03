# AI AGENT STRICT DIRECTIVES: Bard POS v3.0 - Wails Desktop Application

## 0. CORE DIRECTIVE (ANTI-HALLUCINATION PROTOCOL)

### 0.1 NO ASSUMPTIONS
- **You are an expert Wails v2 Developer** with deep knowledge of Go, React/TypeScript, and SQLite
- **If unsure about ANY API, package, or structure:** STOP and ask the user for clarification
- **NEVER hallucinate:** Do not invent Wails APIs, Go packages, or project structures

### 0.2 TECHNOLOGY BOUNDARIES
- **NO Web APIs:** This is a NATIVE desktop application
  - ❌ NO `window.localStorage`, `IndexedDB`, `sessionStorage`
  - ❌ NO `fetch`, `axios`, REST APIs for local data
  - ❌ NO `window.print()` - use Go-based printing
- **NO Partial Code:** ALWAYS output FULL functions/components. NEVER use placeholders like `// ... rest of code`

### 0.3 PROJECT CONTEXT
- **Application:** Bard POS v3.0 (Stable Release)
- **Type:** Offline-first Point of Sale & Inventory Management
- **Architecture:** Clean Architecture (Domain → Repository → Service → Handler)
- **Database:** SQLite stored in `%APPDATA%/BardPOS/bard.db`
- **Languages:** Arabic (default) + English
- **Test Coverage:** 400+ tests (ALL MUST PASS)

---

## 1. TECH STACK LOCK-IN

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Wails v2 | 2.11.0+ |
| **Backend** | Go | 1.24.0+ |
| **Frontend** | React 18 + TypeScript | 5.x (Vite) |
| **Database** | SQLite | glebarez/gorm |
| **ORM** | GORM | 1.31.1+ |
| **State** | Zustand | Latest |
| **Query** | TanStack Query | Latest |
| **Styling** | Tailwind CSS | 3.x |
| **Testing** | Vitest + Playwright | Latest |

### 1.1 Project Structure (FIXED)
```
bard/
├── main.go                      # Wails bootstrap
├── internal/
│   ├── domain/                  # Entities (Product, Sale, Customer, etc.)
│   ├── repository/              # Interfaces + SQLite implementation
│   ├── service/                 # Business logic
│   ├── handler/                 # Wails bindings (App struct)
│   ├── middleware/              # Auth, Rate limiting, RBAC
│   ├── crypto/                  # AES-256-GCM encryption
│   ├── cache/                   # In-memory caching with TTL
│   ├── audit/                   # Audit trail logging
│   └── logger/                  # Structured logging
├── frontend/
│   ├── src/
│   │   ├── components/          # UI + Feature components
│   │   ├── pages/               # Dashboard, Sales, Products, etc.
│   │   ├── store/               # Zustand stores
│   │   ├── hooks/               # Custom hooks (useCart, etc.)
│   │   ├── services/            # API wrappers
│   │   ├── types/               # TypeScript types
│   │   └── i18n/                # Arabic/English translations
│   └── tests/e2e/               # Playwright tests
└── docs/                        # Documentation
```

---

## 2. STRICT BACKEND RULES (GO)

### 2.1 Context Management (CRITICAL)
```go
// ✅ CORRECT: Store context on startup
type App struct {
    ctx context.Context
    // ... other fields
}

func (a *App) Startup(ctx context.Context) {
    a.ctx = ctx  // MUST store this
    a.log.Info("Application started")
}

// ✅ CORRECT: Use saved context for Wails runtime
func (a *App) OpenFileDialog() (string, error) {
    dialog, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
        Title: "Select File",
    })
    return dialog, err
}

// ❌ WRONG: Do NOT use context.Background() for Wails runtime
func (a *App) BadExample() {
    dialog, err := runtime.OpenFileDialog(context.Background(), ...)  // NEVER DO THIS
}
```

### 2.2 Return Signatures (MANDATORY)
```go
// ✅ CORRECT: Every bound method returns (data, error)
func (a *App) GetProducts(page, limit int, search, category string) (*domain.PaginatedProducts, error)
func (a *App) CreateSale(sale domain.Sale) error
func (a *App) Login(username, password string) (*domain.Staff, error)

// ❌ WRONG: NEVER return only error or only data
func (a *App) BadExample1() { /* no return */ }
func (a *App) BadExample2() (*domain.Product, /* no error */) { }
```

### 2.3 Error Handling (CRITICAL)
```go
// ✅ CORRECT: Return explicit errors
func (s *SaleService) Create(sale *domain.Sale) error {
    if err := ValidateSale(sale); err != nil {
        return err  // Return validation error
    }
    if err := s.saleRepo.Create(sale); err != nil {
        return errors.Wrap(domain.ModuleSales, err, "Failed to create sale")
    }
    return nil
}

// ❌ WRONG: NEVER use panic or log.Fatal
func (s *Service) BadExample() {
    panic("something went wrong")  // WILL CRASH THE APP
    log.Fatal("error")             // WILL CRASH THE APP
}

// ✅ CORRECT: Use domain-specific errors
return &domain.AppError{
    Module:  domain.ModuleSales,
    Code:    "INSUFFICIENT_STOCK",
    Message: "المخزون غير كافٍ",
    Hint:    "الكمية المطلوبة: 10, المتوفر: 5",
}
```

### 2.4 Database Rules
```go
// ✅ CORRECT: Use transactions for data consistency
func (s *SaleService) Create(sale *domain.Sale) error {
    return s.db.Transaction(func(tx *gorm.DB) error {
        // 1. Check stock
        // 2. Deduct stock
        // 3. Create sale
        // 4. Update customer debt (if credit)
        // All or nothing
    })
}

// ✅ CORRECT: Use parameterized queries
db.Where("id = ?", productID).First(&product)
db.Where("name LIKE ?", "%"+search+"%").Find(&products)

// ❌ WRONG: NEVER use string concatenation for SQL
db.Where("id = " + productID)  // SQL INJECTION RISK
```

### 2.5 Business Logic Boundaries
```go
// ✅ CORRECT: Complex calculations in Go
func (s *SaleService) CalculateInstallmentPlan(total, downPayment float64, months int) (*domain.InstallmentPlan, error) {
    remaining := total - downPayment
    monthlyAmount := math.Round(remaining/float64(months)*100) / 100
    // ... calculation logic
    return plan, nil
}

// ❌ WRONG: Do NOT put business logic in frontend
// Frontend only displays results, Go calculates them
```

---

## 3. STRICT FRONTEND RULES (TYPESCRIPT + REACT)

### 3.1 Wails Bridge Communication
```typescript
// ✅ CORRECT: Use ONLY auto-generated bindings
import { GetProducts, CreateSale } from '@/wailsjs/go/main/App';

async function loadProducts() {
    try {
        const result = await GetProducts(1, 20, '', '');
        return result;
    } catch (error) {
        console.error('Failed to load products:', error);
        throw error;
    }
}

// ❌ WRONG: NEVER use fetch/axios for backend calls
async function BadExample() {
    const response = await fetch('/api/products');  // DOES NOT EXIST
}
```

### 3.2 Async/Await Protocol
```typescript
// ✅ CORRECT: Every backend call in try/catch
async function createSale(sale: Sale) {
    try {
        await CreateSale(sale);
        showToast('تمت العملية بنجاح');
    } catch (error) {
        const appError = error as AppError;
        showToast(appError.message || 'حدث خطأ');
        throw error;  // Re-throw for caller handling
    }
}

// ❌ WRONG: NEVER call backend without error handling
async function BadExample() {
    await CreateSale(sale);  // No try/catch
}
```

### 3.3 State Management (Zustand)
```typescript
// ✅ CORRECT: Frontend is a "dumb view"
const useCartStore = create((set, get) => ({
    cart: [] as CartItem[],
    addToCart: (product: Product) => {
        // Simple state update
        set((state) => ({
            cart: [...state.cart, { product, qty: 1 }]
        }));
    },
    // Complex calculations in Go, not here
}));

// ❌ WRONG: Do NOT put business logic in stores
const BadStore = create(() => ({
    calculateTax: (amount) => amount * 0.15,  // Should be in Go
}));
```

### 3.4 Native App Styling
```css
/* ✅ CORRECT: Prevent text selection */
* {
    user-select: none;
    -webkit-user-select: none;
}

/* ✅ CORRECT: Disable context menu */
.no-context-menu {
    context-menu: none;
}

/* ✅ CORRECT: RTL support */
[dir="rtl"] {
    direction: rtl;
    text-align: right;
}
```

### 3.5 TypeScript Types
```typescript
// ✅ CORRECT: Mirror Go domain types exactly
interface Product {
    id: string;
    name: string;
    barcode: string;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    category: string;
    createdAt: string;
    updatedAt: string;
}

// ❌ WRONG: Do NOT use 'any'
interface BadProduct {
    id: any;  // Should be string
    price: any;  // Should be number
}
```

---

## 4. CODE GENERATION PROTOCOL (STEP-BY-STEP)

### 4.1 Feature Request Workflow
When user requests a feature (e.g., "Add Purchase Order screen"):

#### Step 1: Plan (REQUIRED)
```markdown
**Plan:**
1. Backend:
   - Add PurchaseOrder entity to `internal/domain/purchase_order.go`
   - Add repository interface to `internal/repository/interfaces.go`
   - Implement repository in `internal/repository/sqlite/purchase_order_repo.go`
   - Add service layer in `internal/service/purchase_order_service.go`
   - Add handler methods to `internal/handler/app.go`

2. Frontend:
   - Add TypeScript types to `frontend/src/types/index.ts`
   - Add service wrapper to `frontend/src/services/purchaseOrderService.ts`
   - Create page component `frontend/src/pages/PurchaseOrders.tsx`
   - Add route to `frontend/src/App.tsx`

3. Tests:
   - Add service tests
   - Add component tests
   - Add E2E tests
```

#### Step 2: Backend First (MANDATORY)
```go
// Write ALL Go code first
// Include:
// - Domain entity
// - Repository interface + implementation
// - Service layer
// - Handler (bound method)
// - Error handling
// - Validation
// - Transaction safety
```

#### Step 3: Generate Bindings (REMINDER)
```bash
# Remind user to run:
wails generate module
```

#### Step 4: Frontend Second
```typescript
// Write TypeScript code
// Import ONLY from wailsjs/go/...
// Include:
// - Types
// - Service wrapper
// - Component
// - Error handling
// - Loading states
// - Arabic translations
```

#### Step 5: Tests (REQUIRED)
```go
// Add tests for:
// - Service layer
// - Validation
// - Edge cases
```

---

## 5. POS-SPECIFIC LOGIC (BOUNDARIES)

### 5.1 Barcode Scanner
```typescript
// ✅ CORRECT: Treat as keyboard input
<input
    autoFocus
    onKeyDown={(e) => {
        if (e.key === 'Enter') {
            handleBarcodeScan(e.currentTarget.value);
        }
    }}
/>

// Backend lookup
func (a *App) GetProductByBarcode(barcode string) (*domain.Product, error) {
    return a.products.GetByBarcode(barcode)
}
```

### 5.2 Receipt Printing
```go
// ✅ CORRECT: Use Go for printing
func (a *App) PrintReceipt(saleID string) error {
    // 1. Generate receipt HTML/PDF
    // 2. Send to OS printer
    // 3. Return error if failed
    receipt, err := a.sales.GetByID(saleID)
    if err != nil {
        return err
    }
    // Use OS print command or PDF generation
    return printToThermalPrinter(receipt)
}

// ❌ WRONG: Do NOT use window.print()
```

### 5.3 Cash Drawer Control
```go
// ✅ CORRECT: Control via Go
func (a *App) OpenCashDrawer() error {
    // Send ESC/POS command to printer
    // Or trigger USB relay
    return nil
}
```

### 5.4 Offline-First Design
```go
// ✅ CORRECT: All data stored locally
// - Database: %APPDATA%/BardPOS/bard.db
// - No cloud dependencies
// - No internet required
// - Backup/export for data portability
```

---

## 6. ARABIC-FIRST SUPPORT (RTL)

### 6.1 Layout Requirements
```css
/* ✅ CORRECT: RTL by default */
:root {
    direction: rtl;
    text-align: right;
}

/* Arabic font */
body {
    font-family: 'Yamamah', 'Rubik', sans-serif;
}
```

### 6.2 Localization
```typescript
// ✅ CORRECT: Use i18n for all text
const t = useTranslation();
<h1>{t('dashboard.title')}</h1>

// Translations in frontend/src/i18n/index.ts
export const ar = {
    'dashboard.title': 'لوحة المعلومات',
    'sales.create': 'إنشاء بيع',
};

export const en = {
    'dashboard.title': 'Dashboard',
    'sales.create': 'Create Sale',
};
```

### 6.3 Number Formatting
```typescript
// ✅ CORRECT: Arabic-Indic digits
function formatNumber(num: number): string {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/\d/g, d => arabicDigits[d]);
}

// Backend: Use Iraqi locale
func formatCurrency(amount float64) string {
    return fmt.Sprintf("%s د.ع", formatNumberIQD(amount))
}
```

### 6.4 Date Handling
```go
// ✅ CORRECT: Support both Gregorian and Hijri
func formatDate(date time.Time, format string) string {
    if format == "hijri" {
        // Convert to Hijri
        return hijriDate.Format("02-01-1445")
    }
    return date.Format("2006-01-02")
}
```

---

## 7. PERFORMANCE GUIDELINES

### 7.1 Pagination (MANDATORY)
```go
// ✅ CORRECT: All lists paginated
func (s *ProductService) GetAll(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
    // Validate: page >= 1, limit <= 100
    page, limit = ValidatePagination(page, limit)
    return s.repo.GetAll(page, limit, search, category)
}

// Frontend: Infinite scroll or page numbers
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(...)
```

### 7.2 Caching
```go
// ✅ CORRECT: Cache frequently accessed data
type DashboardCache struct {
    *cache.Cache
}

func (c *DashboardCache) GetDashboardStats() (interface{}, bool) {
    return c.Get("dashboard:stats")  // TTL: 5 minutes
}

// Invalidate on data changes
func (s *ProductService) Create(product *domain.Product) error {
    // ... create logic
    s.cache.InvalidateDashboardStats()  // Clear cache
}
```

### 7.3 Debouncing
```typescript
// ✅ CORRECT: Debounce search inputs
const debouncedSearch = useMemo(() => 
    debounce((query: string) => {
        searchProducts(query);
    }, 300),
[]);

// ❌ WRONG: No debounce
<input onChange={(e) => search(e.target.value)} />  // Fires on every keystroke
```

### 7.4 Database Optimization
```go
// ✅ CORRECT: Use indexes
type Product struct {
    ID       string `gorm:"primaryKey"`
    Barcode  string `gorm:"uniqueIndex"`  // Indexed
    Category string `gorm:"index"`        // Indexed
}

// ✅ CORRECT: Use transactions
db.Transaction(func(tx *gorm.DB) error {
    // Multiple operations
})

// ✅ CORRECT: Preload associations
db.Preload("Items").Find(&sales)
```

---

## 8. SECURITY REQUIREMENTS

### 8.1 Password Hashing
```go
// ✅ CORRECT: Use bcrypt
func HashPassword(password string) (string, error) {
    return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}

func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

// ❌ WRONG: NEVER store plain text
type Staff struct {
    Password string  // MUST be hashed
}
```

### 8.2 Rate Limiting
```go
// ✅ CORRECT: Limit authentication attempts
type RateLimiter struct {
    attempts map[string][]time.Time
    max      int
    window   time.Duration
}

func (rl *RateLimiter) Allow(userID string) bool {
    // Check attempts in window
    // Block if exceeded
}

// Apply to login
func (a *App) Login(username, password string) (*domain.Staff, error) {
    if !a.rateLimiter.Allow(username) {
        return nil, errors.NewTooManyAttempts()
    }
    // ... authenticate
}
```

### 8.3 Input Validation
```go
// ✅ CORRECT: Validate ALL inputs
func ValidateProduct(p *domain.Product) error {
    if p.Name == "" {
        return errors.NewValidationError("name", "الاسم مطلوب")
    }
    if p.Barcode == "" {
        return errors.NewValidationError("barcode", "الباركود مطلوب")
    }
    if p.Price < 0 {
        return errors.NewValidationError("price", "السعر لا يمكن أن يكون سالباً")
    }
    return nil
}

// Frontend: ALSO validate (defense in depth)
if (!product.name.trim()) {
    throw new Error('الاسم مطلوب');
}
```

### 8.4 RBAC (Role-Based Access Control)
```go
// ✅ CORRECT: Check permissions
func (a *App) DeleteProduct(id string) error {
    user := a.getCurrentUser()
    if !user.HasPermission("delete:product") {
        return errors.NewUnauthorized()
    }
    return a.products.Delete(id)
}

// Frontend: Hide unauthorized buttons
{authStore.can('delete:product') && (
    <Button onClick={handleDelete}>حذف</Button>
)}
```

### 8.5 Audit Trail
```go
// ✅ CORRECT: Log sensitive operations
func (s *AuditService) LogAction(ctx context.Context, action, entityType, entityID, staffID, details string) {
    auditLog := &AuditLog{
        Timestamp:  time.Now(),
        StaffID:    staffID,
        Action:     action,
        EntityType: entityType,
        EntityID:   entityID,
        Details:    details,
    }
    s.repo.Create(auditLog)
}

// Use for: Delete, Export, Void Sale, Password Change, Settings Change
```

---

## 9. TESTING REQUIREMENTS

### 9.1 Backend Tests (MANDATORY)
```go
// ✅ CORRECT: Test every service function
func TestProductService_Create(t *testing.T) {
    mockRepo := new(mocks.MockProductRepository)
    svc := NewProductService(mockRepo, log)
    
    product := &domain.Product{
        Name:    "Test",
        Barcode: "123",
        Price:   100,
    }
    
    mockRepo.On("Create", product).Return(nil)
    
    err := svc.Create(product)
    assert.NoError(t, err)
    assert.NotEmpty(t, product.ID)
    mockRepo.AssertExpectations(t)
}

// Test coverage MUST include:
// - Happy path
// - Validation errors
// - Database errors
// - Edge cases (zero values, negative values, empty strings)
```

### 9.2 Frontend Tests (MANDATORY)
```typescript
// ✅ CORRECT: Test components and hooks
describe('useCart', () => {
    it('adds product to cart', () => {
        const { result } = renderHook(() => useCart());
        
        act(() => {
            result.current.addToCart(mockProduct);
        });
        
        expect(result.current.cart).toHaveLength(1);
    });
    
    it('handles large quantities', () => {
        // Edge case testing
    });
    
    it('maintains state consistency', () => {
        // State integrity testing
    });
});
```

### 9.3 E2E Tests (CRITICAL WORKFLOWS)
```typescript
// ✅ CORRECT: Test complete workflows
test('complete cash sale workflow', async ({ page }) => {
    await login(page);
    await navigateToPOS(page);
    await addProductToCart(page);
    await checkout(page, 'cash');
    await verifyReceipt(page);
});

// Test:
// - Login/Logout
// - Create Sale
// - Create Product
// - Create Customer
// - Process Return
// - Generate Report
```

### 9.4 Test Execution
```bash
# Backend: Run ALL tests
go test ./... -v -count=1

# Frontend: Run ALL tests
cd frontend && npm test -- --run

# E2E: Run Playwright tests
cd frontend && npx playwright test

# Coverage
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### 9.5 Test Quality Standards
```
✅ ALL tests MUST pass (0 failures)
✅ Tests MUST be deterministic (no flakiness)
✅ Tests MUST be isolated (no dependencies)
✅ Tests MUST be fast (< 10 seconds total)
✅ Coverage MUST be > 80% for critical paths
```

---

## 10. BUG FIX PROTOCOL

### 10.1 When Fixing Bugs
```markdown
1. **Identify Root Cause:**
   - Read error logs
   - Reproduce the issue
   - Understand the flow

2. **Write Test First:**
   - Create test that reproduces the bug
   - Verify test fails
   - This prevents regression

3. **Fix the Bug:**
   - Minimal change
   - No side effects
   - Handle edge cases

4. **Verify Fix:**
   - Test passes
   - No other tests break
   - Manual testing confirms fix

5. **Document:**
   - Add to BUG_FIXES.md
   - Comment complex fixes
   - Update changelog
```

### 10.2 Common Bug Patterns
```go
// ❌ Bug: Division by zero
ratio := returnTotal / original.Total  // original.Total could be 0

// ✅ Fix: Add check
if original.Total != 0 {
    ratio := returnTotal / math.Abs(original.Total)
}

// ❌ Bug: Nil pointer dereference
user := ctx.Value(UserKey).(*domain.Staff)  // Could be nil

// ✅ Fix: Check first
user, ok := ctx.Value(UserKey).(*domain.Staff)
if !ok || user == nil {
    return nil, errors.NewUnauthorized()
}

// ❌ Bug: Race condition
product.Stock -= quantity  // Non-atomic

// ✅ Fix: Use atomic SQL
db.Model(&Product{}).Where("id = ?", id).
    UpdateColumn("stock", gorm.Expr("stock - ?", quantity))
```

---

## 11. DOCUMENTATION REQUIREMENTS

### 11.1 Code Comments
```go
// ✅ CORRECT: Comment complex business logic
// Calculate weighted average cost after receiving purchase order
// Formula: (currentStock * currentCost + newQty * newCost) / (currentStock + newQty)
newTotalCost := (float64(product.Stock) * product.Cost) + (item.Qty * item.Cost)
newCost := newTotalCost / (float64(product.Stock) + item.Qty)

// ❌ WRONG: Don't comment obvious code
product.Stock = 10  // Set stock to 10
```

### 11.2 API Documentation
```go
// GetDashboardStats returns statistics for the dashboard
// including total sales, revenue, customers, products, and low stock alerts
//
// Returns:
//   - *domain.DashboardStats: Statistics object
//   - error: If database query fails
//
// Example:
//   stats, err := app.GetDashboardStats()
//   if err != nil {
//       log.Error(err)
//   }
func (a *App) GetDashboardStats() (*domain.DashboardStats, error)
```

### 11.3 Change Documentation
```markdown
# IMPROVEMENTS.md

## [3.0.1] - 2026-04-03

### Fixed
- Bug #4: Division by zero in partial returns
- Bug #6: Staff password reset vulnerability
- Bug #8: Customer debt overwrite on partial update

### Added
- 100+ comprehensive integration tests
- 20+ real-world scenario tests
- Performance tests for large carts

### Changed
- Improved error messages in Arabic
- Enhanced validation for negative values
```

---

## 12. DEPLOYMENT CHECKLIST

### 12.1 Pre-Release
```markdown
□ ALL tests pass (go test ./... && npm test -- --run)
□ No linting errors (golangci-lint run && npm run lint)
□ Build succeeds (wails build)
□ Database migrations tested
□ Backup/restore tested
□ Print functionality tested
□ Barcode scanner tested
□ RTL layout verified
□ Arabic translations complete
□ Performance acceptable (< 1s for common operations)
```

### 12.2 Build Commands
```bash
# Development
wails dev

# Production build
wails build -platform windows/amd64

# Verify build
./build/bin/bard.exe

# Check binary size
ls -lh build/bin/
```

### 12.3 Distribution
```
✅ Executable: bard.exe
✅ Database: Auto-created in %APPDATA%/BardPOS/
✅ Config: Stored in same directory
✅ Logs: Stored in same directory
✅ No external dependencies required
```

---

## 13. SUPPORT & MAINTENANCE

### 13.1 Logging
```go
// ✅ CORRECT: Structured logging
log.Info("Creating sale", "id", sale.ID, "total", sale.Total)
log.Error("Failed to create sale", "error", err)
log.Warn("Low stock alert", "product", product.Name, "stock", product.Stock)

// Log levels:
// - Info: Normal operations
// - Warn: Recoverable issues
// - Error: Failures requiring attention
// - Audit: Security-sensitive operations
```

### 13.2 Monitoring
```go
// Track:
// - Failed login attempts
// - Database errors
// - Stock alerts
// - Shift discrepancies
// - Export/import operations

// Alert on:
// - Multiple failed logins (security)
// - Database corruption (critical)
// - Negative stock (data integrity)
// - Large voids/returns (fraud detection)
```

### 13.3 Backup Strategy
```go
// ✅ CORRECT: Automatic backups
func (s *SettingsService) CreateBackup() error {
    // 1. Export database to JSON
    // 2. Compress with timestamp
    // 3. Store in backup directory
    // 4. Keep last 30 backups
    // 5. Delete older backups
}

// Manual backup: Settings → Export Database
// Auto backup: Daily at 2:00 AM
```

---

## 14. QUICK REFERENCE

### 14.1 Common Patterns
```go
// Service pattern
type ProductService struct {
    repo repository.ProductRepository
    log  *logger.Logger
}

func NewProductService(repo repository.ProductRepository, log *logger.Logger) *ProductService {
    return &ProductService{repo: repo, log: log}
}

// Handler pattern
func (a *App) GetProducts(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
    return a.products.GetAll(page, limit, search, category)
}
```

```typescript
// Component pattern
function Products() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['products', page, limit],
        queryFn: () => GetProducts(page, limit, search, category),
    });
    
    if (isLoading) return <Skeleton />;
    if (error) return <Error message={error.message} />;
    
    return <ProductGrid products={data.data} />;
}
```

### 14.2 Error Codes
```go
// Common error codes
"NOT_FOUND"           // Resource not found
"DUPLICATE"           // Unique constraint violation
"VALIDATION_ERROR"    // Invalid input
"UNAUTHORIZED"        // Authentication required
"FORBIDDEN"           // Insufficient permissions
"INSUFFICIENT_STOCK"  // Not enough inventory
"INTERNAL_ERROR"      // Server error
"TOO_MANY_ATTEMPTS"   // Rate limited
```

### 14.3 Module Paths
```go
// Backend imports
import (
    "bard/internal/domain"
    "bard/internal/repository"
    "bard/internal/service"
    "bard/internal/logger"
    "bard/internal/errors"
)
```

```typescript
// Frontend imports
import { GetProducts } from '@/wailsjs/go/main/App';
import type { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
```

---

## 15. FINAL CHECKLIST

Before generating ANY code, verify:

- [ ] Am I using the correct Wails v2 API?
- [ ] Did I store the context on startup?
- [ ] Does every bound method return (data, error)?
- [ ] Am I using parameterized SQL queries?
- [ ] Is error handling explicit (no panic/log.Fatal)?
- [ ] Am I using the Wails bridge (not fetch/axios)?
- [ ] Is every backend call wrapped in try/catch?
- [ ] Is business logic in Go (not frontend)?
- [ ] Are tests included?
- [ ] Is Arabic RTL support implemented?
- [ ] Are types mirrored correctly (Go ↔ TypeScript)?
- [ ] Is the code complete (no placeholders)?

**If ANY answer is NO, STOP and ask for clarification.**

---

**Version:** 3.0.0  
**Last Updated:** April 2026  
**Maintained By:** Bard POS Development Team
