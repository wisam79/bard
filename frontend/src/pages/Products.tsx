import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { usePurchaseOrderStore } from '@/store/purchaseOrderStore';
import { Product, PaginatedProducts, ReorderRule, ReorderAlert, WasteRecord, StockAdjustment } from '@/types';
import { Boxes, Plus, Printer, PackageSearch, RefreshCw, AlertTriangle, Zap, Trash2, Package, CheckCircle, Clock, XCircle, Search, ArrowDownCircle, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import BarcodeDisplay from '@/components/ui/BarcodeDisplay';
import BarcodeLabelsPrint from '@/components/features/BarcodeLabelsPrint';
import PurchaseOrderForm from '@/components/features/PurchaseOrderForm';
import ProductStats from '../components/features/products/ProductStats';
import ProductFilters from '../components/features/products/ProductFilters';
import ProductTable from '../components/features/products/ProductTable';
import ProductPagination from '../components/features/products/ProductPagination';
import ProductFormModal from '../components/features/products/ProductFormModal';
import { wailsApp } from '@/lib/wails';

type ProductsTabId = 'products' | 'inventory' | 'reorder' | 'waste';

const TAB_ITEMS: { id: ProductsTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'products', label: 'المنتجات', icon: <Boxes size={16} /> },
  { id: 'inventory', label: 'المخزون', icon: <PackageSearch size={16} /> },
  { id: 'reorder', label: 'إعادة الطلب', icon: <RefreshCw size={16} /> },
  { id: 'waste', label: 'الهدر', icon: <AlertTriangle size={16} /> },
];

const ProductsTab: React.FC = () => {
  const { notify } = useAppStore();
  const getToken = useAuthStore.getState().getToken;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [showBarcodeLabels, setShowBarcodeLabels] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    category: '',
    wholesalePrice: 0,
    description: '',
  });

  const { data: productsData, isLoading } = useQuery<PaginatedProducts>({
    queryKey: ['products', page, 20, searchQuery, selectedCategory],
    queryFn: () => wailsApp.GetProducts(page, 20, searchQuery, selectedCategory),
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: () => wailsApp.GetCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (product: Partial<Product>) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wailsApp.CreateProduct(token, product as Product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notify('تم إضافة المنتج بنجاح', 'success');
      handleCloseModal();
    },
    onError: () => notify('فشل في إضافة المنتج', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (product: Partial<Product>) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wailsApp.UpdateProduct(token, product as Product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notify('تم تحديث المنتج بنجاح', 'success');
      handleCloseModal();
    },
    onError: () => notify('فشل في تحديث المنتج', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wailsApp.DeleteProduct(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notify('تم حذف المنتج', 'success');
    },
    onError: () => notify('فشل في حذف المنتج', 'error'),
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', barcode: '', price: 0, cost: 0, stock: 0, minStock: 5, category: '', wholesalePrice: 0, description: '' });
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        category: product.category,
        wholesalePrice: product.wholesalePrice,
        description: product.description || '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.barcode) {
      notify('يرجى ملء الحقول المطلوبة', 'error');
      return;
    }
    if (editingProduct) {
      updateMutation.mutate({ ...editingProduct, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <BarcodeLabelsPrint isOpen={showBarcodeLabels} onClose={() => setShowBarcodeLabels(false)} />

      <Modal
        isOpen={showBarcodeModal}
        onClose={() => { setShowBarcodeModal(false); setBarcodeProduct(null); }}
        title="عرض الباركود"
        size="md"
        footer={
          <>
            <Button
              onClick={() => { setShowBarcodeModal(false); setShowBarcodeLabels(true); }}
              icon={<Printer size={18} />}
            >
              طباعة ملصقات
            </Button>
            <Button
              onClick={() => setShowBarcodeModal(false)}
              variant="secondary"
            >
              إغلاق
            </Button>
          </>
        }
      >
        {barcodeProduct && (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white p-4 rounded-xl">
              <BarcodeDisplay
                value={barcodeProduct.barcode || barcodeProduct.id}
                format="CODE128"
                width={2}
                height={120}
                fontSize={14}
                showValue={true}
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{barcodeProduct.name}</p>
              <p className="text-primary-500 font-black text-xl">
                {barcodeProduct.price.toLocaleString('ar-IQ')} د.ع
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-gray-500 mb-1">التكلفة</p>
                <p className="font-bold">{barcodeProduct.cost.toLocaleString('ar-IQ')} د.ع</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-gray-500 mb-1">المخزون</p>
                <p className="font-bold">{barcodeProduct.stock}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3">
            <Boxes className="text-primary-400" />
            إدارة المنتجات
          </h1>
          <p className="text-brand-accent/50 font-medium mt-1">إضافة، تعديل ومراقبة المخزون الخاص بك</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowBarcodeLabels(true)}
            variant="secondary"
            icon={<Printer size={18} />}
          >
            طباعة ملصقات
          </Button>
          <Button onClick={() => handleOpenModal()} icon={<Plus size={20} />}>
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      <ProductStats productsData={productsData} />

      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        <ProductFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          onFilterChange={() => setPage(1)}
        />

        <div className="flex-1 overflow-auto">
          <ProductTable
            productsData={productsData}
            isLoading={isLoading}
            onPreviewBarcode={(product) => { setBarcodeProduct(product); setShowBarcodeModal(true); }}
            onEditProduct={handleOpenModal}
            onDeleteProduct={(product) => deleteMutation.mutate(product.id)}
          />
        </div>

        <ProductPagination
          page={page}
          setPage={setPage}
          productsData={productsData}
        />
      </div>

      <ProductFormModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        editingProduct={editingProduct}
        handleSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

type InventoryFilter = 'all' | 'pending' | 'received' | 'cancelled';

const inventoryFilters: Array<{ id: InventoryFilter; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'received', label: 'مستلم' },
  { id: 'cancelled', label: 'ملغى' },
];

const InventoryTab: React.FC = () => {
  const { orders, fetchOrders, loading, receiveOrder } = usePurchaseOrderStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InventoryFilter>('all');

  useEffect(() => {
    fetchOrders(1, 100, filter === 'all' ? '' : filter);
  }, [fetchOrders, filter]);

  const handleReceive = async (id: string) => {
    if (window.confirm('هل أنت متأكد من استلام هذا الطلب؟ سيتم إضافة الكميات للمخزون وتحديث التكلفة.')) {
      await receiveOrder(id);
    }
  };

  const filteredOrders = orders.filter(
    (o) => o.supplierName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search),
  );

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-accent">المخزون والمشتريات</h1>
          <p className="text-sm font-bold text-brand-accent/50 mt-1">
            إدارة أوامر الشراء والموردين وتحديث المخزون
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} icon={<Plus size={18} />}>
          أمر شراء جديد
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-brand-surface p-4 rounded-2xl border border-brand-border/20">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-accent/30" size={18} />
          <input
            type="text"
            placeholder="بحث عن أمر شراء أو مورد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-dark/50 border border-brand-border/20 rounded-xl py-2.5 pr-10 pl-4 text-brand-accent focus:outline-none focus:border-primary-500/50 transition-colors"
          />
        </div>

        <div className="flex bg-brand-dark/30 rounded-lg p-1">
          {inventoryFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                filter === f.id
                  ? 'bg-brand-surface text-brand-accent shadow-sm'
                  : 'text-brand-accent/40 hover:text-brand-accent/70'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border/20 rounded-2xl overflow-auto flex-1 shadow-xl custom-scrollbar">
        {loading && orders.length === 0 ? (
          <div className="p-8 text-center text-brand-accent/50 text-sm font-bold">جاري التحميل...</div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="لا توجد أوامر شراء"
            description="لم يتم العثور على أي أوامر تطابق معايير البحث."
            action={{
              label: 'أمر شراء جديد',
              icon: Plus,
              onClick: () => setIsFormOpen(true),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-brand-dark/20 border-b border-brand-border/15">
                  <th className="py-4 px-6 text-sm font-black text-brand-accent/50">رقم الأمر</th>
                  <th className="py-4 px-6 text-sm font-black text-brand-accent/50">المورد</th>
                  <th className="py-4 px-6 text-sm font-black text-brand-accent/50">التاريخ</th>
                  <th className="py-4 px-6 text-sm font-black text-brand-accent/50">المبلغ</th>
                  <th className="py-4 px-6 text-sm font-black text-brand-accent/50">الحالة</th>
                  <th className="py-4 px-6 text-sm font-black text-brand-accent/50 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-brand-border/10">
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs bg-brand-dark/40 px-2 py-1 rounded text-brand-accent/60">
                        {order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-accent">
                      {order.supplierName}
                    </td>
                    <td className="py-4 px-6 text-brand-accent/70 text-sm font-medium">
                      {order.date}
                    </td>
                    <td className="py-4 px-6 font-black text-green-400">
                      {order.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {order.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                          <Clock size={12} />
                          قيد الانتظار
                        </span>
                      )}
                      {order.status === 'received' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                          <CheckCircle size={12} />
                          مستلم
                        </span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
                          <XCircle size={12} />
                          ملغى
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-left space-x-2 space-x-reverse">
                      {order.status === 'pending' && (
                        <Button size="sm" onClick={() => handleReceive(order.id)}>
                          استلام
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="أمر شراء جديد"
        size="xl"
      >
        <PurchaseOrderForm onClose={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
};

const ReorderTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({ productId: '', reorderPoint: 0, reorderQty: 0, autoOrder: false });

  const { data: alerts } = useQuery({ queryKey: ['reorderAlerts'], queryFn: () => wailsApp.GetReorderAlerts() });
  const { data: rules } = useQuery({ queryKey: ['reorderRules'], queryFn: () => wailsApp.GetReorderRules() });

  const createRuleMutation = useMutation({
    mutationFn: (r: ReorderRule) => wailsApp.CreateReorderRule(getToken() || '', r),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reorderRules'] }); notify('تم إنشاء القاعدة', 'success'); setShowRuleModal(false); },
    onError: () => notify('فشل في إنشاء القاعدة', 'error'),
  });

  const autoReorderMutation = useMutation({
    mutationFn: () => wailsApp.AutoReorder(getToken() || ''),
    onSuccess: (count: number) => { queryClient.invalidateQueries({ queryKey: ['reorderAlerts'] }); notify(`تم إعادة طلب ${count} منتج تلقائياً`, 'success'); },
    onError: () => notify('فشل في إعادة الطلب', 'error'),
  });

  const alertCount = (alerts || []).length;

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center"><RefreshCw size={20} className="text-teal-500" /></div>
          <div><h1 className="text-xl font-bold">إعادة الطلب التلقائي</h1><p className="text-xs text-brand-accent/40 dark:text-white/30">إعداد نقاط إعادة الطلب التلقائية للمخزون</p></div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => autoReorderMutation.mutate()} variant="secondary" className="flex items-center gap-2"><Zap size={16} /> إعادة طلب تلقائية</Button>
          <Button onClick={() => setShowRuleModal(true)} className="flex items-center gap-2"><Plus size={16} /> قاعدة جديدة</Button>
        </div>
      </div>

      {alertCount > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-500" />
          <span className="text-sm font-semibold text-amber-500">{alertCount} منتج يحتاج إعادة طلب</span>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'alerts' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>تنبيهات المخزون</button>
        <button onClick={() => setActiveTab('rules')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'rules' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>قواعد إعادة الطلب</button>
      </div>

      {activeTab === 'alerts' && (
        <div className="grid gap-3">
          {(alerts || []).map((a: ReorderAlert) => (
            <div key={a.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-amber-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Package size={16} className="text-amber-500" /></div>
                <div>
                  <p className="font-semibold text-sm">{a.productName}</p>
                  <p className="text-xs text-brand-accent/40 dark:text-white/30">المخزون الحالي: {a.currentStock} • نقطة الطلب: {a.reorderPoint}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-teal-500">الكمية المقترحة: {a.suggestedQty}</p>
                {a.supplierName && <p className="text-xs text-brand-accent/30 dark:text-white/20">المورد: {a.supplierName}</p>}
              </div>
            </div>
          ))}
          {alertCount === 0 && <p className="text-center text-brand-accent/30 dark:text-white/20 py-8">لا توجد تنبيهات حالياً</p>}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="grid gap-3">
          {(rules || []).map((r: ReorderRule) => (
            <div key={r.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 dark:border-white/[0.04] p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{r.productName || r.productId}</p>
                <p className="text-xs text-brand-accent/40 dark:text-white/30">نقطة الطلب: {r.reorderPoint} • الكمية: {r.reorderQty} {r.autoOrder ? '• تلقائي' : ''}</p>
              </div>
              <button onClick={() => {}} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} title="قاعدة إعادة طلب جديدة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">معرف المنتج</label><input className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="أدخل معرف المنتج" value={ruleForm.productId} onChange={e => setRuleForm({ ...ruleForm, productId: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">نقطة إعادة الطلب</label><input type="number" className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={ruleForm.reorderPoint} onChange={e => setRuleForm({ ...ruleForm, reorderPoint: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">كمية الطلب</label><input type="number" className="w-full bg-brand-surface/50 dark:bg-[#1e1e1e] border border-brand-border/20 dark:border-white/10 rounded-lg px-3 py-2 text-sm" value={ruleForm.reorderQty} onChange={e => setRuleForm({ ...ruleForm, reorderQty: parseFloat(e.target.value) || 0 })} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={ruleForm.autoOrder} onChange={e => setRuleForm({ ...ruleForm, autoOrder: e.target.checked })} /><label className="text-sm">إعادة طلب تلقائية</label></div>
          <Button onClick={() => createRuleMutation.mutate({ ...ruleForm, id: '', productName: '', supplierId: '', lastOrderedAt: undefined, isActive: true, createdAt: '', updatedAt: '' } as ReorderRule)} className="w-full">إنشاء القاعدة</Button>
        </div>
      </Modal>
    </div>
  );
};

const WasteTab: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'waste' | 'adjustments' | 'variance'>('waste');
  const [showWasteModal, setShowWasteModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [filterType, setFilterType] = useState('');

  const [wasteForm, setWasteForm] = useState({ productId: '', wasteType: 'spoilage', reason: '', qty: 0 });
  const [adjustForm, setAdjustForm] = useState({ productId: '', type: 'correction', reason: '', newQty: 0 });

  const { data: wasteData } = useQuery({
    queryKey: ['wasteRecords', 1, 100, filterType],
    queryFn: () => wailsApp.GetWasteRecords(1, 100, filterType),
  });

  const { data: adjustmentsData } = useQuery({
    queryKey: ['stockAdjustments', 1, 100, ''],
    queryFn: () => wailsApp.GetStockAdjustments(1, 100, ''),
  });

  const wasteRecords = wasteData?.data || wasteData?.[0] || [];
  const adjustments = adjustmentsData?.data || adjustmentsData?.[0] || [];

  const createWasteMutation = useMutation({
    mutationFn: (data: { productId: string; wasteType: string; reason: string; qty: number }) => wailsApp.CreateWasteRecord(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wasteRecords'] }); notify('تم تسجيل الهدر بنجاح', 'success'); setShowWasteModal(false); },
    onError: () => notify('فشل في تسجيل الهدر', 'error'),
  });

  const createAdjustMutation = useMutation({
    mutationFn: (data: { productId: string; type: string; reason: string; newQty: number }) => wailsApp.CreateStockAdjustment(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['stockAdjustments'] }); notify('تم تسجيل التسوية بنجاح', 'success'); setShowAdjustModal(false); },
    onError: () => notify('فشل في تسجيل التسوية', 'error'),
  });

  const totalWasteCost = (Array.isArray(wasteRecords) ? wasteRecords : []).reduce((sum: number, r: WasteRecord) => sum + r.costLoss, 0);

  const wasteTypeLabels: Record<string, string> = {
    spoilage: 'تلف',
    damage: 'كسر',
    expired: 'منتهي الصلاحية',
    theft: 'سرقة',
    other: 'أخرى',
  };

  const tabs = [
    { id: 'waste' as const, label: 'سجل الهدر', icon: Trash2 },
    { id: 'adjustments' as const, label: 'التسويات', icon: ArrowDownCircle },
    { id: 'variance' as const, label: 'تقرير الفروقات', icon: Filter },
  ];

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">الهدر وتسويات المخزون</h1>
            <p className="text-sm text-brand-accent/50">تتبع الهدر والتالف وتسويات المخزون</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-red-500/10 px-4 py-2 rounded-lg">
            <p className="text-[10px] text-red-400">إجمالي خسائر الهدر</p>
            <p className="font-bold text-red-400">{totalWasteCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-brand-border/20 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-brand-accent/60 hover:bg-brand-surface'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'waste' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <select className="bg-brand-surface border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">كل الأنواع</option>
              <option value="spoilage">تلف</option>
              <option value="damage">كسر</option>
              <option value="expired">منتهي</option>
              <option value="theft">سرقة</option>
              <option value="other">أخرى</option>
            </select>
            <Button onClick={() => { setWasteForm({ productId: '', wasteType: 'spoilage', reason: '', qty: 0 }); setShowWasteModal(true); }}>
              <Plus className="w-4 h-4 ml-1" /> تسجيل هدر
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border/20">
                  <th className="text-right py-2 px-3">المنتج</th>
                  <th className="text-right py-2 px-3">النوع</th>
                  <th className="text-right py-2 px-3">الكمية</th>
                  <th className="text-right py-2 px-3">الخسارة</th>
                  <th className="text-right py-2 px-3">السبب</th>
                  <th className="text-right py-2 px-3">الموظف</th>
                  <th className="text-right py-2 px-3">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(wasteRecords) ? wasteRecords : []).map((r: WasteRecord) => (
                  <tr key={r.id} className="border-b border-brand-border/10 hover:bg-brand-surface/50">
                    <td className="py-2 px-3 font-medium">{r.productName}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        r.wasteType === 'spoilage' ? 'bg-amber-500/20 text-amber-400' :
                        r.wasteType === 'damage' ? 'bg-red-500/20 text-red-400' :
                        r.wasteType === 'expired' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-brand-accent/20 text-brand-accent'
                      }`}>
                        {wasteTypeLabels[r.wasteType] || r.wasteType}
                      </span>
                    </td>
                    <td className="py-2 px-3">{r.qty}</td>
                    <td className="py-2 px-3 text-red-400 font-bold">{r.costLoss.toLocaleString()}</td>
                    <td className="py-2 px-3 text-brand-accent/60">{r.reason}</td>
                    <td className="py-2 px-3">{r.staffName}</td>
                    <td className="py-2 px-3 text-brand-accent/40">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'adjustments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setAdjustForm({ productId: '', type: 'correction', reason: '', newQty: 0 }); setShowAdjustModal(true); }}>
              <Plus className="w-4 h-4 ml-1" /> تسوية جديدة
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border/20">
                  <th className="text-right py-2 px-3">المنتج</th>
                  <th className="text-right py-2 px-3">النوع</th>
                  <th className="text-right py-2 px-3">قبل</th>
                  <th className="text-right py-2 px-3">بعد</th>
                  <th className="text-right py-2 px-3">الفرق</th>
                  <th className="text-right py-2 px-3">السبب</th>
                  <th className="text-right py-2 px-3">الموظف</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(adjustments) ? adjustments : []).map((a: StockAdjustment) => (
                  <tr key={a.id} className="border-b border-brand-border/10 hover:bg-brand-surface/50">
                    <td className="py-2 px-3 font-medium">{a.productName}</td>
                    <td className="py-2 px-3">{a.type}</td>
                    <td className="py-2 px-3">{a.qtyBefore}</td>
                    <td className="py-2 px-3">{a.qtyAfter}</td>
                    <td className={`py-2 px-3 font-bold ${a.delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {a.delta > 0 ? '+' : ''}{a.delta}
                    </td>
                    <td className="py-2 px-3 text-brand-accent/60">{a.reason}</td>
                    <td className="py-2 px-3">{a.staffName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'variance' && (
        <div className="bg-brand-surface rounded-xl p-6 border border-brand-border/20 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-brand-accent/30" />
          <p className="text-brand-accent/40">تقرير الفروقات يتطلب جرد فعلي</p>
          <p className="text-sm text-brand-accent/30 mt-1">قم بتسوية المخزون أولاً ثم راجع التقرير</p>
        </div>
      )}

      {showWasteModal && (
        <Modal isOpen={showWasteModal} onClose={() => setShowWasteModal(false)} title="تسجيل هدر">
          <div className="space-y-4 p-4">
            <div>
              <label className="text-sm text-brand-accent/60 mb-1 block">معرف المنتج</label>
              <input className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={wasteForm.productId} onChange={(e) => setWasteForm({ ...wasteForm, productId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-brand-accent/60 mb-1 block">نوع الهدر</label>
                <select className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={wasteForm.wasteType} onChange={(e) => setWasteForm({ ...wasteForm, wasteType: e.target.value })}>
                  <option value="spoilage">تلف</option>
                  <option value="damage">كسر</option>
                  <option value="expired">منتهي الصلاحية</option>
                  <option value="theft">سرقة</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-brand-accent/60 mb-1 block">الكمية</label>
                <input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={wasteForm.qty || ''} onChange={(e) => setWasteForm({ ...wasteForm, qty: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-sm text-brand-accent/60 mb-1 block">السبب</label>
              <textarea className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" rows={2} value={wasteForm.reason} onChange={(e) => setWasteForm({ ...wasteForm, reason: e.target.value })} />
            </div>
            <Button className="w-full" onClick={() => createWasteMutation.mutate(wasteForm)}>تسجيل الهدر</Button>
          </div>
        </Modal>
      )}

      {showAdjustModal && (
        <Modal isOpen={showAdjustModal} onClose={() => setShowAdjustModal(false)} title="تسوية مخزون">
          <div className="space-y-4 p-4">
            <div>
              <label className="text-sm text-brand-accent/60 mb-1 block">معرف المنتج</label>
              <input className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={adjustForm.productId} onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-brand-accent/60 mb-1 block">نوع التسوية</label>
                <select className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}>
                  <option value="correction">تصحيح</option>
                  <option value="count">جرد</option>
                  <option value="transfer">تحويل</option>
                  <option value="damage">تلف</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-brand-accent/60 mb-1 block">الكمية الجديدة</label>
                <input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={adjustForm.newQty || ''} onChange={(e) => setAdjustForm({ ...adjustForm, newQty: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="text-sm text-brand-accent/60 mb-1 block">السبب</label>
              <textarea className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" rows={2} value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} />
            </div>
            <Button className="w-full" onClick={() => createAdjustMutation.mutate(adjustForm)}>تسجيل التسوية</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Products: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProductsTabId>('products');

  return (
    <div className="h-full flex flex-col overflow-hidden">
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
      <div className="flex-1 overflow-auto">
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'reorder' && <ReorderTab />}
        {activeTab === 'waste' && <WasteTab />}
      </div>
    </div>
  );
};

export default Products;
