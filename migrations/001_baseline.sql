-- +goose Up
-- Initial schema baseline.
-- This captures the schema as it exists after GORM AutoMigrate,
-- so goose can track future changes from this point forward.

-- Products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    cost INTEGER NOT NULL DEFAULT 0,
    stock REAL NOT NULL DEFAULT 0,
    min_stock REAL NOT NULL DEFAULT 0,
    category TEXT DEFAULT '',
    emoji TEXT DEFAULT '',
    image TEXT DEFAULT '',
    supplier TEXT DEFAULT '',
    wholesale_price INTEGER NOT NULL DEFAULT 0,
    description TEXT DEFAULT '',
    custom_details TEXT DEFAULT '',
    created_at DATETIME,
    updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    customer_id TEXT DEFAULT '',
    customer_name TEXT DEFAULT '',
    staff_id TEXT DEFAULT '',
    staff_name TEXT DEFAULT '',
    date TEXT DEFAULT '',
    timestamp INTEGER DEFAULT 0,
    subtotal INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    vat INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    total_cost INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT '',
    status TEXT DEFAULT '',
    items_count REAL DEFAULT 0,
    split_details TEXT DEFAULT '',
    installment_plan TEXT DEFAULT '',
    note TEXT DEFAULT '',
    points_awarded INTEGER DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_customer_name ON sales(customer_name);
CREATE INDEX IF NOT EXISTS idx_sales_staff_id ON sales(staff_id);
CREATE INDEX IF NOT EXISTS idx_sales_timestamp ON sales(timestamp);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id TEXT NOT NULL,
    product_id TEXT DEFAULT '',
    name TEXT DEFAULT '',
    price INTEGER NOT NULL DEFAULT 0,
    quantity REAL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    cost INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    returned_qty REAL DEFAULT 0,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    debt INTEGER NOT NULL DEFAULT 0,
    installment_debt INTEGER NOT NULL DEFAULT 0,
    total_purchases INTEGER NOT NULL DEFAULT 0,
    last_visit TEXT DEFAULT '',
    points INTEGER DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at DATETIME,
    updated_at DATETIME
);

-- Staff
CREATE TABLE IF NOT EXISTS staffs (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cashier',
    phone TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    pin_code TEXT DEFAULT '',
    created_at DATETIME,
    updated_at DATETIME
);

-- Expenses
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    date TEXT DEFAULT '',
    category TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at DATETIME,
    updated_at DATETIME
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    balance INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    supplier_id TEXT DEFAULT '',
    supplier_name TEXT DEFAULT '',
    date TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    total INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at DATETIME,
    updated_at DATETIME
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
    id TEXT PRIMARY KEY,
    staff_id TEXT DEFAULT '',
    staff_name TEXT DEFAULT '',
    start_time INTEGER DEFAULT 0,
    end_time INTEGER DEFAULT 0,
    start_cash INTEGER NOT NULL DEFAULT 0,
    end_cash INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT '',
    created_at DATETIME,
    updated_at DATETIME
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    user_id TEXT DEFAULT '',
    user_name TEXT DEFAULT '',
    target_id TEXT DEFAULT '',
    details TEXT DEFAULT '',
    ip_address TEXT DEFAULT '',
    timestamp INTEGER DEFAULT 0,
    created_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- +goose Down
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS shifts;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS staffs;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS products;
