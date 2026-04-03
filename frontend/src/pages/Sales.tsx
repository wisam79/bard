import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Product, CartItem, AppPreferences, Sale } from '@/types';
import { ShoppingCart, User, CreditCard } from 'lucide-react';
import BarcodeScanner from '@/components/features/BarcodeScanner';
import { PrintReceipt, ReceiptData } from '@/components/ui';
import CategoryBar from '../components/features/sales/CategoryBar';
import ProductGrid from '../components/features/sales/ProductGrid';
import CartList from '../components/features/sales/CartList';
import PaymentModal from '../components/features/sales/PaymentModal';
import { wailsApp } from '@/lib/wails';

const Sales: React.FC = () => {
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
    const subtotal = sale.subtotal || receiptItems.reduce((sum, item) => sum + item.total, 0);

    const data: ReceiptData = {
      storeName: preferences?.storeName || 'Bard',
      storeAddress: preferences?.storeAddress || '',
      storePhone: preferences?.storePhone || '',
      receiptNo: `#${sale.id.slice(0, 8)}`,
      date: sale.date,
      cashier: sale.staffName || '',
      customerName: sale.customerName || 'عميل نقدي',
      items: receiptItems,
      subtotal,
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

  // Auto-print after sale completion
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
      {/* Print Receipt Component */}
      {receiptData && showPrintReceipt && (
        <PrintReceipt
          data={receiptData}
          paperSize={preferences?.thermalPaperSize as '58mm' | '80mm' || '80mm'}
          className="hidden"
        />
      )}

      {/* Products Section */}
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

        {/* Categories Bar */}
        <div className="z-10 relative">
          <CategoryBar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar z-10 pr-1">
          <ProductGrid
            products={productsData?.data}
            addToCart={addToCart}
          />
        </div>

        {/* Decorative Background Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-500/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Cart Section - Slimmer & Modern */}
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

      {/* Payment Modal */}
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

export default Sales;
