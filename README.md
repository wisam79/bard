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
├── backend/
│   ├── cmd/app/           # Entry point
│   ├── internal/
│   │   ├── domain/        # Models (Pure structs)
│   │   ├── repository/    # Data access layer
│   │   │   └── sqlite/    # SQLite implementation
│   │   ├── service/       # Business logic
│   │   ├── handler/       # Wails API handlers
│   │   └── logger/        # Logging system
│   └── pkg/               # Shared utilities
├── frontend/
│   ├── src/
│   │   ├── components/    # UI Components
│   │   ├── pages/         # Application pages
│   │   ├── store/         # State management
│   │   ├── types/         # TypeScript types
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── shared/                # Shared code
```

## التشغيل

### Backend
```bash
cd backend
go mod tidy
go run cmd/app/main.go
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Build
```bash
wails build
```

## الفروقات عن الإصدار القديم

### التحسينات المعمارية
1. **Clean Architecture**: فصل الطبقات بشكل واضح
2. **Dependency Injection**: استخدام interfaces بدلاً من Global variables
3. **Repository Pattern**: فصل منطق الوصول للبيانات
4. **Service Layer**: فصل منطق العمل عن طبقة الـ API

### تحسينات Frontend
1. **Component Organization**: تنظيم أفضل للمكونات
2. **Type Safety**: TypeScript strict mode
3. **Performance**: Code splitting و lazy loading
4. **State Management**: Zustand بدلاً من Context

### تحسينات Backend
1. **Structured Logging**: نظام تسجيل منظم
2. **Error Handling**: نظام أخطاء موحد
3. **Transaction Safety**: معاملات آمنة
4. **Repository Pattern**: قابلية الاختبار والصيانة

## الترخيص

جميع الحقوق محفوظة.
