# Bard - نظام المبيعات (Point of Sale)

نظام نقطة بيع متطور مبني بأحدث التقنيات.

## البنية التقنية

### Backend (Go)
- **Framework**: Wails v2
- **Database**: SQLite مع GORM
- **Architecture**: Clean Architecture (Domain → Repository → Service → Handler)

### Frontend (React)
- **Framework**: React 18 + TypeScript
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## هيكل المشروع

```
bard/
├── main.go                    # Wails bootstrap (entry point)
├── internal/
│   ├── domain/                # Models (Pure structs)
│   ├── repository/            # Interfaces + SQLite implementation
│   │   └── sqlite/            # SQLite data access layer
│   ├── service/               # Business logic
│   ├── handler/               # Wails API handlers (App struct)
│   ├── middleware/            # Auth, Rate limiting, RBAC
│   ├── crypto/                # AES-256-GCM encryption
│   ├── cache/                 # In-memory caching with TTL
│   ├── audit/                 # Audit trail logging
│   └── logger/                # Structured logging
├── frontend/
│   ├── src/
│   │   ├── components/        # UI + Feature components
│   │   ├── pages/             # Application pages
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript types
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API wrappers
│   │   └── i18n/              # Arabic/English translations
│   └── tests/e2e/             # Playwright tests
├── pkg/                       # Shared utilities
└── docs/                      # Documentation
```

## التشغيل

### Development
```bash
wails dev
```

### Build
```bash
wails build
```

### Tests
```bash
# Backend
go test ./... -v -count=1

# Frontend
cd frontend && npm run test:ci

# E2E
cd frontend && npx playwright test
```

### Linting
```bash
# Go
golangci-lint run

# Frontend
cd frontend && npm run lint
```

## الفروقات عن الإصدار القديم

### التحسينات المعمارية
1. **Clean Architecture**: فصل الطبقات بشكل واضح
2. **Dependency Injection**: استخدام interfaces بدلاً من Global variables
3. **Repository Pattern**: فصل منطق الوصول للبيانات
4. **Service Layer**: فصل منطق العمل عن طبقة الـ API

### تحسينات Frontend
1. **Component Organization**: تنظيم أفضل للمكونات
2. **Type Safety**: TypeScript strict mode + noUnusedLocals/Parameters
3. **Performance**: Code splitting مع manualChunks
4. **State Management**: Zustand بدلاً من Context

### تحسينات Backend
1. **Structured Logging**: نظام تسجيل منظم
2. **Error Handling**: نظام أخطاء موحد
3. **Transaction Safety**: معاملات آمنة
4. **Repository Pattern**: قابلية الاختبار والصيانة

### تحسينات الأمان
1. **Server-side RBAC**: صلاحيات على مستوى الخادم
2. **Rate Limiting**: حماية من هجمات brute-force
3. **Session Management**: إدارة الجلسات مع انتهاء تلقائي
4. **Input Sanitization**: تنظيف المدخلات من XSS
5. **AES-256-GCM**: تشفير البيانات الحساسة
6. **SHA-256 Key Hashing**: تجزئة آمنة للمفاتيح

## الترخيص

جميع الحقوق محفوظة.
