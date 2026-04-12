import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Product, CartItem, AppPreferences, Sale, PaginatedSales, DeliveryDriver, DeliveryOrder } from '@/types';
import { ReceiptData } from '@/types';
import { ShoppingCart, User, CreditCard, FileText, Truck, Plus, MapPin, Phone, CheckCircle, Trash2 } from 'lucide-react';
import BarcodeScanner from '@/components/features/BarcodeScanner';
import { PrintReceipt, BarcodeDisplay } from '@/components/ui';
import CategoryBar from '../components/features/sales/CategoryBar';
import ProductGrid from '../components/features/sales/ProductGrid';
import CartList from '../components/features/sales/CartList';
import PaymentModal from '../components/features/sales/PaymentModal';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

type SalesTab = 'pos' | 'invoices' | 'delivery';

const paymentMethodLabels: Record<string, string> = {
  cash: 'نقداً',
  card: 'بطاقة',
  credit: 'آجل',
  installment: 'أقساط',
};

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'مكتملة', color: 'text-green-400', bg: 'bg-green-500/10' },
  pending: { label: 'معلقة', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  return: { label: 'مرتجعة', color: 'text-red-400', bg: 'bg-red-500/10' },
  cancelled: { label: 'ملغاة', color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const deliveryStatusColors: Record<string, string> = { pending: 'bg-amber-500/10 text-amber-500', assigned: 'bg-blue-500/10 text-blue-500', in_transit: 'bg-purple-500/10 text-purple-500', delivered: 'bg-emerald-500/10 text-emerald-500', failed: 'bg-red-500/10 text-red-500' };
const deliveryStatusLabels: Record<string, string> = { pending: 'قيد الانتظار', assigned: 'تم التعيين', picked_up: 'تم الاستلام', in_transit: 'في الطريق', delivered: 'تم التوصيل', failed: 'فشل' };

const TAB_ITEMS: { id: SalesTab; label: string; icon: React.ReactNode }[] = [
  { id: 'pos', label: 'نقطة البيع', icon: <ShoppingCart size={16} /> },
  { id: 'invoices', label: 'الفواتير', icon: <FileText size={16} /> },
  { id: 'delivery', label: 'التوصيل', icon: <Truck size={16} /> },
];

const POSTab: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showPrintReceipt, setShowPrintReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const { data: preferences } = useQuery<AppPreferences>({
    queryKey: ['preferences'],
    queryFn: () => wailsApp.GetPreferences(),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products', 1, 100, selectedCategory],
    queryFn: () => wailsApp.GetProducts(1, 100, '', selectedCategory),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => wailsApp.GetCategories(),
  });

  const handleProductFound = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.product.price }
            : item
        );
      }
      return [...prev, { product, qty: 1, discount: 0, total: product.price }];
    });
    notify(`تمت إضافة ${product.name}`, 'success');
  }, [notify]);

  const handleProductError = useCallback((error: string) => {
    notify(error, 'error');
  }, [notify]);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.product.price }
            : item
        );
      }
      return [...prev, { product, qty: 1, discount: 0, total: product.price }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, qty, total: qty * item.product.price }
          : item
      )
    );
  }, [removeFromCart]);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;

  const generateAndPrintReceipt = useCallback((sale: Sale) => {
    const receiptItems = sale.items?.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })) || [];
    const sub = sale.subtotal || receiptItems.reduce((sum, item) => sum + item.total, 0);

    const data: ReceiptData = {
      storeName: preferences?.storeName || 'Bard',
      storeAddress: preferences?.storeAddress || '',
      storePhone: preferences?.storePhone || '',
      receiptNo: `#${sale.id.slice(0, 8)}`,
      date: sale.date,
      cashier: sale.staffName || '',
      customerName: sale.customerName || 'عميل نقدي',
      items: receiptItems,
      subtotal: sub,
      discount: sale.discount,
      tax: sale.vat,
      total: sale.total,
      paymentMethod: sale.paymentMethod === 'cash' ? 'نقداً' : sale.paymentMethod === 'card' ? 'بطاقة' : 'آجل',
      barcode: sale.id.slice(0, 8),
      footer: 'شكراً لزيارتكم، نأمل أن نراكم مرة أخرى',
    };
    setReceiptData(data);
    setShowPrintReceipt(true);
  }, [preferences]);

  useEffect(() => {
    if (preferences?.autoPrint && lastSale) {
      generateAndPrintReceipt(lastSale);
      setLastSale(null);
    }
  }, [generateAndPrintReceipt, lastSale, preferences?.autoPrint]);

  const createSaleMutation = useMutation<Sale>({
    mutationFn: async () => {
      const saleData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.qty,
          price: item.product.price,
          total: item.total,
          saleId: '',
          id: '',
          cost: item.product.cost,
          discount: 0,
          returnedQty: 0
        })),
        customerId: '',
        customerName: customerName,
        total: total,
        discount: discount,
        vat: 0,
        paymentMethod: paymentMethod,
        status: 'completed',
        timestamp: Date.now(),
        id: '',
        date: '',
        itemsCount: cart.length,
        pointsAwarded: 0,
        createdAt: '',
        updatedAt: '',
      };
      await wailsApp.CreateSale(saleData as Sale);
      const recentSales = await wailsApp.GetRecentSales(1);
      return recentSales[0] ?? {
        ...(saleData as Sale),
        id: `pending-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
      };
    },
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      notify('تمت عملية البيع بنجاح', 'success');
      setCart([]);
      setDiscount(0);
      setShowPaymentModal(false);
      setLastSale(sale);

      if (!preferences?.autoPrint) {
        generateAndPrintReceipt(sale);
      }
    },
    onError: () => {
      notify('فشل في إتمام عملية البيع', 'error');
    },
  });

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) {
      notify('السلة فارغة', 'error');
      return;
    }
    setShowPaymentModal(true);
  }, [cart.length, notify]);

  const confirmSale = useCallback(() => {
    createSaleMutation.mutate();
  }, [createSaleMutation]);

  return (
    <div className="h-full flex overflow-hidden animate-fade-in bg-brand-dark/5" data-testid="page-sales">
      {receiptData && showPrintReceipt && (
        <PrintReceipt
          data={receiptData}
          paperSize={preferences?.thermalPaperSize as '58mm' | '80mm' || '80mm'}
          className="hidden"
        />
      )}

      <div className="flex-1 p-6 overflow-hidden flex flex-col relative min-h-0">
        <div className="flex items-center gap-4 mb-6 z-10">
          <div className="flex-1">
            <BarcodeScanner
              onProductFound={handleProductFound}
              onError={handleProductError}
              placeholder="ابحث عن منتج أو امسح الباركود..."
            />
          </div>
          <button
            className="h-14 bg-brand-surface/40 dark:bg-brand-dark/40 px-6 rounded-2xl border border-brand-border/20 text-brand-accent/70 font-black text-[11px] flex items-center gap-3 shadow-sm hover:bg-brand-border/20 transition-all active:scale-95 uppercase tracking-widest"
            onClick={() => notify('سيتم تنفيذ اختيار العميل قريباً', 'info')}
          >
            <User size={18} className="text-primary-500" />
            <span className="hidden lg:inline">{customerName || 'عميل نقدي'}</span>
          </button>
        </div>

        <div className="z-10 relative">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar z-10 pr-1">
          <ProductGrid
            products={productsData?.data}
            addToCart={addToCart}
          />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="w-[360px] bg-brand-surface/40 dark:bg-brand-dark/40 backdrop-blur-3xl border-r border-brand-border/20 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.05)] z-20 relative">
        <div className="p-6 border-b border-brand-border/10 bg-brand-border/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-500/10 p-2.5 rounded-xl border border-primary-500/10">
                <ShoppingCart className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-brand-accent">السلة</h2>
                <p className="text-[9px] font-black text-brand-accent/20 uppercase tracking-[0.2em] mt-0.5">Sale Engine</p>
              </div>
            </div>
            <div className="bg-primary-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg shadow-primary-500/20">
              {cart.length} أصناف
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar pr-1">
          <CartList
            cart={cart}
            updateQty={updateQty}
            removeFromCart={removeFromCart}
          />
        </div>

        <div className="p-6 bg-brand-border/5 backdrop-blur-md border-t border-brand-border/10 space-y-5">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-black text-brand-accent/30 uppercase tracking-widest">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toLocaleString('ar-IQ')} د.ع</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-[10px] font-black text-rose-500 uppercase tracking-widest">
                <span>الخصم</span>
                <span>- {discount.toLocaleString('ar-IQ')} د.ع</span>
              </div>
            )}
            <div className="pt-5 border-t border-brand-border/10">
              <div className="flex items-center justify-between">
                <span className="text-brand-accent/30 font-black text-[10px] uppercase tracking-[0.2em]">الإجمالي النهائي</span>
                <div className="text-right">
                  <span className="text-primary-500 font-black text-3xl tracking-tighter">
                    {total.toLocaleString('ar-IQ')}
                  </span>
                  <span className="text-[10px] font-black text-brand-accent/20 mr-2 uppercase">د.ع</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            data-testid="checkout-button"
            className="w-full h-15 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all py-4"
          >
            <CreditCard size={18} />
            إتمام العملية (F12)
          </button>
        </div>
      </div>

      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        confirmSale={confirmSale}
        isPending={createSaleMutation.isPending}
        customerName={customerName}
        setCustomerName={setCustomerName}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        discount={discount}
        setDiscount={setDiscount}
        subtotal={subtotal}
        total={total}
      />
    </div>
  );
};

const InvoicesTab: React.FC = () => {
  const { notify } = useAppStore();
  const getToken = useAuthStore.getState().getToken;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [printData, setPrintData] = useState<ReceiptData | null>(null);

  const { data: preferences } = useQuery<AppPreferences>({
    queryKey: ['preferences'],
    queryFn: () => wailsApp.GetPreferences(),
  });

  const { data: salesData, isLoading } = useQuery<PaginatedSales>({
    queryKey: ['sales', page, 20, searchQuery, statusFilter],
    queryFn: () => wailsApp.GetSales(page, 20, searchQuery, statusFilter),
  });

  const returnMutation = useMutation({
    mutationFn: (saleId: string) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wailsApp.ProcessReturn(token, saleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      notify('تم إرجاع الفاتورة بنجاح', 'success');
      setViewingSale(null);
    },
    onError: () => notify('فشل في إرجاع الفاتورة', 'error'),
  });

  const generateReceiptData = useCallback((sale: Sale): ReceiptData => {
    return {
      storeName: preferences?.storeName || 'Bard',
      storeAddress: preferences?.storeAddress || '',
      storePhone: preferences?.storePhone || '',
      receiptNo: `#${sale.id.slice(0, 8)}`,
      date: sale.date,
      cashier: sale.staffName || '',
      customerName: sale.customerName || 'عميل نقدي',
      items: sale.items?.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })) || [],
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.vat,
      total: sale.total,
      paymentMethod: paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod,
      note: sale.note || undefined,
      barcode: sale.id.slice(0, 8),
      footer: 'شكراً لزيارتكم، نأمل أن نراكم مرة أخرى',
    };
  }, [preferences]);

  const handlePrintInvoice = useCallback((sale: Sale) => {
    const data = generateReceiptData(sale);
    setPrintData(data);
  }, [generateReceiptData]);

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <PrintReceipt
        data={printData}
        paperSize={preferences?.thermalPaperSize as '58mm' | '80mm' || '80mm'}
        className="hidden"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الفواتير', value: salesData?.stats?.count || 0, icon: <FileText size={20} />, color: 'text-blue-400' },
          { label: 'إجمالي المبيعات', value: (salesData?.stats?.total || 0).toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <CreditCard size={20} />, color: 'text-primary-400' },
          { label: 'فواتير معلقة', value: salesData?.stats?.pending || 0, icon: <FileText size={20} />, color: 'text-yellow-400' },
          { label: 'المرتجعات', value: salesData?.stats?.returns || 0, icon: <FileText size={20} />, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border/30 rounded-2xl p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-brand-dark/40 flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-accent/40 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black dark:text-white text-gray-900">{stat.value} <span className="text-[10px] opacity-50">{stat.suffix}</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-brand-border/30 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="input pr-10 bg-brand-dark/20 border-brand-border/20"
              placeholder="بحث برقم الفاتورة أو اسم العميل..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input bg-brand-dark/20 border-brand-border/20 w-full md:w-48 appearance-none"
          >
            <option value="">جميع الحالات</option>
            <option value="completed">مكتملة</option>
            <option value="pending">معلقة</option>
            <option value="return">مرتجعة</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : salesData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-brand-accent/30 space-y-4">
              <FileText size={48} className="opacity-20" />
              <p className="font-bold">لا توجد فواتير مطابقة للبحث</p>
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-dark/30 border-b border-brand-border/30">
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">رقم الفاتورة / العميل</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">التاريخ</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">الإجمالي</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">الدفع</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">الحالة</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/10">
                {salesData?.data?.map((sale: Sale) => (
                  <tr key={sale.id} className="hover:bg-brand-dark/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-dark/40 flex items-center justify-center border border-brand-border/30">
                          <FileText size={18} className="text-brand-accent/40" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold dark:text-white text-gray-900 leading-none mb-1">#{sale.id.slice(0, 8)}</p>
                          <p className="text-[10px] text-brand-accent/40 font-medium truncate max-w-[150px]">{sale.customerName || 'عميل نقدي'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-bold text-brand-accent/60">{sale.date}</td>
                    <td className="py-4 px-6 text-center">
                      <p className={`text-sm font-black ${sale.status === 'return' ? 'text-red-400' : 'dark:text-white text-gray-900'}`}>
                        {sale.status === 'return' ? '-' : ''}{Math.abs(sale.total).toLocaleString('ar-IQ')} <span className="text-[10px]">د.ع</span>
                      </p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[10px] font-black text-brand-accent/60 bg-brand-dark/40 px-3 py-1 rounded-full border border-brand-border/20 uppercase">
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border border-white/5 ${statusLabels[sale.status]?.bg} ${statusLabels[sale.status]?.color}`}>
                        {statusLabels[sale.status]?.label || sale.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewingSale(sale)} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all">
                          عرض
                        </button>
                        {sale.status === 'completed' && (
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من إرجاع هذه الفاتورة؟')) {
                                returnMutation.mutate(sale.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-red-400 hover:border-red-500/50 transition-all"
                          >
                            إرجاع
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {salesData && salesData.totalPages > 1 && (
          <div className="p-4 bg-brand-dark/20 border-t border-brand-border/30 flex items-center justify-center gap-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-xs">السابق</button>
            <span className="text-xs font-bold text-brand-accent/50">صفحة {page} من {salesData.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(salesData.totalPages || 1, p + 1))} disabled={page === salesData.totalPages} className="btn-secondary px-4 py-2 text-xs">التالي</button>
          </div>
        )}
      </div>

      <Modal isOpen={!!viewingSale} onClose={() => setViewingSale(null)} title="تفاصيل الفاتورة" size="xl">
        {viewingSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">العميل</p>
                  <p className="text-sm font-bold dark:text-white text-gray-900">{viewingSale.customerName || 'عميل نقدي'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">البائع</p>
                  <p className="text-sm font-bold dark:text-white text-gray-900">{viewingSale.staffName || '-'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">رقم الفاتورة</p>
                  <p className="text-sm font-mono font-bold dark:text-white text-gray-900">{viewingSale.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">التاريخ</p>
                  <p className="text-sm font-bold dark:text-white text-gray-900">{viewingSale.date}</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-dark/30 rounded-2xl border border-brand-border/30 overflow-hidden">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-brand-dark/50 border-b border-brand-border/30">
                    <th className="py-3 px-4 text-[10px] font-black text-brand-accent/40">الصنف</th>
                    <th className="py-3 px-4 text-[10px] font-black text-brand-accent/40 text-center">الكمية</th>
                    <th className="py-3 px-4 text-[10px] font-black text-brand-accent/40 text-center">السعر</th>
                    <th className="py-3 px-4 text-[10px] font-black text-brand-accent/40 text-left">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/10">
                  {viewingSale.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 text-xs font-bold dark:text-white text-gray-900">{item.name}</td>
                      <td className="py-3 px-4 text-xs font-black dark:text-white text-gray-900 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-xs font-bold text-brand-accent/60 text-center">{item.price.toLocaleString('ar-IQ')}</td>
                      <td className="py-3 px-4 text-xs font-black dark:text-white text-gray-900 text-left">{item.total.toLocaleString('ar-IQ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end gap-3 pt-4 border-t border-brand-border/30">
              <div className="flex justify-between w-full max-w-xs text-xs font-bold">
                <span className="text-brand-accent/50">المجموع الفرعي</span>
                <span className="dark:text-white text-gray-900">{viewingSale.subtotal.toLocaleString('ar-IQ')} د.ع</span>
              </div>
              {viewingSale.discount > 0 && (
                <div className="flex justify-between w-full max-w-xs text-xs font-bold">
                  <span className="text-brand-accent/50">الخصم</span>
                  <span className="text-red-400">-{viewingSale.discount.toLocaleString('ar-IQ')} د.ع</span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-xs pt-3 border-t border-brand-border/20">
                <span className="text-lg font-black dark:text-white text-gray-900">الإجمالي</span>
                <span className="text-2xl font-black text-primary-400">{viewingSale.total.toLocaleString('ar-IQ')} <span className="text-sm">د.ع</span></span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-brand-border/30">
              <Button onClick={() => setViewingSale(null)} variant="secondary">إغلاق</Button>
              <Button onClick={() => viewingSale && handlePrintInvoice(viewingSale)}>طباعة</Button>
              {viewingSale.status === 'completed' && (
                <Button variant="danger" onClick={() => { if (confirm('هل أنت متأكد من إرجاع هذه الفاتورة؟')) returnMutation.mutate(viewingSale.id); }}>إرجاع</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const DeliveryTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'drivers'>('orders');
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [driverForm, setDriverForm] = useState({ name: '', phone: '', vehicleNo: '' });
  const [orderForm, setOrderForm] = useState({ customerName: '', customerPhone: '', address: '', notes: '', fee: 0 });

  const { data: drivers } = useQuery({ queryKey: ['deliveryDrivers'], queryFn: () => wailsApp.GetDeliveryDrivers() });
  const { data: ordersData } = useQuery({ queryKey: ['deliveryOrders', 1, 50, ''], queryFn: () => wailsApp.GetDeliveryOrders(1, 50, '') });

  const orders: DeliveryOrder[] = Array.isArray(ordersData?.[0]) ? ordersData[0] : [];

  const createDriverMutation = useMutation({
    mutationFn: (d: DeliveryDriver) => wailsApp.CreateDeliveryDriver(getToken() || '', d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deliveryDrivers'] }); notify('تم إضافة السائق', 'success'); setShowDriverModal(false); },
    onError: () => notify('فشل في إضافة السائق', 'error'),
  });

  const createOrderMutation = useMutation({
    mutationFn: (o: DeliveryOrder) => wailsApp.CreateDeliveryOrder(getToken() || '', o),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deliveryOrders'] }); notify('تم إنشاء طلب التوصيل', 'success'); setShowOrderModal(false); },
    onError: () => notify('فشل في إنشاء طلب التوصيل', 'error'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => wailsApp.UpdateDeliveryStatus(getToken() || '', id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['deliveryOrders'] }); notify('تم تحديث الحالة', 'success'); },
    onError: () => notify('فشل في تحديث الحالة', 'error'),
  });

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setActiveSubTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'orders' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>طلبات التوصيل</button>
          <button onClick={() => setActiveSubTab('drivers')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'drivers' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>السائقون</button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowOrderModal(true)} variant="secondary" className="flex items-center gap-2"><Plus size={16} /> طلب توصيل</Button>
          <Button onClick={() => setShowDriverModal(true)} className="flex items-center gap-2"><User size={16} /> سائق جديد</Button>
        </div>
      </div>

      {activeSubTab === 'orders' && (
        <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 overflow-auto p-4 space-y-3 shadow-2xl">
          {orders.map((o: DeliveryOrder) => (
            <div key={o.id} className="bg-brand-dark/20 rounded-xl border border-brand-border/15 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /><span className="font-semibold text-sm">{o.customerName}</span></div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${deliveryStatusColors[o.status] || 'bg-gray-500/10 text-gray-500'}`}>{deliveryStatusLabels[o.status] || o.status}</span>
              </div>
              <p className="text-xs text-brand-accent/40 mb-1">{o.address}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-accent/30">{o.customerPhone} {o.driverName && `• السائق: ${o.driverName}`}</span>
                {o.status !== 'delivered' && o.status !== 'failed' && (
                  <Button onClick={() => updateStatusMutation.mutate({ id: o.id, status: o.status === 'pending' ? 'assigned' : o.status === 'assigned' ? 'in_transit' : 'delivered' })} size="sm" className="flex items-center gap-1"><CheckCircle size={12} /> تحديث</Button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-brand-accent/30 py-8">لا توجد طلبات توصيل</p>}
        </div>
      )}

      {activeSubTab === 'drivers' && (
        <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 overflow-auto p-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-3">
            {(drivers || []).map((d: DeliveryDriver) => (
              <div key={d.id} className="bg-brand-dark/20 rounded-xl border border-brand-border/15 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><User size={16} className="text-blue-500" /></div>
                  <div><p className="font-semibold text-sm">{d.name}</p><p className="text-xs text-brand-accent/40 flex items-center gap-1"><Phone size={10} /> {d.phone}</p></div>
                </div>
                <button className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showDriverModal} onClose={() => setShowDriverModal(false)} title="سائق جديد">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الهاتف</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={driverForm.phone} onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">رقم المركبة</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={driverForm.vehicleNo} onChange={e => setDriverForm({ ...driverForm, vehicleNo: e.target.value })} /></div>
          <Button onClick={() => createDriverMutation.mutate({ ...driverForm, id: '', isActive: true, createdAt: '', updatedAt: '' } as DeliveryDriver)} className="w-full">إضافة السائق</Button>
        </div>
      </Modal>

      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="طلب توصيل جديد">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">اسم العميل</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={orderForm.customerName} onChange={e => setOrderForm({ ...orderForm, customerName: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">هاتف العميل</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={orderForm.customerPhone} onChange={e => setOrderForm({ ...orderForm, customerPhone: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">العنوان</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={orderForm.address} onChange={e => setOrderForm({ ...orderForm, address: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">رسوم التوصيل</label><input type="number" className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={orderForm.fee} onChange={e => setOrderForm({ ...orderForm, fee: parseFloat(e.target.value) || 0 })} /></div>
          <Button onClick={() => createOrderMutation.mutate({ ...orderForm, id: '', saleId: '', status: 'pending', createdAt: '', updatedAt: '' } as DeliveryOrder)} className="w-full">إنشاء الطلب</Button>
        </div>
      </Modal>
    </div>
  );
};

const Sales: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SalesTab>('pos');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {activeTab !== 'pos' && (
        <div className="flex items-center gap-1 p-2 px-6 bg-brand-surface/30 border-b border-brand-border/15">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                  : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50 hover:text-brand-accent/70'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'pos' && (
          <div className="h-full relative">
            <div className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-brand-surface/80 backdrop-blur-xl rounded-xl border border-brand-border/20 p-1">
              {TAB_ITEMS.filter(t => t.id !== 'pos').map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black text-brand-accent/40 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            <POSTab />
          </div>
        )}
        {activeTab === 'invoices' && <InvoicesTab />}
        {activeTab === 'delivery' && <DeliveryTab />}
      </div>
    </div>
  );
};

export default Sales;
