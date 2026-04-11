import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Expense } from '@/types';
import { Plus, Pencil, Trash2, Wallet, TrendingDown, TrendingUp, Calendar, Tag, PieChart } from 'lucide-react';
import { wailsApp } from '@/lib/wails';

const Finance: React.FC = () => {
  const { notify } = useAppStore();
  const getToken = useAuthStore.getState().getToken;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'payments'>('expenses');
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    notes: '',
  });

  const { data: expensesData, isLoading } = useQuery<{ 0: Expense[]; 1: number }>({
    queryKey: ['expenses', page, 20, selectedCategory],
    queryFn: () => wailsApp.GetExpenses(page, 20, selectedCategory),
  });

  const expenses = expensesData?.[0] || [];
  const totalExpenses = expensesData?.[1] || 0;
  const totalPages = Math.ceil(totalExpenses / 20);

  const totalAmount = expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);

  const createMutation = useMutation({
    mutationFn: (expense: Partial<Expense>) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wailsApp.CreateExpense(token, expense as Expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      notify('تم إضافة المصروف بنجاح', 'success');
      handleCloseModal();
    },
    onError: () => notify('فشل في إضافة المصروف', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (expense: Partial<Expense>) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wailsApp.UpdateExpense(token, expense as Expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      notify('تم تحديث المصروف بنجاح', 'success');
      handleCloseModal();
    },
    onError: () => notify('فشل في تحديث المصروف', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      return wailsApp.DeleteExpense(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      notify('تم حذف المصروف', 'success');
    },
    onError: () => notify('فشل في حذف المصروف', 'error'),
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({ title: '', amount: 0, date: new Date().toISOString().split('T')[0], category: '', notes: '' });
  };

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        title: expense.title,
        amount: expense.amount,
        date: expense.date,
        category: expense.category,
        notes: expense.notes || '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.amount <= 0) {
      notify('يرجى ملء الحقول المطلوبة', 'error');
      return;
    }
    if (editingExpense) {
      updateMutation.mutate({ ...editingExpense, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const expenseCategories = ['إيجار', 'رواتب', 'كهرباء', 'ماء', 'صيانة', 'مواصلات', 'أخرى'];

  return (
    <div className="p-8 h-full flex flex-col bg-brand-dark/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3">
            <PieChart className="text-primary-400" />
            الإدارة المالية
          </h1>
          <p className="text-brand-accent/50 font-medium mt-1">تتبع المصروفات، المدفوعات والتدفق النقدي</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 px-6 shadow-xl shadow-primary-500/20">
          <Plus size={20} />
          <span className="font-bold">إضافة مصروف جديد</span>
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-brand-surface border border-brand-border/30 rounded-2xl w-fit mb-8 shadow-lg">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'expenses' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-brand-accent/50 hover:text-white'}`}
        >
          سجل المصروفات
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'payments' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-brand-accent/50 hover:text-white'}`}
        >
          المدفوعات والمقبوضات
        </button>
      </div>

      {activeTab === 'expenses' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex items-center gap-5 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                <TrendingDown size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-accent/40 uppercase tracking-widest mb-1">إجمالي المصروفات</p>
                <p className="text-2xl font-black text-red-400">{totalAmount.toLocaleString('ar-IQ')} <span className="text-sm opacity-50">د.ع</span></p>
              </div>
            </div>
            <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex items-center gap-5 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-accent/40 uppercase tracking-widest mb-1">عدد العمليات</p>
                <p className="text-2xl font-black dark:text-white text-gray-900">{totalExpenses}</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-brand-border/30">
              <div className="relative w-full max-w-xs group">
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-accent/30 group-focus-within:text-primary-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="input pr-10 bg-brand-dark/20 border-brand-border/20 appearance-none"
                >
                  <option value="">كل فئات المصاريف</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-brand-accent/30 space-y-4">
                  <Wallet size={48} className="opacity-20" />
                  <p className="font-bold">لا توجد سجلات مصروفات</p>
                </div>
              ) : (
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-dark/30 border-b border-brand-border/30">
                      <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">المصروف / التفاصيل</th>
                      <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">الفئة</th>
                      <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">المبلغ</th>
                      <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">التاريخ</th>
                      <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/10">
                    {expenses.map((expense: Expense) => (
                      <tr key={expense.id} className="hover:bg-brand-dark/20 transition-colors group">
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-bold dark:text-white text-gray-900 leading-none mb-1 group-hover:text-primary-400 transition-colors">{expense.title}</p>
                            <p className="text-[10px] text-brand-accent/40 font-medium truncate max-w-[200px]">{expense.notes || 'لا توجد ملاحظات'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-[10px] font-black text-brand-accent/60 bg-brand-dark/40 px-3 py-1 rounded-full border border-brand-border/20">
                            {expense.category || 'عام'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-black text-red-400">
                          {expense.amount.toLocaleString('ar-IQ')} <span className="text-[10px]">د.ع</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-xs font-bold text-brand-accent/50 flex items-center justify-center gap-2">
                            <Calendar size={12} />
                            {expense.date}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleOpenModal(expense)} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) deleteMutation.mutate(expense.id);
                            }} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 transition-all">
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
        </>
      )}

      {activeTab === 'payments' && (
        <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col items-center justify-center text-brand-accent/30 space-y-4 shadow-xl">
          <TrendingUp size={64} className="opacity-10" />
          <div className="text-center">
            <h3 className="text-xl font-black dark:text-white text-gray-900 mb-1">وحدة المدفوعات</h3>
            <p className="text-sm font-medium">هذه الوحدة قيد التطوير وستكون متاحة في التحديث القادم</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md">
          <div className="bg-brand-surface border border-brand-border/50 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black dark:text-white text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
                  {editingExpense ? <Pencil size={20} /> : <Plus size={20} />}
                </div>
                {editingExpense ? 'تعديل المصروف' : 'إضافة مصروف'}
              </h2>
              <button onClick={handleCloseModal} className="text-brand-accent/30 hover:dark:text-white text-gray-900 transition-colors">
                <Plus className="rotate-45" size={32} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">عنوان المصروف *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input py-3" placeholder="مثال: فاتورة كهرباء..." required />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">المبلغ *</label>
                  <div className="relative">
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="input py-3 pl-10" min="0" step="0.01" required />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-accent/30">د.ع</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">التاريخ *</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input py-3" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">الفئة الضريبية / التصنيف</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input py-3">
                  <option value="">اختر التصنيف</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">ملاحظات إضافية</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input resize-none py-3 h-24" placeholder="أدخل تفاصيل إضافية..." />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-primary-500/20" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingExpense ? 'حفظ التغييرات' : 'تسجيل المصروف'}
                </button>
                <button type="button" onClick={handleCloseModal} className="btn-secondary px-8 font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
