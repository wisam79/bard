# مخطط قاعدة بيانات Bard POS

## نظرة عامة

يوضح هذا المستند مخطط قاعدة البيانات للتطبيق باستخدام SQLite و GORM.

## الجداول

### 1. products (المنتجات)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | المعرف الفريد للمنتج |
| name | VARCHAR(255) | NOT NULL | اسم المنتج |
| barcode | VARCHAR(50) | UNIQUE, INDEX | الرمز الشريطي |
| price | DECIMAL(12,2) | NOT NULL | سعر البيع |
| cost | DECIMAL(12,2) | NOT NULL | سعر التكلفة |
| stock | DECIMAL(10,2) | DEFAULT 0 | المخزون المتاح |
| min_stock | DECIMAL(10,2) | DEFAULT 0 | حد المخزون المنخفض |
| category | VARCHAR(100) | INDEX | الفئة |
| image | TEXT | NULLABLE | رابط الصورة |
| supplier | VARCHAR(100) | NULLABLE | المورد |
| wholesale_price | DECIMAL(12,2) | DEFAULT 0 | سعر الجملة |
| description | TEXT | NULLABLE | الوصف |
| custom_details | JSON | NULLABLE | حقول مخصصة |
| created_at | TIMESTAMP | | تاريخ الإنشاء |
| updated_at | TIMESTAMP | | تاريخ التحديث |

### 2. sales (المبيعات)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | معرف الفاتورة |
| customer_id | VARCHAR(36) | NULLABLE, INDEX | معرف العميل |
| customer_name | VARCHAR(100) | INDEX | اسم العميل |
| staff_id | VARCHAR(36) | INDEX | معرف الموظف |
| staff_name | VARCHAR(100) | | اسم المحاسب |
| date | DATE | INDEX | التاريخ |
| timestamp | INT64 | INDEX | الطابع الزمني |
| subtotal | DECIMAL(12,2) | | المجموع الفرعي |
| discount | DECIMAL(12,2) | DEFAULT 0 | الخصم |
| vat | DECIMAL(12,2) | DEFAULT 0 | الضريبة |
| total | DECIMAL(12,2) | | الإجمالي |
| payment_method | VARCHAR(20) | NOT NULL | طريقة الدفع |
| status | VARCHAR(20) | INDEX | الحالة |
| items_count | DECIMAL(10,2) | DEFAULT 0 | عدد الأصناف |
| split_details | JSON | NULLABLE | تفاصيل الدفع المجزأ |
| installment_plan | JSON | NULLABLE | خطة التقسيط |
| note | TEXT | NULLABLE | ملاحظات |
| points_awarded | INT | DEFAULT 0 | النقاط الممنوحة |
| created_at | TIMESTAMP | | تاريخ الإنشاء |
| updated_at | TIMESTAMP | | تاريخ التحديث |

### 3. sale_items (بنود الفاتورة)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | UINT | PK, AUTO | معرف البند |
| sale_id | VARCHAR(36) | INDEX, FK | معرف الفاتورة |
| product_id | VARCHAR(36) | INDEX | معرف المنتج |
| name | VARCHAR(255) | | اسم المنتج |
| price | DECIMAL(12,2) | | السعر |
| quantity | DECIMAL(10,2) | | الكمية |
| total | DECIMAL(12,2) | | الإجمالي |
| cost | DECIMAL(12,2) | | التكلفة |
| discount | DECIMAL(12,2) | DEFAULT 0 | الخصم |
| returned_qty | DECIMAL(10,2) | DEFAULT 0 | الكمية المرتجعة |

### 4. customers (العملاء)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | معرف العميل |
| name | VARCHAR(100) | NOT NULL | الاسم |
| phone | VARCHAR(20) | INDEX | رقم الهاتف |
| debt | DECIMAL(12,2) | DEFAULT 0 | الدين |
| installment_debt | DECIMAL(12,2) | DEFAULT 0 | دين التقسيط |
| total_purchases | DECIMAL(12,2) | DEFAULT 0 | إجمالي المشتريات |
| last_visit | DATE | | آخر زيارة |
| points | INT | DEFAULT 0 | النقاط |
| notes | TEXT | NULLABLE | ملاحظات |
| created_at | TIMESTAMP | | تاريخ الإنشاء |
| updated_at | TIMESTAMP | | تاريخ التحديث |

### 5. staff (الموظفين)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | معرف الموظف |
| username | VARCHAR(50) | UNIQUE | اسم المستخدم |
| password | VARCHAR(255) | NOT NULL | كلمة المرور (مشفرة) |
| name | VARCHAR(100) | NOT NULL | الاسم |
| role | VARCHAR(20) | NOT NULL | الدور |
| phone | VARCHAR(20) | NULLABLE | الهاتف |
| is_active | BOOL | DEFAULT TRUE | نشط |
| pin_code | VARCHAR(10) | NULLABLE | PIN |
| created_at | TIMESTAMP | | تاريخ الإنشاء |
| updated_at | TIMESTAMP | | تاريخ التحديث |

### 6. suppliers (الموردين)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | معرف المورد |
| name | VARCHAR(100) | NOT NULL | الاسم |
| company_name | VARCHAR(100) | NULLABLE | الشركة |
| phone | VARCHAR(20) | | الهاتف |
| email | VARCHAR(100) | NULLABLE | البريد |
| notes | TEXT | NULLABLE | ملاحظات |
| balance | DECIMAL(12,2) | DEFAULT 0 | الرصيد |
| created_at | TIMESTAMP | | تاريخ الإنشاء |
| updated_at | TIMESTAMP | | تاريخ التحديث |

### 7. expenses (المصروفات)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | معرف المصروف |
| title | VARCHAR(100) | NOT NULL | العنوان |
| amount | DECIMAL(12,2) | NOT NULL | المبلغ |
| date | DATE | | التاريخ |
| category | VARCHAR(50) | INDEX | الفئة |
| notes | TEXT | NULLABLE | ملاحظات |
| created_at | TIMESTAMP | | تاريخ الإنشاء |
| updated_at | TIMESTAMP | | تاريخ التحديث |

### 8. payments (المدفوعات)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | UINT | PK, AUTO | معرف الدفعة |
| sale_id | VARCHAR(36) | INDEX | معرف الفاتورة |
| customer_id | VARCHAR(36) | INDEX | معرف العميل |
| amount | DECIMAL(12,2) | NOT NULL | المبلغ |
| method | VARCHAR(20) | NOT NULL | الطريقة |
| note | TEXT | NULLABLE | ملاحظات |
| timestamp | INT64 | INDEX | الطابع الزمني |
| staff_id | VARCHAR(36) | NULLABLE | معرف الموظف |
| inst_index | INT | NULLABLE | مؤشر القسط |
| created_at | TIMESTAMP | | تاريخ الإنشاء |

### 9. shifts (الورديات)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | معرف الوردية |
| staff_id | VARCHAR(36) | INDEX | معرف الموظف |
| staff_name | VARCHAR(100) | | اسم الموظف |
| start_time | INT64 | | وقت البدء |
| end_time | INT64 | NULLABLE | وقت الانتهاء |
| start_cash | DECIMAL(12,2) | | نقدية البداية |
| end_cash | DECIMAL(12,2) | NULLABLE | نقدية النهاية |
| status | VARCHAR(20) | INDEX | الحالة |
| created_at | TIMESTAMP | | تاريخ الإنشاء |

### 10. purchase_orders (أوامر الشراء)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | معرف الأمر |
| supplier_id | VARCHAR(36) | INDEX | معرف المورد |
| supplier_name | VARCHAR(100) | | اسم المورد |
| date | DATE | | التاريخ |
| total | DECIMAL(12,2) | | الإجمالي |
| status | VARCHAR(20) | INDEX | الحالة |
| created_at | TIMESTAMP | | تاريخ الإنشاء |
| updated_at | TIMESTAMP | | تاريخ التحديث |

### 11. categories (الفئات)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | VARCHAR(36) | PK, UUID | معرف الفئة |
| name | VARCHAR(100) | UNIQUE | الاسم |
| fields | JSON | NULLABLE | حقول مخصصة |

### 12. app_preferences (إعدادات التطبيق)

| الحقل | النوع | القيود | الوصف |
|-------|-------|--------|-------|
| id | UINT | PK, AUTO | معرف الإعدادات |
| store_name | VARCHAR(100) | DEFAULT "Bard" | اسم المحل |
| store_address | TEXT | NULLABLE | العنوان |
| store_phone | VARCHAR(20) | NULLABLE | الهاتف |
| currency | VARCHAR(10) | DEFAULT "د.ع" | العملة |
| tax_rate | DECIMAL(5,2) | DEFAULT 0 | نسبة الضريبة |
| theme | VARCHAR(10) | DEFAULT "dark" | السمة |
| accent_color | VARCHAR(20) | NULLABLE | اللون |
| enable_sound | BOOL | DEFAULT TRUE | تفعيل الصوت |
| language | VARCHAR(10) | DEFAULT "ar" | اللغة |
| low_stock_trigger | INT | DEFAULT 5 | تنبيه المخزون |
| admin_pin | VARCHAR(10) | NULLABLE | PIN المدير |
| font_size | VARCHAR(10) | DEFAULT "medium" | حجم الخط |
| auto_lock_time | INT | DEFAULT 0 | وقت القفل |
| quick_sell | BOOL | DEFAULT FALSE | بيع سريع |
| auto_print | BOOL | DEFAULT FALSE | طباعة تلقائية |
| auto_print_format | VARCHAR(20) | NULLABLE | صيغة الطباعة |
| thermal_paper_size | VARCHAR(10) | NULLABLE | حجم الورق |
| require_shift | BOOL | DEFAULT FALSE | طلب وردية |
| receipt_footer | TEXT | NULLABLE | ذيل الفاتورة |
| show_logo | BOOL | DEFAULT TRUE | إظهار الشعار |
| show_items | BOOL | DEFAULT TRUE | إظهار الأصناف |
| show_barcode | BOOL | DEFAULT FALSE | إظهار الباركود |
| show_footer | BOOL | DEFAULT TRUE | إظهار الذيل |

## العلاقات

```
products
  └── sale_items (One-to-Many)
  └── purchase_order_items (One-to-Many)
  └── stock_movements (One-to-Many)

sales
  └── sale_items (One-to-Many)
  └── payments (One-to-Many)
  └── customers (Many-to-One)

customers
  └── sales (One-to-Many)
  └── payments (One-to-Many)

staff
  └── sales (One-to-Many)
  └── shifts (One-to-Many)

suppliers
  └── purchase_orders (One-to-Many)

shifts
  └── cash_movements (One-to-Many)

purchase_orders
  └── purchase_order_items (One-to-Many)
```

## الفهارس

| الجدول | الحقل | النوع |
|-------|-------|-------|
| products | barcode | UNIQUE |
| products | category | INDEX |
| sales | customer_name | INDEX |
| sales | date | INDEX |
| sales | status | INDEX |
| sales | timestamp | INDEX |
| customers | phone | INDEX |
| sale_items | sale_id | INDEX |
| sale_items | product_id | INDEX |
| payments | sale_id | INDEX |
| payments | customer_id | INDEX |
| expenses | category | INDEX |
| shifts | staff_id | INDEX |
| shifts | status | INDEX |
| purchase_orders | supplier_id | INDEX |
| purchase_orders | status | INDEX |
