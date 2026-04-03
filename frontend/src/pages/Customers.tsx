import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Customer } from '@/types';
import { Search, Plus, Pencil, Trash2, Users, Wallet, Eye, UserPlus, Star, Clock } from 'lucide-react';
import { wailsApp } from '@/lib/wails';

const Customers: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: '',
  });

  const { data: customersData, isLoading } = useQuery<{ 0: Customer[]; 1: number }>({
    queryKey: ['customers', page, 20, searchQuery],
    queryFn: () => wailsApp.GetCustomers(page, 20, searchQuery),
  });

  const customers = customersData?.[0] || [];
  const totalCustomers = customersData?.[1] || 0;
  const totalPages = Math.ceil(totalCustomers / 20);

  const totalDebt = customers.reduce((sum: number, c: Customer) => sum + c.debt + c.installmentDebt, 0);

  const createMutation = useMutation({
    mutationFn: (customer: Partial<Customer>) => wailsApp.CreateCustomer(customer as Customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notify('تم إضافة العميل بنجاح', 'success');
      handleCloseModal();
    },
    onError: () => notify('فشل في إضافة العميل', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (customer: Partial<Customer>) => wailsApp.UpdateCustomer(customer as Customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notify('تم تحديث العميل بنجاح', 'success');
      handleCloseModal();
    },
    onError: () => notify('فشل في تحديث العميل', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wailsApp.DeleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notify('تم حذف العميل', 'success');
    },
    onError: () => notify('فشل في حذف العميل', 'error'),
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
    setViewingCustomer(null);
    setFormData({ name: '', phone: '', notes: '' });
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        notes: customer.notes || '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      notify('يرجى ملء الحقول المطلوبة', 'error');
      return;
    }
    if (editingCustomer) {
      updateMutation.mutate({ ...editingCustomer, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-primary-400" />
            قاعدة بيانات العملاء
          </h1>
          <p className="text-brand-accent/50 font-medium mt-1">إدارة بيانات العملاء، الديون ونقاط الولاء</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 px-6 shadow-xl shadow-primary-500/20">
          <UserPlus size={20} />
          <span className="font-bold">إضافة عميل جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'إجمالي العملاء', value: totalCustomers, icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'إجمالي الديون', value: totalDebt.toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <Wallet size={20} />, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'العملاء المميزون', value: customers.filter((c: Customer) => c.points > 100).length, icon: <Star size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} border border-white/5`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-brand-accent/40 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black dark:text-white text-gray-900">{stat.value} <span className="text-sm opacity-30">{stat.suffix}</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-brand-border/30">
          <div className="relative w-full max-w-md group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-accent/30 group-focus-within:text-primary-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="input pr-12 py-3 bg-brand-dark/20 border-brand-border/20 focus:bg-brand-dark/40"
              placeholder="بحث باسم العميل، رقم الهاتف، أو ملاحظات..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-brand-accent/30 space-y-4">
              <div className="w-20 h-20 rounded-full bg-brand-dark/30 flex items-center justify-center border-2 border-dashed border-brand-border/50">
                <Users className="w-10 h-10 opacity-50" />
              </div>
              <p className="font-bold">لم يتم العثور على عملاء</p>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead>
                <tr className="bg-brand-dark/30 border-b border-brand-border/30">
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">معلومات العميل</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">رقم الهاتف</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">الدين المستحق</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">النقاط</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/10">
                {customers.map((customer: Customer) => (
                  <tr key={customer.id} className="hover:bg-brand-dark/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-black text-xs">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-white text-gray-900 leading-none mb-1 group-hover:text-primary-400 transition-colors">{customer.name}</p>
                          <p className="text-[10px] text-brand-accent/40 font-medium truncate max-w-[150px]">{customer.notes || 'لا توجد ملاحظات'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-mono font-bold text-brand-accent/70 bg-brand-dark/40 px-3 py-1 rounded-lg border border-brand-border/20">
                        {customer.phone}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className={`text-sm font-black ${(customer.debt + customer.installmentDebt) > 0 ? 'text-red-400' : 'text-green-500'}`}>
                          {(customer.debt + customer.installmentDebt).toLocaleString('ar-IQ')} <span className="text-[10px]">د.ع</span>
                        </span>
                        {customer.installmentDebt > 0 && <span className="text-[9px] font-bold text-yellow-500/70">منها أقساط: {customer.installmentDebt.toLocaleString('ar-IQ')}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-[10px] font-black border border-primary-500/20">
                        <Star size={10} fill="currentColor" />
                        {customer.points}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewingCustomer(customer)} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleOpenModal(customer)} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if ((customer.debt + customer.installmentDebt) > 0) {
                              notify('لا يمكن حذف عميل عليه ديون', 'error');
                              return;
                            }
                            // eslint-disable-next-line no-alert
                            if (confirm('هل أنت متأكد من حذف هذا العميل؟')) deleteMutation.mutate(customer.id);
                          }}
                          className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 bg-brand-dark/20 border-t border-brand-border/30 flex items-center justify-center gap-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-xs">السابق</button>
            <span className="text-xs font-bold text-brand-accent/50">صفحة {page} من {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-2 text-xs">التالي</button>
          </div>
        )}
      </div>

      {(showModal || viewingCustomer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md">
          <div className="bg-brand-surface border border-brand-border/50 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
            {viewingCustomer ? (
              <>
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-20 h-20 rounded-3xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-black text-3xl mb-4 border border-primary-500/20">
                    {viewingCustomer.name.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-black dark:text-white text-gray-900">{viewingCustomer.name}</h2>
                  <p className="text-brand-accent/50 font-mono mt-1">{viewingCustomer.phone}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-brand-dark/30 rounded-2xl p-4 border border-brand-border/30">
                    <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-3">الوضع المالي</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center"><span className="text-xs text-brand-accent/60">الدين العادي</span><span className="text-sm font-black text-red-400">{viewingCustomer.debt.toLocaleString('ar-IQ')} د.ع</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs text-brand-accent/60">دين الأقساط</span><span className="text-sm font-black text-yellow-500">{viewingCustomer.installmentDebt.toLocaleString('ar-IQ')} د.ع</span></div>
                      <div className="h-px bg-brand-border/20 my-1" />
                      <div className="flex justify-between items-center"><span className="text-xs font-bold dark:text-white text-gray-900">إجمالي المستحق</span><span className="text-lg font-black dark:text-white text-gray-900">{(viewingCustomer.debt + viewingCustomer.installmentDebt).toLocaleString('ar-IQ')} د.ع</span></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-brand-dark/30 rounded-2xl p-4 border border-brand-border/30">
                      <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">المشتريات</p>
                      <p className="text-base font-black dark:text-white text-gray-900 truncate">{viewingCustomer.totalPurchases.toLocaleString('ar-IQ')}</p>
                    </div>
                    <div className="bg-brand-dark/30 rounded-2xl p-4 border border-brand-border/30 text-center">
                      <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">نقاط الولاء</p>
                      <p className="text-base font-black text-primary-400">{viewingCustomer.points}</p>
                    </div>
                  </div>

                  {viewingCustomer.lastVisit && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-brand-accent/40 justify-center">
                      <Clock size={12} />
                      آخر زيارة: {viewingCustomer.lastVisit}
                    </div>
                  )}
                </div>
                
                <button onClick={handleCloseModal} className="btn-secondary w-full mt-8 py-3 font-bold">إغلاق النافذة</button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black dark:text-white text-gray-900 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
                      {editingCustomer ? <Pencil size={20} /> : <UserPlus size={20} />}
                    </div>
                    {editingCustomer ? 'تعديل العميل' : 'إضافة عميل'}
                  </h2>
                  <button onClick={handleCloseModal} className="text-brand-accent/30 hover:dark:text-white text-gray-900 transition-colors">
                    <Plus className="rotate-45" size={32} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">اسم العميل بالكامل *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input py-3" placeholder="أدخل اسم العميل..." required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">رقم الهاتف *</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input py-3 font-mono" placeholder="07XXXXXXXX..." required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">ملاحظات العميل</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input resize-none py-3 h-24" placeholder="عنوان، تفاصيل إضافية..." />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="btn-primary flex-1 py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-primary-500/20" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingCustomer ? 'حفظ التعديلات' : 'إضافة للقاعدة'}
                    </button>
                    <button type="button" onClick={handleCloseModal} className="btn-secondary px-8 font-bold">إلغاء</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
