# AI AGENT STRICT DIRECTIVES: Bard POS v3.2 - Wails Desktop Application

**Version:** 3.2.0  
**Last Updated:** April 13, 2026  
**Maintained By:** Bard POS Development Team  
**Status:** Production Stable

---

## 0. CORE DIRECTIVE (READ FIRST)

### 0.1 You Are Building A Production POS System
- **This is NOT a toy project** - Real businesses depend on this for daily operations
- **Every line of code affects real money** - Financial calculations MUST be precise
- **Offline-first architecture** - No internet required, all data is local
- **Arabic-first, RTL by default** - Iraqi market, Arabic numerals, Hijri dates

### 0.2 Anti-Hallucination Protocol (ZERO TOLERANCE)
```
❌ NEVER invent Wails APIs, Go packages, or project structures
❌ NEVER assume database schemas or field names
❌ NEVER create placeholder code or "// ... rest of implementation"
✅ ALWAYS verify imports, types, and function signatures exist
✅ ASK the user if unsure about ANY implementation detail
✅ READ existing code before making changes
```

### 0.3 Technology Boundaries (HARD RULES)

**This is a NATIVE desktop application, NOT a web app:**

| ❌ NEVER Use | ✅ Use Instead |
|--------------|----------------|
| `window.localStorage` | Go services + SQLite |
| `IndexedDB` | SQLite database |
| `fetch()` / `axios` | Wails bindings (`@/wailsjs/go/...`) |
| `window.print()` | Go-based `PrintReceipt` component |
| REST API calls | Direct Wails function calls |
| `any` type in TypeScript | Specific Go-mirrored types |

---

## 1. TECH STACK (LOCKED VERSIONS)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Wails v2 | 2.11.0+ | Desktop app framework |
| **Backend** | Go | 1.24.0+ | Business logic layer |
| **Frontend** | React 18 + TypeScript | 5.x (Vite) | UI layer |
| **Database** | SQLite | glebarez/sqlite | Local data storage |
| **ORM** | GORM | 1.31.1+ | Database abstraction |
| **State** | Zustand | Latest | Client state management |
| **Query** | TanStack Query | Latest | Server state caching |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **Testing** | Vitest + Playwright | Latest | Unit + E2E tests |
| **Icons** | Lucide React | Latest | Icon library |
| **Charts** | Recharts | Latest | Data visualization |

### 1.1 Project Structure (ENFORCED)

```
bard/
├── main.go                          # Wails bootstrap + DI setup
├── go.mod / go.sum                  # Go dependencies
├── wails.json                       # Wails configuration
├── internal/
│   ├── domain/                      # Pure domain models (NO dependencies)
│   │   ├── product.go              # Product, Category, StockMovement
│   │   ├── sale.go                 # Sale, SaleItem, InstallmentPlan
│   │   ├── customer.go             # Customer, Supplier, Payment
│   │   ├── staff.go                # Staff, AppPreferences, ActivityLog
│   │   ├── finance.go              # Expense, Discount, Shift, PurchaseOrder
│   │   └── common.go               # AppError, DashboardStats, PaginatedResponse
│   ├── repository/                  # Data access layer
│   │   ├── interfaces.go           # ALL repository interfaces
│   │   └── sqlite/                 # SQLite implementations
│   │       ├── db.go               # Database initialization + seeding
│   │       ├── repos.go            # Core repositories (Customer, Staff, Finance, Settings)
│   │       ├── product_repo.go     # Product CRUD
│   │       ├── sale_repo.go        # Sale CRUD + returns
│   │       └── [feature]_repo.go   # Feature-specific repositories
│   ├── service/                     # Business logic layer
│   │   ├── services.go             # Core services (Product, Sale, Customer, Staff, etc.)
│   │   ├── [feature]_service.go    # Feature services
│   │   ├── validator.go            # Validation functions
│   │   └── *_test.go               # Service tests
│   ├── handler/                     # Wails API bindings
│   │   └── app.go                  # App struct (ALL bound methods)
│   ├── middleware/                  # HTTP + app middleware
│   │   ├── auth.go                 # Session management + RBAC
│   │   └── middleware.go           # Rate limiting, activity logging
│   ├── crypto/                      # Encryption utilities
│   │   ├── crypto.go               # AES-256-GCM encryptor
│   │   └── key_manager.go          # Key generation + storage
│   ├── cache/                       # In-memory caching
│   │   └── cache.go                # TTL-based cache with cleanup
│   ├── audit/                       # Audit trail logging
│   │   └── audit.go                # Audit service + constants
│   ├── logger/                      # Structured logging
│   │   └── logger.go               # Multi-level logger
│   └── errors/                      # Error handling
│       └── errors.go               # Unified error types
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Reusable UI components
│   │   │   ├── features/           # Feature-specific components
│   │   │   └── layout/             # App shell (Sidebar, MainLayout)
│   │   ├── pages/                  # Route-level components
│   │   ├── store/                  # Zustand stores
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/               # API service wrappers
│   │   ├── types/                  # TypeScript types (mirror Go)
│   │   ├── i18n/                   # Arabic/English translations
│   │   ├── lib/                    # Utilities + Wails bindings
│   │   ├── __tests__/              # Unit tests
│   │   └── main.tsx                # React entry point
│   └── tests/e2e/                  # Playwright E2E tests
├── pkg/utils/                       # Shared utilities
│   └── password.go                 # Bcrypt password hashing
├── docs/                            # Documentation
└── build/                           # Build output
```

### 1.2 Key Dependencies

**Go Modules (`go.mod`):**
```go
github.com/wailsapp/wails/v2 v2.11.0    // Desktop framework
github.com/glebarez/sqlite v1.11.0       // SQLite driver
gorm.io/gorm v1.31.1                     // ORM
github.com/google/uuid v1.6.0            // UUID generation
golang.org/x/crypto v0.46.0              // bcrypt + encryption
github.com/stretchr/testify v1.11.1      // Testing framework
```

**Frontend Dependencies (`package.json`):**
```json
"@tanstack/react-query": "Latest",      // Server state
"zustand": "Latest",                     // Client state
"lucide-react": "Latest",               // Icons
"recharts": "Latest",                   // Charts
"i18next": "Latest",                    // Internationalization
"@fontsource/rubik": "^5.2.8"           // Arabic font
```

---

## 2. BACKEND DEVELOPMENT RULES (GO)

### 2.1 Context Management (CRITICAL - WILL CRASH IF WRONG)

**The App struct MUST store context from Startup:**

```go
type App struct {
    ctx context.Context  // ← MUST store this
    // ... other service fields
}

func (a *App) Startup(ctx context.Context) {
    a.ctx = ctx  // ← Store context IMMEDIATELY
    a.log.Info("Application started")
}

// ✅ CORRECT: Use stored context
func (a *App) ShowFileDialog() (string, error) {
    dialog, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
        Title: "Select File",
    })
    return dialog, err
}

// ❌ WRONG: NEVER use context.Background() for Wails runtime
func (a *App) BadExample() {
    // This WILL CRASH because context.Background() has no Wails runtime
    dialog, err := runtime.OpenFileDialog(context.Background(), ...)
}
```

### 2.2 Method Signatures (MANDATORY)

**EVERY method exposed to frontend MUST return `(data, error)`:**

```go
// ✅ CORRECT signatures
func (a *App) GetProducts(page, limit int, search, category string) (*domain.PaginatedProducts, error)
func (a *App) CreateSale(sale domain.Sale) error
func (a *App) Login(username, password string) (*domain.Staff, error)
func (a *App) DeleteProduct(id string) error  // error-only is OK

// ❌ WRONG: Missing error return
func (a *App) BadExample1() { /* no return values */ }
func (a *App) BadExample2() *domain.Product { /* no error return */ }
```

### 2.3 Error Handling (NEVER PANIC)

**Use explicit error returns, NEVER panic or log.Fatal:**

```go
// ✅ CORRECT: Return errors explicitly
func (s *SaleService) Create(sale *domain.Sale) error {
    if err := ValidateSale(sale); err != nil {
        return err  // Return validation error
    }
    if err := s.saleRepo.CreateSaleWithStockUpdate(sale); err != nil {
        return apperrors.Wrap(domain.ModuleSales, err, "Failed to create sale")
    }
    return nil
}

// ❌ WRONG: NEVER panic or use log.Fatal (WILL CRASH APP)
func (s *Service) BadExample() {
    panic("something went wrong")   // ← CRASHES desktop app
    log.Fatal("error")              // ← CRASHES desktop app
    log.Panic("error")              // ← CRASHES desktop app
}

// ✅ CORRECT: Use unified error types
return &domain.AppError{
    Module:  domain.ModuleSales,
    Code:    "INSUFFICIENT_STOCK",
    Message: "المخزون غير كافٍ",
    Hint:    "الكمية المطلوبة: 10, المتوفر: 5",
}
```

### 2.4 Database Operations (TRANSACTIONS + SAFETY)

**Use transactions for multi-table operations:**

```go
// ✅ CORRECT: Transactional sale creation
func (s *SaleService) Create(sale *domain.Sale) error {
    // Repository handles: stock check → deduct → create sale → update debt
    return s.saleRepo.CreateSaleWithStockUpdate(sale)
}

// Inside repository:
func (r *saleRepository) CreateSaleWithStockUpdate(sale *domain.Sale) error {
    return r.db.Transaction(func(tx *gorm.DB) error {
        // 1. Check stock availability
        for _, item := range sale.Items {
            var product domain.Product
            if err := tx.First(&product, "id = ?", item.ProductID).Error; err != nil {
                return err
            }
            if product.Stock < item.Quantity {
                return apperrors.NewInsufficientStockError(product.Name, product.Stock)
            }
        }
        
        // 2. Deduct stock
        for _, item := range sale.Items {
            err := tx.Model(&domain.Product{}).
                Where("id = ? AND stock >= ?", item.ProductID, item.Quantity).
                UpdateColumn("stock", gorm.Expr("stock - ?", item.Quantity)).Error
            if err != nil {
                return err
            }
        }
        
        // 3. Create sale record
        if err := tx.Create(sale).Error; err != nil {
            return err
        }
        
        return nil  // Commits transaction
    })
}

// ✅ CORRECT: Parameterized queries (prevent SQL injection)
db.Where("id = ?", productID).First(&product)
db.Where("name LIKE ?", "%"+search+"%").Find(&products)

// ❌ WRONG: String concatenation (SQL INJECTION RISK)
db.Where("id = " + productID).First(&product)  // NEVER DO THIS
db.Where("name = '" + name + "'").Find(&products)  // NEVER DO THIS
```

### 2.5 Validation (INPUT SANITIZATION)

**Validate ALL inputs in service layer:**

```go
// ✅ CORRECT: Comprehensive validation
func ValidateProduct(p *domain.Product) error {
    p.Name = strings.TrimSpace(p.Name)
    p.Barcode = strings.TrimSpace(p.Barcode)
    
    if p.Name == "" {
        return errors.NewValidationError(domain.ModuleProduct, "name", "اسم المنتج مطلوب")
    }
    if p.Barcode == "" {
        return errors.NewValidationError(domain.ModuleProduct, "barcode", "الباركود مطلوب")
    }
    if len(p.Barcode) > 100 {
        return errors.NewValidationError(domain.ModuleProduct, "barcode", "الباركود طويل جداً")
    }
    if p.Price < 0 {
        return errors.NewValidationError(domain.ModuleProduct, "price", "السعر لا يمكن أن يكون سالباً")
    }
    if p.Cost < 0 {
        return errors.NewValidationError(domain.ModuleProduct, "cost", "التكلفة لا يمكن أن تكون سالبة")
    }
    if p.Stock < 0 {
        return errors.NewValidationError(domain.ModuleProduct, "stock", "المخزون لا يمكن أن يكون سالباً")
    }
    return nil
}

// ❌ WRONG: No validation
func (s *ProductService) Create(product *domain.Product) error {
    return s.repo.Create(product)  // ← Accepts invalid data
}
```

### 2.6 Search Input Sanitization

**ALWAYS sanitize search inputs to prevent SQL injection:**

```go
// ✅ CORRECT: Sanitize search inputs
func sanitizeSearch(s string) string {
    s = strings.TrimSpace(s)
    s = strings.ReplaceAll(s, "%", "")      // Remove SQL wildcards
    s = strings.ReplaceAll(s, "_", "")      // Remove single-char wildcard
    s = strings.ReplaceAll(s, "\\", "")     // Remove escape chars
    if len(s) > 100 {
        s = s[:100]  // Limit length
    }
    return s
}

func (s *ProductService) GetAll(page, limit int, search, category string) (*domain.PaginatedProducts, error) {
    search = sanitizeSearch(search)
    category = sanitizeSearch(category)
    
    return s.repo.GetAll(page, limit, search, category)
}
```

### 2.7 Business Logic Boundaries

**Complex calculations in Go, NOT frontend:**

```go
// ✅ CORRECT: Installment calculation in Go
func (s *SaleService) CalculateInstallmentPlan(total, downPayment float64, months int) (*domain.InstallmentPlan, error) {
    if months <= 0 || total <= 0 {
        return nil, &domain.AppError{
            Module:  domain.ModuleSales,
            Code:    "INVALID_PARAMS",
            Message: "المعاملات المدخلة غير صحيحة",
        }
    }
    if downPayment < 0 {
        return nil, &domain.AppError{
            Module:  domain.ModuleSales,
            Code:    "INVALID_DOWN_PAYMENT",
            Message: "الدفعة المقدمة لا يمكن أن تكون سالبة",
        }
    }
    
    remaining := total - downPayment
    if remaining <= 0 {
        return nil, &domain.AppError{
            Module:  domain.ModuleSales,
            Code:    "INVALID_DOWN_PAYMENT",
            Message: "الدفعة المقدمة لا يمكن أن تتجاوز الإجمالي",
        }
    }
    
    // Round to 2 decimal places
    monthlyAmount := math.Round(remaining/float64(months)*100) / 100
    startDate := time.Now()
    
    schedule := make([]domain.Installment, months)
    for i := 0; i < months; i++ {
        dueDate := startDate.AddDate(0, i+1, 0)
        amount := monthlyAmount
        if i == months-1 {
            // Last payment gets remainder to avoid rounding errors
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

// ❌ WRONG: Calculation in frontend TypeScript
const monthlyAmount = total / months;  // ← Should be in Go
```

---

## 3. FRONTEND DEVELOPMENT RULES (TYPESCRIPT + REACT)

### 3.1 Wails Bridge Communication (ONLY WAY TO CALL BACKEND)

**Use ONLY auto-generated Wails bindings:**

```typescript
// ✅ CORRECT: Import from wailsjs/go
import { GetProducts, CreateSale, DeleteProduct } from '@/wailsjs/go/main/App';

async function loadProducts() {
  try {
    const result = await GetProducts(1, 20, '', '');
    return result;
  } catch (error) {
    console.error('Failed to load products:', error);
    throw error;
  }
}

// ❌ WRONG: NO fetch/axios for local data
async function BadExample() {
  const response = await fetch('/api/products');  // ← NO REST API exists
  const data = await axios.get('/products');      // ← NO HTTP server
}
```

### 3.2 Async/Await Protocol (ALWAYS TRY/CATCH)

**EVERY backend call MUST be wrapped in try/catch:**

```typescript
// ✅ CORRECT: Comprehensive error handling
async function createSale(sale: Sale) {
  try {
    await CreateSale(sale);
    notify('تمت عملية البيع بنجاح', 'success');
    queryClient.invalidateQueries({ queryKey: ['sales'] });
  } catch (error) {
    const appError = error as AppError;
    // Show user-friendly Arabic message
    notify(appError.message || 'حدث خطأ', 'error');
    console.error('Sale creation failed:', appError);
    throw error;  // Re-throw for caller handling
  }
}

// ✅ CORRECT: Using React Query with error handling
const { data, isLoading, error } = useQuery({
  queryKey: ['products', page, search],
  queryFn: () => GetProducts(page, 20, search, ''),
  staleTime: 1000 * 60 * 5,  // 5 minutes
  retry: 1,
});

if (error) {
  return <ErrorDisplay message={(error as AppError).message} />;
}

// ❌ WRONG: No error handling
async function BadExample() {
  await CreateSale(sale);  // ← Silent failure
}
```

### 3.3 State Management (Zustand - DUMB VIEW PATTERN)

**Frontend handles UI state, Go handles business logic:**

```typescript
// ✅ CORRECT: Simple state updates, no business logic
const useCartStore = create<CartState>((set, get) => ({
  cart: [] as CartItem[],
  addToCart: (product: Product) => {
    set((state) => ({
      cart: [...state.cart, { product, qty: 1, discount: 0, total: product.price }]
    }));
  },
  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter(item => item.product.id !== productId)
    }));
  },
}));

// ❌ WRONG: Business logic in frontend store
const BadStore = create(() => ({
  calculateTax: (amount: number) => amount * 0.15,  // ← Should be in Go
  calculateDiscount: (total: number) => { /* complex logic */ },  // ← Should be in Go
  validateSale: (cart: CartItem[]) => { /* validation */ },  // ← Should be in Go
}));
```

### 3.4 Permission Checks (RBAC)

**Check permissions before showing sensitive actions:**

```typescript
// ✅ CORRECT: Use auth store permission helpers
import { useAuthStore } from '@/store/authStore';

function ProductActions() {
  const canDelete = useAuthStore(state => state.can('delete:product'));
  const canEdit = useAuthStore(state => state.can('edit:product'));
  
  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}

// Backend ALSO checks permissions (defense in depth)
func (a *App) DeleteProduct(token string, id string) error {
  if err := a.checkPermission(token, middleware.PermDeleteProduct); err != nil {
    return err  // Returns FORBIDDEN error
  }
  return a.products.Delete(id)
}

// ❌ WRONG: No permission check
function BadExample() {
  return <DeleteButton onClick={handleDelete} />;  // ← Anyone can delete
}
```

### 3.5 TypeScript Types (EXACT Go Mirrors)

**Types MUST match Go domain structs exactly:**

```typescript
// ✅ CORRECT: Matches Go domain.Product exactly
export interface Product {
  id: string;           // UUID string
  name: string;
  barcode: string;
  price: number;        // float64 in Go
  cost: number;         // float64 in Go
  stock: number;        // float64 in Go
  minStock: number;     // float64 in Go
  category: string;
  image?: string;
  supplier?: string;
  wholesalePrice: number;
  description?: string;
  customDetails?: Record<string, unknown>;
  createdAt: string;    // time.Time in Go (ISO 8601)
  updatedAt: string;
}

// ❌ WRONG: Using 'any' or missing fields
interface BadProduct {
  id: any;          // ← Should be string
  price: any;       // ← Should be number
  // Missing required fields
}

// ❌ WRONG: Inconsistent naming
interface WrongProduct {
  ID: string;       // ← Should be id (camelCase in TS)
  Name: string;     // ← Should be name
}
```

### 3.6 React Component Patterns

**Use functional components with proper loading/error states:**

```typescript
// ✅ CORRECT: Complete component pattern
function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () => GetProducts(page, 20, search, ''),
  });

  if (isLoading) {
    return <Skeleton count={10} />;
  }

  if (error) {
    return <ErrorDisplay message={(error as AppError).message} />;
  }

  return (
    <div>
      <ProductGrid products={data?.data || []} />
      <Pagination 
        currentPage={page} 
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}

// ❌ WRONG: No loading/error states
function BadExample() {
  const { data } = useQuery(...);
  return <ProductGrid products={data.data} />;  // ← Crashes if loading/error
}
```

### 3.7 RTL Support (ARABIC-FIRST)

**RTL by default, Arabic translations for all UI:**

```typescript
// ✅ CORRECT: Use i18n for all text
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation();
  
  return (
    <div dir="rtl" className="text-right">
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.description')}</p>
    </div>
  );
}

// CSS: RTL enforced
// index.css:
// * { direction: rtl; text-align: right; }
// body { font-family: 'Yamamah', 'Rubik', sans-serif; }

// ❌ WRONG: Hardcoded English text
function BadExample() {
  return <h1>Dashboard</h1>;  // ← Should be Arabic: لوحة التحكم
}
```

---

## 4. FEATURE IMPLEMENTATION WORKFLOW

### 4.1 Step-by-Step Process (NEVER SKIP STEPS)

**When adding ANY new feature, follow this exact order:**

```
Step 1: PLAN (Document before coding)
  ✓ Identify domain entities needed
  ✓ List repository methods
  ✓ Define service functions
  ✓ Plan handler methods
  ✓ Design frontend components
  ✓ Write test scenarios

Step 2: BACKEND FIRST (Go - Domain Layer)
  ✓ Add entity to internal/domain/[feature].go
  ✓ Include GORM tags (primaryKey, index, etc.)
  ✓ Add JSON tags for serialization
  ✓ Write godoc comments

Step 3: BACKEND (Repository Layer)
  ✓ Add interface to internal/repository/interfaces.go
  ✓ Implement in internal/repository/sqlite/[feature]_repo.go
  ✓ Handle errors with handleDBError()
  ✓ Use transactions for multi-table operations

Step 4: BACKEND (Service Layer)
  ✓ Create service in internal/service/[feature]_service.go
  ✓ Add validation in validator.go
  ✓ Include error handling
  ✓ Add logging (s.log.Info/Error)

Step 5: BACKEND (Handler Layer)
  ✓ Add method to internal/handler/app.go
  ✓ Include permission checks
  ✓ Return (data, error) signature
  ✓ Store context if using Wails runtime

Step 6: REGENERATE WAILS BINDINGS
  ⚠️ Run: wails generate module
  This updates frontend/wailsjs/go/ files

Step 7: FRONTEND (Types)
  ✓ Add TypeScript type to frontend/src/types/index.ts
  ✓ Match Go struct exactly (camelCase)
  ✓ Export type for use across app

Step 8: FRONTEND (Components)
  ✓ Create component in frontend/src/components/features/[feature]/
  ✓ Use React Query for data fetching
  ✓ Add loading/skeleton states
  ✓ Add error states with Arabic messages
  ✓ Include try/catch on all Wails calls

Step 9: FRONTEND (Integration)
  ✓ Add route/page if needed
  ✓ Update navigation/sidebar
  ✓ Add Arabic translations to i18n
  ✓ Test permission checks

Step 10: TESTS (MANDATORY)
  ✓ Backend: Service tests (internal/service/[feature]_test.go)
  ✓ Backend: Repository tests if complex
  ✓ Frontend: Component tests (frontend/src/__tests__/)
  ✓ E2E: Critical workflow test (frontend/tests/e2e/)
```

### 4.2 Example: Adding "Discounts" Feature

```markdown
**Plan:**
1. Domain: Discount entity (already exists in domain/finance.go)
2. Repository: CRUD methods in finance_repository
3. Service: Validation + business logic
4. Handler: GetDiscounts, CreateDiscount, UpdateDiscount, DeleteDiscount
5. Frontend: Types, Discounts page, form component
6. Tests: Service validation, component rendering

**Implementation Order:**
1. ✓ Check if Discount entity exists → Yes (domain/finance.go)
2. ✓ Add repository interface methods → internal/repository/interfaces.go
3. ✓ Implement repository → internal/repository/sqlite/finance_repo.go
4. ✓ Create service → internal/service/finance_service.go (already exists)
5. ✓ Add validation → ValidateDiscount() in validator.go
6. ✓ Add handler methods → internal/handler/app.go
7. ✓ Run `wails generate module`
8. ✓ Add TypeScript type → frontend/src/types/index.ts
9. ✓ Create Discounts page → frontend/src/pages/Discounts.tsx
10. ✓ Add to routes → frontend/src/App.tsx
11. ✓ Add translations → frontend/src/i18n/index.ts
12. ✓ Write tests → internal/service/finance_service_test.go
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
