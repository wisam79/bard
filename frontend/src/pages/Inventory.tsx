import React, { useEffect, useState } from 'react';
import { PackageSearch, Plus, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import { usePurchaseOrderStore } from '@/store/purchaseOrderStore';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import PurchaseOrderForm from '@/components/features/PurchaseOrderForm';
import type { PurchaseOrder } from '@/types';

type InventoryFilter = 'all' | 'pending' | 'received' | 'cancelled';

const filters: Array<{ id: InventoryFilter; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'received', label: 'مستلم' },
  { id: 'cancelled', label: 'ملغى' },
];

const Inventory: React.FC = () => {
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
      {/* Header */}
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

      {/* Filters & Search */}
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
          {filters.map((f) => (
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

      {/* Orders List */}
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

export default Inventory;
