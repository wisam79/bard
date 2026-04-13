import React, { useState, useEffect } from 'react';
import { Trash2, Search, Package } from 'lucide-react';
import { usePurchaseOrderStore } from '@/store/purchaseOrderStore';
import Button from '@/components/ui/Button';
import type { PurchaseOrder, PurchaseOrderItem, Supplier, Product } from '@/types';
import { wailsApp } from '@/lib/wails';

interface PurchaseOrderFormProps {
  onClose: () => void;
  initialData?: PurchaseOrder;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ onClose, initialData }) => {
  const { createOrder, updateOrder } = usePurchaseOrderStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [supplierId, setSupplierId] = useState(initialData?.supplierId || '');
  const [supplierName, setSupplierName] = useState(initialData?.supplierName || '');
  const [items, setItems] = useState<Partial<PurchaseOrderItem>[]>(initialData?.items || []);
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [searchProduct, setSearchProduct] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchProduct);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchProduct]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const prods = await wailsApp.GetProducts(1, 50, debouncedSearch, '');
        setProducts(prods?.data || []);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'تعذر تحميل المنتجات.');
      }
    };
    fetchProducts();
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const sups = await wailsApp.GetSuppliers();
        setSuppliers(sups || []);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'تعذر تحميل الموردين.');
      }
    };
    fetchSuppliers();
  }, []);

  const total = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const addItem = (product: Product) => {
    // Check if already in list
    const exists = items.find(i => i.productId === product.id);
    if (exists) {
        setItems(items.map(i => i.productId === product.id ? { ...i, qty: (i.qty || 0) + 1, total: ((i.qty || 0) + 1) * (i.cost || 0) } : i));
    } else {
        setItems([...items, {
            productId: product.id,
            name: product.name,
            qty: 1,
            cost: product.cost,
            total: product.cost * 1
        }]);
    }
  };

  const updateItem = (index: number, field: 'qty' | 'cost', value: number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    item[field] = value;
    item.total = (item.qty || 0) * (item.cost || 0);
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !supplierName || items.length === 0) {
      setError('يرجى ملء جميع الحقول واختيار منتج واحد على الأقل.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (initialData) {
        await updateOrder({
          ...initialData,
          supplierId,
          supplierName,
          items: items as PurchaseOrderItem[],
          total,
        });
      } else {
        await createOrder({
          supplierId,
          supplierName,
          date: new Date().toISOString().split('T')[0],
          status: 'pending',
          items: items as PurchaseOrderItem[],
          total,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) => product.name.includes(searchProduct) || product.barcode.includes(searchProduct),
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500 font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-brand-accent/50 block">المورد</label>
          <select
            value={supplierId}
            onChange={(e) => {
              setSupplierId(e.target.value);
              const sup = suppliers.find(s => s.id === e.target.value);
              if (sup) setSupplierName(sup.name);
            }}
            className="w-full bg-brand-dark/50 border border-brand-border/35 rounded-xl px-4 py-2 text-brand-accent focus:border-primary-500/50 outline-none"
            required
          >
            <option value="">-- اختر المورد --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>)}
          </select>
        </div>
      </div>

      <div className="border border-brand-border/35 rounded-2xl overflow-hidden bg-brand-dark/25">
        <div className="p-4 border-b border-brand-border/25 flex items-center justify-between">
            <h3 className="font-bold text-brand-accent text-sm">إضافة منتجات</h3>
            <div className="relative w-64">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted/60" />
                <input 
                    type="text" 
                    placeholder="بحث في المنتجات..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full bg-brand-surface border border-brand-border/35 rounded-lg py-1.5 pr-8 pl-3 text-xs text-brand-accent outline-none focus:border-primary-500/50"
                />
            </div>
        </div>

        {searchProduct && (
            <div className="max-h-40 overflow-y-auto bg-brand-surface/50 p-2 border-b border-brand-border/25">
                {products.slice(0,10).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 hover:bg-brand-dark/40 rounded-lg cursor-pointer" onClick={() => { addItem(p); setSearchProduct(''); }}>
                        <div className="text-sm font-bold text-brand-accent">{p.name}</div>
                        <div className="text-xs text-brand-accent/50">{p.barcode} • {p.cost.toFixed(2)} د.ع</div>
                    </div>
                ))}
            </div>
        )}

        <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
            {items.length === 0 ? (
                <div className="text-center py-8 text-brand-muted/60 flex flex-col items-center">
                    <Package size={24} className="mb-2 opacity-30" />
                    <span className="text-sm font-bold">لم يتم إضافة منتجات بعد</span>
                </div>
            ) : (
                items.map((item, idx) => (
                <div key={item.productId || `item-${idx}`} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-brand-surface p-3 rounded-xl border border-brand-border/25">
                    <div className="flex-1 min-w-[120px]">
                    <span className="text-sm font-bold text-brand-accent">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                    <label className="text-xs text-brand-accent/50">الكمية</label>
                    <input
                        type="number"
                        min={1}
                        value={item.qty || ''}
                        onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                        className="w-20 bg-brand-dark/50 border border-brand-border/35 rounded-lg px-2 py-1.5 text-sm text-brand-accent outline-none text-center"
                    />
                    </div>
                    
                    <div className="flex items-center gap-2">
                    <label className="text-xs text-brand-accent/50">التكلفة</label>
                    <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.cost || ''}
                        onChange={(e) => updateItem(idx, 'cost', Number(e.target.value))}
                        className="w-24 bg-brand-dark/50 border border-brand-border/35 rounded-lg px-2 py-1.5 text-sm text-brand-accent outline-none text-center"
                    />
                    </div>

                    <div className="w-24 text-left font-black text-green-400">
                    {(item.total || 0).toFixed(2)}
                    </div>

                    <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-400/50 hover:text-red-400 transition-colors p-2"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                ))
            )}
        </div>
        
        <div className="bg-brand-dark/45 p-4 border-t border-brand-border/25 flex justify-between items-center">
            <span className="text-sm font-bold text-brand-accent/60">إجمالي الطلب</span>
            <span className="text-xl font-black text-primary-400">{total.toFixed(2)} د.ع</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-brand-border/25">
        <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
          إلغاء
        </Button>
        <Button variant="primary" type="submit" loading={loading} disabled={items.length === 0 || !supplierId}>
          {initialData ? 'حفظ التعديلات' : 'إنشاء أمر الشراء'}
        </Button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
