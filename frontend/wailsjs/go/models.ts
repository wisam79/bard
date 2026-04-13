export namespace domain {
	
	export class AnomalyDetection {
	    metric: string;
	    date: string;
	    expected: number;
	    actual: number;
	    deviation: number;
	    isAnomaly: boolean;
	    description: string;
	
	    static createFrom(source: any = {}) {
	        return new AnomalyDetection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.metric = source["metric"];
	        this.date = source["date"];
	        this.expected = source["expected"];
	        this.actual = source["actual"];
	        this.deviation = source["deviation"];
	        this.isAnomaly = source["isAnomaly"];
	        this.description = source["description"];
	    }
	}
	export class DemandForecast {
	    productId: string;
	    productName: string;
	    currentQty: number;
	    predictedDemand: number;
	    daysOfStock: number;
	    reorderDate: string;
	    urgency: string;
	
	    static createFrom(source: any = {}) {
	        return new DemandForecast(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.currentQty = source["currentQty"];
	        this.predictedDemand = source["predictedDemand"];
	        this.daysOfStock = source["daysOfStock"];
	        this.reorderDate = source["reorderDate"];
	        this.urgency = source["urgency"];
	    }
	}
	export class ProfitAnalysis {
	    period: string;
	    revenue: number;
	    cost: number;
	    profit: number;
	    margin: number;
	    growth: number;
	
	    static createFrom(source: any = {}) {
	        return new ProfitAnalysis(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.period = source["period"];
	        this.revenue = source["revenue"];
	        this.cost = source["cost"];
	        this.profit = source["profit"];
	        this.margin = source["margin"];
	        this.growth = source["growth"];
	    }
	}
	export class SalesForecast {
	    date: string;
	    predicted: number;
	    lowerBound: number;
	    upperBound: number;
	
	    static createFrom(source: any = {}) {
	        return new SalesForecast(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.date = source["date"];
	        this.predicted = source["predicted"];
	        this.lowerBound = source["lowerBound"];
	        this.upperBound = source["upperBound"];
	    }
	}
	export class AnalyticsInsight {
	    type: string;
	    title: string;
	    description: string;
	    severity: string;
	    value?: number;
	    metric?: string;
	    period?: string;
	
	    static createFrom(source: any = {}) {
	        return new AnalyticsInsight(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.severity = source["severity"];
	        this.value = source["value"];
	        this.metric = source["metric"];
	        this.period = source["period"];
	    }
	}
	export class AnalyticsDashboard {
	    insights: AnalyticsInsight[];
	    forecasts: SalesForecast[];
	    profits: ProfitAnalysis[];
	    demands: DemandForecast[];
	    anomalies: AnomalyDetection[];
	
	    static createFrom(source: any = {}) {
	        return new AnalyticsDashboard(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.insights = this.convertValues(source["insights"], AnalyticsInsight);
	        this.forecasts = this.convertValues(source["forecasts"], SalesForecast);
	        this.profits = this.convertValues(source["profits"], ProfitAnalysis);
	        this.demands = this.convertValues(source["demands"], DemandForecast);
	        this.anomalies = this.convertValues(source["anomalies"], AnomalyDetection);
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
	export class ApprovalWorkflow {
	    id: string;
	    name: string;
	    minAmount: number;
	    maxAmount: number;
	    requiredLevel: string;
	    isActive?: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ApprovalWorkflow(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.minAmount = source["minAmount"];
	        this.maxAmount = source["maxAmount"];
	        this.requiredLevel = source["requiredLevel"];
	        this.isActive = source["isActive"];
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
	export class Branch {
	    id: string;
	    name: string;
	    address?: string;
	    phone?: string;
	    managerId?: string;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Branch(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.address = source["address"];
	        this.phone = source["phone"];
	        this.managerId = source["managerId"];
	        this.isActive = source["isActive"];
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
	export class Budget {
	    id: string;
	    name: string;
	    category: string;
	    amount: number;
	    period: string;
	    startDate: string;
	    endDate: string;
	    spentAmount: number;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Budget(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.category = source["category"];
	        this.amount = source["amount"];
	        this.period = source["period"];
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	        this.spentAmount = source["spentAmount"];
	        this.isActive = source["isActive"];
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
	export class Campaign {
	    id: string;
	    name: string;
	    description: string;
	    type: string;
	    segmentId: string;
	    discountId?: string;
	    messageTmpl?: string;
	    status: string;
	    // Go type: time
	    scheduledAt?: any;
	    // Go type: time
	    startedAt?: any;
	    // Go type: time
	    endedAt?: any;
	    targetCount: number;
	    sentCount: number;
	    responseCount: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Campaign(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.type = source["type"];
	        this.segmentId = source["segmentId"];
	        this.discountId = source["discountId"];
	        this.messageTmpl = source["messageTmpl"];
	        this.status = source["status"];
	        this.scheduledAt = this.convertValues(source["scheduledAt"], null);
	        this.startedAt = this.convertValues(source["startedAt"], null);
	        this.endedAt = this.convertValues(source["endedAt"], null);
	        this.targetCount = source["targetCount"];
	        this.sentCount = source["sentCount"];
	        this.responseCount = source["responseCount"];
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
	export class CommissionPayment {
	    id: number;
	    staffId: string;
	    staffName: string;
	    saleId?: string;
	    ruleId: string;
	    amount: number;
	    baseAmount: number;
	    periodStart: string;
	    periodEnd: string;
	    status: string;
	    // Go type: time
	    paidAt?: any;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new CommissionPayment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.staffId = source["staffId"];
	        this.staffName = source["staffName"];
	        this.saleId = source["saleId"];
	        this.ruleId = source["ruleId"];
	        this.amount = source["amount"];
	        this.baseAmount = source["baseAmount"];
	        this.periodStart = source["periodStart"];
	        this.periodEnd = source["periodEnd"];
	        this.status = source["status"];
	        this.paidAt = this.convertValues(source["paidAt"], null);
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
	export class CommissionRule {
	    id: string;
	    name: string;
	    type: string;
	    value: number;
	    targetType: string;
	    targetId?: string;
	    minAmount: number;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new CommissionRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.value = source["value"];
	        this.targetType = source["targetType"];
	        this.targetId = source["targetId"];
	        this.minAmount = source["minAmount"];
	        this.isActive = source["isActive"];
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
	export class Currency {
	    id: string;
	    code: string;
	    name: string;
	    symbol: string;
	    isBase: boolean;
	    exchangeRate: number;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Currency(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.code = source["code"];
	        this.name = source["name"];
	        this.symbol = source["symbol"];
	        this.isBase = source["isBase"];
	        this.exchangeRate = source["exchangeRate"];
	        this.isActive = source["isActive"];
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
	export class CurrencyTransaction {
	    id: number;
	    saleId?: string;
	    fromCurrency: string;
	    toCurrency: string;
	    fromAmount: number;
	    toAmount: number;
	    appliedRate: number;
	    staffId?: string;
	    timestamp: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new CurrencyTransaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.saleId = source["saleId"];
	        this.fromCurrency = source["fromCurrency"];
	        this.toCurrency = source["toCurrency"];
	        this.fromAmount = source["fromAmount"];
	        this.toAmount = source["toAmount"];
	        this.appliedRate = source["appliedRate"];
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
	export class CustomerSegment {
	    id: string;
	    name: string;
	    description: string;
	    rules: string;
	    color: string;
	    customerCount: number;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new CustomerSegment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.rules = source["rules"];
	        this.color = source["color"];
	        this.customerCount = source["customerCount"];
	        this.isActive = source["isActive"];
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
	export class CustomerWallet {
	    id: string;
	    customerId: string;
	    balance: number;
	    creditLimit: number;
	    autoDebitEnabled: boolean;
	    autoDebitDay?: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new CustomerWallet(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.customerId = source["customerId"];
	        this.balance = source["balance"];
	        this.creditLimit = source["creditLimit"];
	        this.autoDebitEnabled = source["autoDebitEnabled"];
	        this.autoDebitDay = source["autoDebitDay"];
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
	    isActive?: boolean;
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
	export class DeliveryDriver {
	    id: string;
	    name: string;
	    phone: string;
	    vehicleNo?: string;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new DeliveryDriver(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.phone = source["phone"];
	        this.vehicleNo = source["vehicleNo"];
	        this.isActive = source["isActive"];
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
	export class DeliveryOrder {
	    id: string;
	    saleId: string;
	    customerId?: string;
	    customerName: string;
	    customerPhone: string;
	    address: string;
	    notes?: string;
	    driverId?: string;
	    driverName?: string;
	    status: string;
	    fee: number;
	    // Go type: time
	    estimatedAt?: any;
	    // Go type: time
	    deliveredAt?: any;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new DeliveryOrder(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.saleId = source["saleId"];
	        this.customerId = source["customerId"];
	        this.customerName = source["customerName"];
	        this.customerPhone = source["customerPhone"];
	        this.address = source["address"];
	        this.notes = source["notes"];
	        this.driverId = source["driverId"];
	        this.driverName = source["driverName"];
	        this.status = source["status"];
	        this.fee = source["fee"];
	        this.estimatedAt = this.convertValues(source["estimatedAt"], null);
	        this.deliveredAt = this.convertValues(source["deliveredAt"], null);
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
	
	
	export class ExpenseApproval {
	    id: number;
	    expenseId: string;
	    approverId: string;
	    approverName: string;
	    status: string;
	    comment?: string;
	    // Go type: time
	    approvedAt?: any;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ExpenseApproval(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.expenseId = source["expenseId"];
	        this.approverId = source["approverId"];
	        this.approverName = source["approverName"];
	        this.status = source["status"];
	        this.comment = source["comment"];
	        this.approvedAt = this.convertValues(source["approvedAt"], null);
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
	export class GiftCard {
	    id: string;
	    code: string;
	    initialBalance: number;
	    balance: number;
	    customerId?: string;
	    purchasedBy?: string;
	    isActive: boolean;
	    // Go type: time
	    expiresAt?: any;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new GiftCard(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.code = source["code"];
	        this.initialBalance = source["initialBalance"];
	        this.balance = source["balance"];
	        this.customerId = source["customerId"];
	        this.purchasedBy = source["purchasedBy"];
	        this.isActive = source["isActive"];
	        this.expiresAt = this.convertValues(source["expiresAt"], null);
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
	export class GiftCardTransaction {
	    id: number;
	    giftCardId: string;
	    amount: number;
	    type: string;
	    saleId?: string;
	    staffId?: string;
	    timestamp: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new GiftCardTransaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.giftCardId = source["giftCardId"];
	        this.amount = source["amount"];
	        this.type = source["type"];
	        this.saleId = source["saleId"];
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
	export class KioskLayout {
	    id: string;
	    name: string;
	    theme: string;
	    showImages: boolean;
	    fontSize: string;
	    categories: string;
	    welcomeMsg: string;
	    acceptCash: boolean;
	    acceptCard: boolean;
	    isDefault: boolean;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new KioskLayout(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.theme = source["theme"];
	        this.showImages = source["showImages"];
	        this.fontSize = source["fontSize"];
	        this.categories = source["categories"];
	        this.welcomeMsg = source["welcomeMsg"];
	        this.acceptCash = source["acceptCash"];
	        this.acceptCard = source["acceptCard"];
	        this.isDefault = source["isDefault"];
	        this.isActive = source["isActive"];
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
	export class KioskSession {
	    id: number;
	    layoutId: string;
	    saleId?: string;
	    // Go type: time
	    startedAt: any;
	    // Go type: time
	    endedAt?: any;
	    totalAmount: number;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new KioskSession(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.layoutId = source["layoutId"];
	        this.saleId = source["saleId"];
	        this.startedAt = this.convertValues(source["startedAt"], null);
	        this.endedAt = this.convertValues(source["endedAt"], null);
	        this.totalAmount = source["totalAmount"];
	        this.status = source["status"];
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
	export class KitchenOrderItem {
	    id: number;
	    productId: string;
	    productName: string;
	    qty: number;
	    note?: string;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new KitchenOrderItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.qty = source["qty"];
	        this.note = source["note"];
	        this.status = source["status"];
	    }
	}
	export class KitchenOrder {
	    id: string;
	    saleId: string;
	    tableNumber?: string;
	    items: KitchenOrderItem[];
	    priority: string;
	    status: string;
	    assignedTo?: string;
	    // Go type: time
	    startedAt?: any;
	    // Go type: time
	    completedAt?: any;
	    elapsedMin: number;
	    note?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new KitchenOrder(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.saleId = source["saleId"];
	        this.tableNumber = source["tableNumber"];
	        this.items = this.convertValues(source["items"], KitchenOrderItem);
	        this.priority = source["priority"];
	        this.status = source["status"];
	        this.assignedTo = source["assignedTo"];
	        this.startedAt = this.convertValues(source["startedAt"], null);
	        this.completedAt = this.convertValues(source["completedAt"], null);
	        this.elapsedMin = source["elapsedMin"];
	        this.note = source["note"];
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
	
	export class KitchenStation {
	    id: string;
	    name: string;
	    categories: string[];
	    isActive: boolean;
	
	    static createFrom(source: any = {}) {
	        return new KitchenStation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.categories = source["categories"];
	        this.isActive = source["isActive"];
	    }
	}
	export class LoyaltyRule {
	    id: string;
	    name: string;
	    pointsPerAmount: number;
	    minPurchase: number;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new LoyaltyRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.pointsPerAmount = source["pointsPerAmount"];
	        this.minPurchase = source["minPurchase"];
	        this.isActive = source["isActive"];
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
	export class LoyaltyTier {
	    id: string;
	    name: string;
	    minPoints: number;
	    pointsRate: number;
	    discountPct: number;
	    color: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new LoyaltyTier(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.minPoints = source["minPoints"];
	        this.pointsRate = source["pointsRate"];
	        this.discountPct = source["discountPct"];
	        this.color = source["color"];
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
	export class LoyaltyTransaction {
	    id: number;
	    customerId: string;
	    points: number;
	    type: string;
	    referenceId?: string;
	    description: string;
	    staffId?: string;
	    timestamp: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new LoyaltyTransaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.customerId = source["customerId"];
	        this.points = source["points"];
	        this.type = source["type"];
	        this.referenceId = source["referenceId"];
	        this.description = source["description"];
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
	export class MessageLog {
	    id: number;
	    providerId: string;
	    recipient: string;
	    templateId?: string;
	    content: string;
	    status: string;
	    errorMsg?: string;
	    saleId?: string;
	    customerId?: string;
	    staffId?: string;
	    timestamp: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new MessageLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.providerId = source["providerId"];
	        this.recipient = source["recipient"];
	        this.templateId = source["templateId"];
	        this.content = source["content"];
	        this.status = source["status"];
	        this.errorMsg = source["errorMsg"];
	        this.saleId = source["saleId"];
	        this.customerId = source["customerId"];
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
	export class MessageTemplate {
	    id: string;
	    name: string;
	    type: string;
	    content: string;
	    variables?: string;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new MessageTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.content = source["content"];
	        this.variables = source["variables"];
	        this.isActive = source["isActive"];
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
	export class MessagingProvider {
	    id: string;
	    name: string;
	    type: string;
	    apiKey?: string;
	    apiSecret?: string;
	    phone?: string;
	    isDefault: boolean;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new MessagingProvider(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.apiKey = source["apiKey"];
	        this.apiSecret = source["apiSecret"];
	        this.phone = source["phone"];
	        this.isDefault = source["isDefault"];
	        this.isActive = source["isActive"];
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
	export class NotificationLog {
	    id: number;
	    templateId: string;
	    recipient: string;
	    channel: string;
	    status: string;
	    error?: string;
	    sentAt: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new NotificationLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.templateId = source["templateId"];
	        this.recipient = source["recipient"];
	        this.channel = source["channel"];
	        this.status = source["status"];
	        this.error = source["error"];
	        this.sentAt = source["sentAt"];
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
	export class NotificationSettings {
	    whatsappApiKey?: string;
	    whatsappPhone?: string;
	    smsCheckpoint?: string;
	    enableWhatsApp: boolean;
	    enableSMS: boolean;
	    lowStockAlert: boolean;
	    dailySummary: boolean;
	    paymentReminder: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NotificationSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.whatsappApiKey = source["whatsappApiKey"];
	        this.whatsappPhone = source["whatsappPhone"];
	        this.smsCheckpoint = source["smsCheckpoint"];
	        this.enableWhatsApp = source["enableWhatsApp"];
	        this.enableSMS = source["enableSMS"];
	        this.lowStockAlert = source["lowStockAlert"];
	        this.dailySummary = source["dailySummary"];
	        this.paymentReminder = source["paymentReminder"];
	    }
	}
	export class NotificationTemplate {
	    id: string;
	    name: string;
	    type: string;
	    channel: string;
	    subject?: string;
	    body: string;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new NotificationTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.channel = source["channel"];
	        this.subject = source["subject"];
	        this.body = source["body"];
	        this.isActive = source["isActive"];
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
	    itemsJson: string;
	    customerName: string;
	    customerId: string;
	    note: string;
	    total: number;
	    itemsCount: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ParkedSale(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.itemsJson = source["itemsJson"];
	        this.customerName = source["customerName"];
	        this.customerId = source["customerId"];
	        this.note = source["note"];
	        this.total = source["total"];
	        this.itemsCount = source["itemsCount"];
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
	
	export class ProductKitItem {
	    id: number;
	    productId: string;
	    productName: string;
	    qty: number;
	    unitPrice: number;
	
	    static createFrom(source: any = {}) {
	        return new ProductKitItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.qty = source["qty"];
	        this.unitPrice = source["unitPrice"];
	    }
	}
	export class ProductKit {
	    id: string;
	    name: string;
	    description?: string;
	    price: number;
	    isActive: boolean;
	    items: ProductKitItem[];
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ProductKit(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.price = source["price"];
	        this.isActive = source["isActive"];
	        this.items = this.convertValues(source["items"], ProductKitItem);
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
	
	
	export class ProductTax {
	    id: number;
	    productId: string;
	    taxRateId: string;
	
	    static createFrom(source: any = {}) {
	        return new ProductTax(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.taxRateId = source["taxRateId"];
	    }
	}
	
	
	
	export class RecurringInvoiceItem {
	    id: number;
	    productId: string;
	    name: string;
	    price: number;
	    qty: number;
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new RecurringInvoiceItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.name = source["name"];
	        this.price = source["price"];
	        this.qty = source["qty"];
	        this.total = source["total"];
	    }
	}
	export class RecurringInvoice {
	    id: string;
	    customerId: string;
	    customerName: string;
	    frequency: string;
	    startDate: string;
	    endDate?: string;
	    nextRunDate: string;
	    subtotal: number;
	    discount: number;
	    vat: number;
	    total: number;
	    paymentMethod: string;
	    status: string;
	    items: RecurringInvoiceItem[];
	    lastRunDate?: string;
	    runCount: number;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new RecurringInvoice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.customerId = source["customerId"];
	        this.customerName = source["customerName"];
	        this.frequency = source["frequency"];
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	        this.nextRunDate = source["nextRunDate"];
	        this.subtotal = source["subtotal"];
	        this.discount = source["discount"];
	        this.vat = source["vat"];
	        this.total = source["total"];
	        this.paymentMethod = source["paymentMethod"];
	        this.status = source["status"];
	        this.items = this.convertValues(source["items"], RecurringInvoiceItem);
	        this.lastRunDate = source["lastRunDate"];
	        this.runCount = source["runCount"];
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
	
	export class ReorderAlert {
	    id: string;
	    productId: string;
	    productName: string;
	    currentStock: number;
	    reorderPoint: number;
	    suggestedQty: number;
	    supplierId?: string;
	    supplierName?: string;
	    daysUntilStockout: number;
	
	    static createFrom(source: any = {}) {
	        return new ReorderAlert(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.currentStock = source["currentStock"];
	        this.reorderPoint = source["reorderPoint"];
	        this.suggestedQty = source["suggestedQty"];
	        this.supplierId = source["supplierId"];
	        this.supplierName = source["supplierName"];
	        this.daysUntilStockout = source["daysUntilStockout"];
	    }
	}
	export class ReorderRule {
	    id: string;
	    productId: string;
	    productName: string;
	    supplierId?: string;
	    reorderPoint: number;
	    reorderQty: number;
	    autoOrder: boolean;
	    // Go type: time
	    lastOrderedAt?: any;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ReorderRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.supplierId = source["supplierId"];
	        this.reorderPoint = source["reorderPoint"];
	        this.reorderQty = source["reorderQty"];
	        this.autoOrder = source["autoOrder"];
	        this.lastOrderedAt = this.convertValues(source["lastOrderedAt"], null);
	        this.isActive = source["isActive"];
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
	export class ReportTemplate {
	    id: string;
	    name: string;
	    description: string;
	    type: string;
	    dataSource: string;
	    columns: string;
	    filters?: string;
	    sortBy?: string;
	    groupBy?: string;
	    chartType?: string;
	    isShared: boolean;
	    createdBy?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ReportTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.type = source["type"];
	        this.dataSource = source["dataSource"];
	        this.columns = source["columns"];
	        this.filters = source["filters"];
	        this.sortBy = source["sortBy"];
	        this.groupBy = source["groupBy"];
	        this.chartType = source["chartType"];
	        this.isShared = source["isShared"];
	        this.createdBy = source["createdBy"];
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
	
	
	
	export class ScheduledExport {
	    id: string;
	    reportId: string;
	    name: string;
	    format: string;
	    frequency: string;
	    recipients: string;
	    // Go type: time
	    lastRunAt?: any;
	    // Go type: time
	    nextRunAt?: any;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ScheduledExport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.reportId = source["reportId"];
	        this.name = source["name"];
	        this.format = source["format"];
	        this.frequency = source["frequency"];
	        this.recipients = source["recipients"];
	        this.lastRunAt = this.convertValues(source["lastRunAt"], null);
	        this.nextRunAt = this.convertValues(source["nextRunAt"], null);
	        this.isActive = source["isActive"];
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
	
	export class StaffPerformance {
	    staffId: string;
	    staffName: string;
	    totalSales: number;
	    salesCount: number;
	    avgSaleValue: number;
	    totalReturns: number;
	    returnsCount: number;
	    commission: number;
	    periodStart: string;
	    periodEnd: string;
	
	    static createFrom(source: any = {}) {
	        return new StaffPerformance(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.staffId = source["staffId"];
	        this.staffName = source["staffName"];
	        this.totalSales = source["totalSales"];
	        this.salesCount = source["salesCount"];
	        this.avgSaleValue = source["avgSaleValue"];
	        this.totalReturns = source["totalReturns"];
	        this.returnsCount = source["returnsCount"];
	        this.commission = source["commission"];
	        this.periodStart = source["periodStart"];
	        this.periodEnd = source["periodEnd"];
	    }
	}
	export class StockAdjustment {
	    id: string;
	    productId: string;
	    productName: string;
	    type: string;
	    qtyBefore: number;
	    qtyAfter: number;
	    delta: number;
	    reason: string;
	    costImpact: number;
	    staffId: string;
	    staffName: string;
	    note?: string;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new StockAdjustment(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.type = source["type"];
	        this.qtyBefore = source["qtyBefore"];
	        this.qtyAfter = source["qtyAfter"];
	        this.delta = source["delta"];
	        this.reason = source["reason"];
	        this.costImpact = source["costImpact"];
	        this.staffId = source["staffId"];
	        this.staffName = source["staffName"];
	        this.note = source["note"];
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
	export class StockTransferItem {
	    id: number;
	    productId: string;
	    productName: string;
	    qty: number;
	
	    static createFrom(source: any = {}) {
	        return new StockTransferItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.qty = source["qty"];
	    }
	}
	export class StockTransfer {
	    id: string;
	    fromBranch: string;
	    toBranch: string;
	    status: string;
	    staffId: string;
	    staffName: string;
	    note?: string;
	    items: StockTransferItem[];
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new StockTransfer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.fromBranch = source["fromBranch"];
	        this.toBranch = source["toBranch"];
	        this.status = source["status"];
	        this.staffId = source["staffId"];
	        this.staffName = source["staffName"];
	        this.note = source["note"];
	        this.items = this.convertValues(source["items"], StockTransferItem);
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
	
	export class StockVarianceReport {
	    productId: string;
	    productName: string;
	    systemQty: number;
	    physicalQty: number;
	    variance: number;
	    variancePct: number;
	    costImpact: number;
	
	    static createFrom(source: any = {}) {
	        return new StockVarianceReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.systemQty = source["systemQty"];
	        this.physicalQty = source["physicalQty"];
	        this.variance = source["variance"];
	        this.variancePct = source["variancePct"];
	        this.costImpact = source["costImpact"];
	    }
	}
	
	export class TaxRate {
	    id: string;
	    name: string;
	    code: string;
	    rate: number;
	    type: string;
	    isDefault: boolean;
	    isCompound: boolean;
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new TaxRate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.code = source["code"];
	        this.rate = source["rate"];
	        this.type = source["type"];
	        this.isDefault = source["isDefault"];
	        this.isCompound = source["isCompound"];
	        this.isActive = source["isActive"];
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
	export class TaxReport {
	    taxRateId: string;
	    taxName: string;
	    taxCode: string;
	    taxRate: number;
	    totalSales: number;
	    totalTax: number;
	    totalReturns: number;
	    returnTax: number;
	    netTax: number;
	    periodStart: string;
	    periodEnd: string;
	
	    static createFrom(source: any = {}) {
	        return new TaxReport(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.taxRateId = source["taxRateId"];
	        this.taxName = source["taxName"];
	        this.taxCode = source["taxCode"];
	        this.taxRate = source["taxRate"];
	        this.totalSales = source["totalSales"];
	        this.totalTax = source["totalTax"];
	        this.totalReturns = source["totalReturns"];
	        this.returnTax = source["returnTax"];
	        this.netTax = source["netTax"];
	        this.periodStart = source["periodStart"];
	        this.periodEnd = source["periodEnd"];
	    }
	}
	
	export class Voucher {
	    id: string;
	    code: string;
	    name: string;
	    type: string;
	    value: number;
	    minPurchase: number;
	    maxUses: number;
	    usedCount: number;
	    isActive: boolean;
	    // Go type: time
	    expiresAt?: any;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Voucher(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.code = source["code"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.value = source["value"];
	        this.minPurchase = source["minPurchase"];
	        this.maxUses = source["maxUses"];
	        this.usedCount = source["usedCount"];
	        this.isActive = source["isActive"];
	        this.expiresAt = this.convertValues(source["expiresAt"], null);
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
	export class WalletTransaction {
	    id: number;
	    customerId: string;
	    amount: number;
	    type: string;
	    referenceId?: string;
	    description: string;
	    staffId?: string;
	    timestamp: number;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new WalletTransaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.customerId = source["customerId"];
	        this.amount = source["amount"];
	        this.type = source["type"];
	        this.referenceId = source["referenceId"];
	        this.description = source["description"];
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
	export class WasteRecord {
	    id: number;
	    productId: string;
	    productName: string;
	    qty: number;
	    wasteType: string;
	    costLoss: number;
	    reason: string;
	    staffId: string;
	    staffName: string;
	    date: string;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new WasteRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.productId = source["productId"];
	        this.productName = source["productName"];
	        this.qty = source["qty"];
	        this.wasteType = source["wasteType"];
	        this.costLoss = source["costLoss"];
	        this.reason = source["reason"];
	        this.staffId = source["staffId"];
	        this.staffName = source["staffName"];
	        this.date = source["date"];
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

