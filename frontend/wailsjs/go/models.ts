export namespace domain {
	
	export class AppPreferences {
	    storeName: string;
	    storeAddress: string;
	    storePhone: string;
	    currency: string;
	    taxRate: number;
	    theme: string;
	    accentColor: string;
	    enableSound: boolean;
	    language: string;
	    lowStockTrigger: number;
	    adminPin: string;
	    fontSize: string;
	    autoLockTime: number;
	    sessionTimeoutMinutes: number;
	    quickSell: boolean;
	    autoPrint: boolean;
	    autoPrintFormat: string;
	    thermalPaperSize: string;
	    requireShift: boolean;
	
	    static createFrom(source: any = {}) {
	        return new AppPreferences(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.storeName = source["storeName"];
	        this.storeAddress = source["storeAddress"];
	        this.storePhone = source["storePhone"];
	        this.currency = source["currency"];
	        this.taxRate = source["taxRate"];
	        this.theme = source["theme"];
	        this.accentColor = source["accentColor"];
	        this.enableSound = source["enableSound"];
	        this.language = source["language"];
	        this.lowStockTrigger = source["lowStockTrigger"];
	        this.adminPin = source["adminPin"];
	        this.fontSize = source["fontSize"];
	        this.autoLockTime = source["autoLockTime"];
	        this.sessionTimeoutMinutes = source["sessionTimeoutMinutes"];
	        this.quickSell = source["quickSell"];
	        this.autoPrint = source["autoPrint"];
	        this.autoPrintFormat = source["autoPrintFormat"];
	        this.thermalPaperSize = source["thermalPaperSize"];
	        this.requireShift = source["requireShift"];
	    }
	}
	export class CashMovement {
	    id: number;
	    shiftId: string;
	    type: string;
	    amount: number;
	    reason: string;
	    staffId: string;
	    timestamp: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new CashMovement(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.shiftId = source["shiftId"];
	        this.type = source["type"];
	        this.amount = source["amount"];
	        this.reason = source["reason"];
	        this.staffId = source["staffId"];
	        this.timestamp = source["timestamp"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Customer {
	    id: string;
	    name: string;
	    phone: string;
	    debt: number;
	    installmentDebt: number;
	    totalPurchases: number;
	    lastVisit: string;
	    points: number;
	    notes?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Customer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.phone = source["phone"];
	        this.debt = source["debt"];
	        this.installmentDebt = source["installmentDebt"];
	        this.totalPurchases = source["totalPurchases"];
	        this.lastVisit = source["lastVisit"];
	        this.points = source["points"];
	        this.notes = source["notes"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Installment {
	    number: number;
	    dueDate: string;
	    amount: number;
	    status: string;
	    paidAt?: number;
	
	    static createFrom(source: any = {}) {
	        return new Installment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.dueDate = source["dueDate"];
	        this.amount = source["amount"];
	        this.status = source["status"];
	        this.paidAt = source["paidAt"];
	    }
	}
	export class InstallmentPlan {
	    totalAmount: number;
	    downPayment: number;
	    months: number;
	    startDate: string;
	    schedule: Installment[];
	
	    static createFrom(source: any = {}) {
	        return new InstallmentPlan(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalAmount = source["totalAmount"];
	        this.downPayment = source["downPayment"];
	        this.months = source["months"];
	        this.startDate = source["startDate"];
	        this.schedule = this.convertValues(source["schedule"], Installment);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class SaleItem {
	    pid: number;
	    id: string;
	    name: string;
	    price: number;
	    qty: number;
	    total: number;
	    cost: number;
	    discount?: number;
	    returnedQty: number;
	
	    static createFrom(source: any = {}) {
	        return new SaleItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pid = source["pid"];
	        this.id = source["id"];
	        this.name = source["name"];
	        this.price = source["price"];
	        this.qty = source["qty"];
	        this.total = source["total"];
	        this.cost = source["cost"];
	        this.discount = source["discount"];
	        this.returnedQty = source["returnedQty"];
	    }
	}
	export class Sale {
	    id: string;
	    customerId?: string;
	    customer: string;
	    staffId: string;
	    staffName: string;
	    date: string;
	    timestamp: number;
	    subtotal: number;
	    discount: number;
	    vat: number;
	    total: number;
	    totalCost: number;
	    paymentMethod: string;
	    status: string;
	    itemsCount: number;
	    items: SaleItem[];
	    splitDetails?: Record<string, number>;
	    installmentPlan?: InstallmentPlan;
	    note?: string;
	    pointsAwarded: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Sale(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.customerId = source["customerId"];
	        this.customer = source["customer"];
	        this.staffId = source["staffId"];
	        this.staffName = source["staffName"];
	        this.date = source["date"];
	        this.timestamp = source["timestamp"];
	        this.subtotal = source["subtotal"];
	        this.discount = source["discount"];
	        this.vat = source["vat"];
	        this.total = source["total"];
	        this.totalCost = source["totalCost"];
	        this.paymentMethod = source["paymentMethod"];
	        this.status = source["status"];
	        this.itemsCount = source["itemsCount"];
	        this.items = this.convertValues(source["items"], SaleItem);
	        this.splitDetails = source["splitDetails"];
	        this.installmentPlan = this.convertValues(source["installmentPlan"], InstallmentPlan);
	        this.note = source["note"];
	        this.pointsAwarded = source["pointsAwarded"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TopProduct {
	    productId: string;
	    name: string;
	    totalQty: number;
	    totalAmount: number;
	
	    static createFrom(source: any = {}) {
	        return new TopProduct(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.name = source["name"];
	        this.totalQty = source["totalQty"];
	        this.totalAmount = source["totalAmount"];
	    }
	}
	export class DashboardStats {
	    todaySales: number;
	    todayOrders: number;
	    monthSales: number;
	    monthOrders: number;
	    totalProducts: number;
	    totalCustomers: number;
	    totalDebt: number;
	    lowStockCount: number;
	    topProducts: TopProduct[];
	    recentSales: Sale[];
	
	    static createFrom(source: any = {}) {
	        return new DashboardStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.todaySales = source["todaySales"];
	        this.todayOrders = source["todayOrders"];
	        this.monthSales = source["monthSales"];
	        this.monthOrders = source["monthOrders"];
	        this.totalProducts = source["totalProducts"];
	        this.totalCustomers = source["totalCustomers"];
	        this.totalDebt = source["totalDebt"];
	        this.lowStockCount = source["lowStockCount"];
	        this.topProducts = this.convertValues(source["topProducts"], TopProduct);
	        this.recentSales = this.convertValues(source["recentSales"], Sale);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Staff {
	    id: string;
	    username: string;
	    name: string;
	    role: string;
	    phone?: string;
	    isActive: boolean;
	    mustChangePassword: boolean;
	    token?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Staff(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.name = source["name"];
	        this.role = source["role"];
	        this.phone = source["phone"];
	        this.isActive = source["isActive"];
	        this.mustChangePassword = source["mustChangePassword"];
	        this.token = source["token"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Expense {
	    id: string;
	    title: string;
	    amount: number;
	    date: string;
	    category: string;
	    notes?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Expense(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.amount = source["amount"];
	        this.date = source["date"];
	        this.category = source["category"];
	        this.notes = source["notes"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Supplier {
	    id: string;
	    name: string;
	    companyName: string;
	    phone: string;
	    email?: string;
	    notes?: string;
	    balance: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Supplier(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.companyName = source["companyName"];
	        this.phone = source["phone"];
	        this.email = source["email"];
	        this.notes = source["notes"];
	        this.balance = source["balance"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Product {
	    id: string;
	    name: string;
	    barcode: string;
	    price: number;
	    cost: number;
	    stock: number;
	    minStock: number;
	    category: string;
	    image?: string;
	    supplier?: string;
	    wholesalePrice: number;
	    description?: string;
	    customDetails?: Record<string, any>;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Product(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.barcode = source["barcode"];
	        this.price = source["price"];
	        this.cost = source["cost"];
	        this.stock = source["stock"];
	        this.minStock = source["minStock"];
	        this.category = source["category"];
	        this.image = source["image"];
	        this.supplier = source["supplier"];
	        this.wholesalePrice = source["wholesalePrice"];
	        this.description = source["description"];
	        this.customDetails = source["customDetails"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DatabaseExport {
	    products: Product[];
	    sales: Sale[];
	    customers: Customer[];
	    suppliers: Supplier[];
	    expenses: Expense[];
	    staff: Staff[];
	    preferences: AppPreferences;
	
	    static createFrom(source: any = {}) {
	        return new DatabaseExport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.products = this.convertValues(source["products"], Product);
	        this.sales = this.convertValues(source["sales"], Sale);
	        this.customers = this.convertValues(source["customers"], Customer);
	        this.suppliers = this.convertValues(source["suppliers"], Supplier);
	        this.expenses = this.convertValues(source["expenses"], Expense);
	        this.staff = this.convertValues(source["staff"], Staff);
	        this.preferences = this.convertValues(source["preferences"], AppPreferences);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	export class InvoiceStats {
	    count: number;
	    total: number;
	    pending: number;
	    returns: number;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.count = source["count"];
	        this.total = source["total"];
	        this.pending = source["pending"];
	        this.returns = source["returns"];
	    }
	}
	export class ProductStats {
	    totalStock: number;
	    totalValue: number;
	    totalCost: number;
	    profit: number;
	
	    static createFrom(source: any = {}) {
	        return new ProductStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalStock = source["totalStock"];
	        this.totalValue = source["totalValue"];
	        this.totalCost = source["totalCost"];
	        this.profit = source["profit"];
	    }
	}
	export class PaginatedProducts {
	    data: Product[];
	    total: number;
	    totalPages: number;
	    page: number;
	    stats: ProductStats;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedProducts(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], Product);
	        this.total = source["total"];
	        this.totalPages = source["totalPages"];
	        this.page = source["page"];
	        this.stats = this.convertValues(source["stats"], ProductStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PurchaseOrderItem {
	    id: number;
	    productId: string;
	    name: string;
	    qty: number;
	    cost: number;
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PurchaseOrderItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.name = source["name"];
	        this.qty = source["qty"];
	        this.cost = source["cost"];
	        this.total = source["total"];
	    }
	}
	export class PurchaseOrder {
	    id: string;
	    supplierId: string;
	    supplierName: string;
	    date: string;
	    total: number;
	    status: string;
	    items: PurchaseOrderItem[];
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new PurchaseOrder(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.supplierId = source["supplierId"];
	        this.supplierName = source["supplierName"];
	        this.date = source["date"];
	        this.total = source["total"];
	        this.status = source["status"];
	        this.items = this.convertValues(source["items"], PurchaseOrderItem);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedResponse_bard_internal_domain_PurchaseOrder_ {
	    data: PurchaseOrder[];
	    total: number;
	    totalPages: number;
	    page: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedResponse_bard_internal_domain_PurchaseOrder_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], PurchaseOrder);
	        this.total = source["total"];
	        this.totalPages = source["totalPages"];
	        this.page = source["page"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedSales {
	    data: Sale[];
	    total: number;
	    totalPages: number;
	    page: number;
	    stats: InvoiceStats;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedSales(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], Sale);
	        this.total = source["total"];
	        this.totalPages = source["totalPages"];
	        this.page = source["page"];
	        this.stats = this.convertValues(source["stats"], InvoiceStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ParkedSale {
	    id: number;
	    items_json: string;
	    customer_name: string;
	    customer_id: string;
	    note: string;
	    total: number;
	    items_count: number;
	    // Go type: time
	    created_at: any;
	
	    static createFrom(source: any = {}) {
	        return new ParkedSale(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.items_json = source["items_json"];
	        this.customer_name = source["customer_name"];
	        this.customer_id = source["customer_id"];
	        this.note = source["note"];
	        this.total = source["total"];
	        this.items_count = source["items_count"];
	        this.created_at = this.convertValues(source["created_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Payment {
	    id: number;
	    saleId: string;
	    customerId: string;
	    amount: number;
	    method: string;
	    note?: string;
	    timestamp: number;
	    staffId?: string;
	    instIndex?: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Payment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.saleId = source["saleId"];
	        this.customerId = source["customerId"];
	        this.amount = source["amount"];
	        this.method = source["method"];
	        this.note = source["note"];
	        this.timestamp = source["timestamp"];
	        this.staffId = source["staffId"];
	        this.instIndex = source["instIndex"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	
	
	
	export class Shift {
	    id: string;
	    staffId: string;
	    staffName: string;
	    startTime: number;
	    endTime?: number;
	    startCash: number;
	    endCash?: number;
	    status: string;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Shift(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.staffId = source["staffId"];
	        this.staffName = source["staffName"];
	        this.startTime = source["startTime"];
	        this.endTime = source["endTime"];
	        this.startCash = source["startCash"];
	        this.endCash = source["endCash"];
	        this.status = source["status"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	

}

