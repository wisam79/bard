import React, { useState, useMemo } from 'react';
import { RotateCcw, Minus, Plus, AlertTriangle, Package } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Sale, SaleItem } from '@/types';
import { useActivityLog } from '@/store/activityLog';

interface ReturnQty {
  productId: string;
  qty: number;
  maxQty: number;
  name: string;
  price: number;
}

interface PartialReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  onConfirm: (saleId: string, items: { productId: string; qty: number }[]) => Promise<void>;
}

const PartialReturnDialog: React.FC<PartialReturnDialogProps> = ({
  isOpen,
  onClose,
  sale,
  onConfirm,
}) => {
  const [returnMap, setReturnMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logActivity = useActivityLog((s) => s.log);

  // Build returnable items list
  const returnableItems: ReturnQty[] = useMemo(() => {
    if (!sale) return [];
    return sale.items
      .filter((item) => {
        const available = item.quantity - (item.returnedQty || 0);
        return available > 0;
      })
      .map((item) => ({
        productId: item.id || item.productId,
        qty: 0,
        maxQty: item.quantity - (item.returnedQty || 0),
        name: item.name,
        price: item.price,
      }));
  }, [sale]);

  // Selected items with qty > 0
  const selectedItems = useMemo(
    () =>
      returnableItems
        .filter((item) => (returnMap[item.productId] || 0) > 0)
        .map((item) => ({
          ...item,
          qty: returnMap[item.productId] || 0,
        })),
    [returnableItems, returnMap],
  );

  // Return total
  const returnTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [selectedItems],
  );

  const updateQty = (productId: string, delta: number) => {
    setReturnMap((prev) => {
      const item = returnableItems.find((i) => i.productId === productId);
      if (!item) return prev;
      const current = prev[productId] || 0;
      const next = Math.max(0, Math.min(item.maxQty, current + delta));
      return { ...prev, [productId]: next };
    });
    setError(null);
  };

  const handleConfirm = async () => {
    if (!sale || selectedItems.length === 0) {
      setError('يرجى تحديد عنصر واحد على الأقل للإرجاع');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(
        sale.id,
        selectedItems.map((item) => ({
          productId: item.productId,
          qty: item.qty,
        })),
      );
      logActivity('sale:partial-return', `إرجاع جزئي — فاتورة ${sale.id.slice(0, 8)}`, `${selectedItems.length} عنصر — ${returnTotal.toFixed(2)}`);
      setReturnMap({});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الإرجاع');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReturnMap({});
    setError(null);
    onClose();
  };

  if (!sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إرجاع جزئي"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={selectedItems.length === 0}
            icon={<RotateCcw size={16} />}
          >
            تأكيد الإرجاع ({returnTotal.toFixed(2)})
          </Button>
        </>
      }
    >
      {/* Sale info header */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-brand-dark/20 border border-brand-border/20">
        <div>
          <p className="text-xs text-brand-accent/40 font-bold">رقم الفاتورة</p>
          <p className="text-sm font-black text-brand-accent">{sale.id.slice(0, 8)}...</p>
        </div>
        <div>
          <p className="text-xs text-brand-accent/40 font-bold">التاريخ</p>
          <p className="text-sm font-bold text-brand-accent">{sale.date}</p>
        </div>
        <div>
          <p className="text-xs text-brand-accent/40 font-bold">الإجمالي</p>
          <p className="text-sm font-black text-green-400">{sale.total.toFixed(2)}</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm font-bold">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Items list */}
      {returnableItems.length === 0 ? (
        <div className="text-center py-12">
          <Package size={40} className="mx-auto mb-3 text-brand-accent/20" />
          <p className="text-brand-accent/40 font-bold">لا توجد عناصر قابلة للإرجاع</p>
          <p className="text-brand-accent/25 text-sm mt-1">تم إرجاع جميع عناصر هذه الفاتورة مسبقاً</p>
        </div>
      ) : (
        <div className="space-y-2">
          {returnableItems.map((item) => {
            const qty = returnMap[item.productId] || 0;
            const isSelected = qty > 0;

            return (
              <div
                key={item.productId}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-red-500/5 border-red-500/30'
                    : 'bg-brand-dark/10 border-brand-border/15 hover:border-brand-border/30'
                }`}
              >
                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-brand-accent truncate">{item.name}</p>
                  <p className="text-xs text-brand-accent/40 mt-0.5">
                    السعر: {item.price.toFixed(2)} • متاح: {item.maxQty}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.productId, -1)}
                    disabled={qty <= 0}
                    className="w-8 h-8 rounded-lg bg-brand-dark/30 flex items-center justify-center transition-all hover:bg-brand-dark/50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} className="text-brand-accent/60" />
                  </button>

                  <span
                    className={`w-10 text-center font-black text-sm ${
                      isSelected ? 'text-red-400' : 'text-brand-accent/30'
                    }`}
                  >
                    {qty}
                  </span>

                  <button
                    onClick={() => updateQty(item.productId, 1)}
                    disabled={qty >= item.maxQty}
                    className="w-8 h-8 rounded-lg bg-brand-dark/30 flex items-center justify-center transition-all hover:bg-brand-dark/50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} className="text-brand-accent/60" />
                  </button>
                </div>

                {/* Line total */}
                <div className="w-20 text-left">
                  {isSelected && (
                    <span className="text-sm font-black text-red-400">
                      -{(item.price * qty).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {selectedItems.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-brand-accent/60">
              إجمالي المبلغ المُرجع ({selectedItems.length} عنصر)
            </span>
            <span className="text-lg font-black text-red-400">
              -{returnTotal.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PartialReturnDialog;
