import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Expense, Budget, ApprovalWorkflow, TaxRate, Currency } from '@/types';
import { Plus, Pencil, Trash2, Wallet, TrendingDown, TrendingUp, Calendar, Tag, PieChart, ShieldCheck, AlertTriangle, CheckCircle, Receipt, Percent, Coins, RefreshCw, ArrowRightLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

type FinanceTab = 'expenses' | 'budgets' | 'taxes' | 'currencies';

const TAB_ITEMS: { id: FinanceTab; label: string; icon: React.ReactNode }[] = [
  { id: 'expenses', label: 'المصروفات', icon: <Wallet size={16} /> },
  { id: 'budgets', label: 'الميزانيات', icon: <ShieldCheck size={16} /> },
  { id: 'taxes', label: 'الضرائب', icon: <Receipt size={16} /> },
  { id: 'currencies', label: 'العملات', icon: <Coins size={16} /> },
];

const ExpensesSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const getToken = useAuthStore.getState().getToken;
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'payments'>('expenses');
  const [formData, setFormData] = useState({ title: '', amount: 0, date: new Date().toISOString().split('T')[0], category: '', notes: '' });

  const { data: expensesData, isLoading } = useQuery<{ 0: Expense[]; 1: number }>({
    queryKey: ['expenses', page, 20, selectedCategory],
    queryFn: () => wailsApp.GetExpenses(page, 20, selectedCategory),
  });

  const expenses = expensesData?.[0] || [];
  const totalExpenses = expensesData?.[1] || 0;
  const totalPages = Math.ceil(totalExpenses / 20);
  const totalAmount = expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);

  const createMutation = useMutation({
    mutationFn: (expense: Partial<Expense>) => { const token = getToken(); if (!token) throw new Error('Not authenticated'); return wailsApp.CreateExpense(token, expense as Expense); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); notify('تم إضافة المصروف بنجاح', 'success'); handleCloseModal(); },
    onError: () => notify('فشل في إضافة المصروف', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (expense: Partial<Expense>) => { const token = getToken(); if (!token) throw new Error('Not authenticated'); return wailsApp.UpdateExpense(token, expense as Expense); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); notify('تم تحديث المصروف بنجاح', 'success'); handleCloseModal(); },
    onError: () => notify('فشل في تحديث المصروف', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => { const token = getToken(); if (!token) throw new Error('Not authenticated'); return wailsApp.DeleteExpense(token, id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); notify('تم حذف المصروف', 'success'); },
    onError: () => notify('فشل في حذف المصروف', 'error'),
  });

  const handleCloseModal = () => { setShowModal(false); setEditingExpense(null); setFormData({ title: '', amount: 0, date: new Date().toISOString().split('T')[0], category: '', notes: '' }); };

  const handleOpenModal = (expense?: Expense) => {
    if (expense) { setEditingExpense(expense); setFormData({ title: expense.title, amount: expense.amount, date: expense.date, category: expense.category, notes: expense.notes || '' }); }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.amount <= 0) { notify('يرجى ملء الحقول المطلوبة', 'error'); return; }
    if (editingExpense) { updateMutation.mutate({ ...editingExpense, ...formData }); } else { createMutation.mutate(formData); }
  };

  const expenseCategories = ['إيجار', 'رواتب', 'كهرباء', 'ماء', 'صيانة', 'مواصلات', 'أخرى'];

  return (
    <div className="p-8 h-full flex flex-col bg-brand-dark/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3"><PieChart className="text-primary-400" /> الإدارة المالية</h1>
          <p className="text-brand-accent/50 font-medium mt-1">تتبع المصروفات، المدفوعات والتدفق النقدي</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 px-6 shadow-xl shadow-primary-500/20"><Plus size={20} /><span className="font-bold">إضافة مصروف جديد</span></button>
      </div>

      <div className="flex gap-2 p-1 bg-brand-surface border border-brand-border/30 rounded-2xl w-fit mb-8 shadow-lg">
        <button onClick={() => setActiveSubTab('expenses')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeSubTab === 'expenses' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-brand-accent/50 hover:text-white'}`}>سجل المصروفات</button>
        <button onClick={() => setActiveSubTab('payments')} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeSubTab === 'payments' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-brand-accent/50 hover:text-white'}`}>المدفوعات والمقبوضات</button>
      </div>

      {activeSubTab === 'expenses' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex items-center gap-5 shadow-xl"><div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20"><TrendingDown size={24} /></div><div><p className="text-xs font-bold text-brand-accent/40 uppercase tracking-widest mb-1">إجمالي المصروفات</p><p className="text-2xl font-black text-red-400">{totalAmount.toLocaleString('ar-IQ')} <span className="text-sm opacity-50">د.ع</span></p></div></div>
            <div className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex items-center gap-5 shadow-xl"><div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20"><Wallet size={24} /></div><div><p className="text-xs font-bold text-brand-accent/40 uppercase tracking-widest mb-1">عدد العمليات</p><p className="text-2xl font-black dark:text-white text-gray-900">{totalExpenses}</p></div></div>
          </div>

          <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-brand-border/30">
              <div className="relative w-full max-w-xs group"><Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-accent/30 group-focus-within:text-primary-400" /><select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }} className="input pr-10 bg-brand-dark/20 border-brand-border/20 appearance-none"><option value="">كل فئات المصاريف</option>{expenseCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
            </div>

            <div className="flex-1 overflow-auto">
              {isLoading ? (<div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : expenses.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-brand-accent/30 space-y-4"><Wallet size={48} className="opacity-20" /><p className="font-bold">لا توجد سجلات مصروفات</p></div>
              ) : (
                <table className="w-full text-right border-collapse">
                  <thead><tr className="bg-brand-dark/30 border-b border-brand-border/30"><th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">المصروف / التفاصيل</th><th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">الفئة</th><th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">المبلغ</th><th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">التاريخ</th><th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">إجراءات</th></tr></thead>
                  <tbody className="divide-y divide-brand-border/10">
                    {expenses.map((expense: Expense) => (
                      <tr key={expense.id} className="hover:bg-brand-dark/20 transition-colors group">
                        <td className="py-4 px-6"><div><p className="text-sm font-bold dark:text-white text-gray-900 leading-none mb-1 group-hover:text-primary-400 transition-colors">{expense.title}</p><p className="text-[10px] text-brand-accent/40 font-medium truncate max-w-[200px]">{expense.notes || 'لا توجد ملاحظات'}</p></div></td>
                        <td className="py-4 px-6 text-center"><span className="text-[10px] font-black text-brand-accent/60 bg-brand-dark/40 px-3 py-1 rounded-full border border-brand-border/20">{expense.category || 'عام'}</span></td>
                        <td className="py-4 px-6 text-center font-black text-red-400">{expense.amount.toLocaleString('ar-IQ')} <span className="text-[10px]">د.ع</span></td>
                        <td className="py-4 px-6 text-center"><span className="text-xs font-bold text-brand-accent/50 flex items-center justify-center gap-2"><Calendar size={12} />{expense.date}</span></td>
                        <td className="py-4 px-6"><div className="flex items-center justify-center gap-2"><button onClick={() => handleOpenModal(expense)} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all"><Pencil size={16} /></button><button onClick={() => { if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) deleteMutation.mutate(expense.id); }} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 transition-all"><Trash2 size={16} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 1 && (<div className="p-4 bg-brand-dark/20 border-t border-brand-border/30 flex items-center justify-center gap-4"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-4 py-2 text-xs">السابق</button><span className="text-xs font-bold text-brand-accent/50">صفحة {page} من {totalPages}</span><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-4 py-2 text-xs">التالي</button></div>)}
          </div>
        </>
      )}

      {activeSubTab === 'payments' && (
        <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col items-center justify-center text-brand-accent/30 space-y-4 shadow-xl"><TrendingUp size={64} className="opacity-10" /><div className="text-center"><h3 className="text-xl font-black dark:text-white text-gray-900 mb-1">وحدة المدفوعات</h3><p className="text-sm font-medium">هذه الوحدة قيد التطوير وستكون متاحة في التحديث القادم</p></div></div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md">
          <div className="bg-brand-surface border border-brand-border/50 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-black dark:text-white text-gray-900 flex items-center gap-3"><div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">{editingExpense ? <Pencil size={20} /> : <Plus size={20} />}</div>{editingExpense ? 'تعديل المصروف' : 'إضافة مصروف'}</h2><button onClick={handleCloseModal} className="text-brand-accent/30 hover:dark:text-white text-gray-900 transition-colors"><Plus className="rotate-45" size={32} /></button></div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2"><label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">عنوان المصروف *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input py-3" placeholder="مثال: فاتورة كهرباء..." required /></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">المبلغ *</label><div className="relative"><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="input py-3 pl-10" min="0" step="0.01" required /><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-brand-accent/30">د.ع</span></div></div>
                <div className="space-y-2"><label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">التاريخ *</label><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input py-3" required /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">الفئة الضريبية / التصنيف</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input py-3"><option value="">اختر التصنيف</option>{expenseCategories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
              <div className="space-y-2"><label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">ملاحظات إضافية</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input resize-none py-3 h-24" placeholder="أدخل تفاصيل إضافية..." /></div>
              <div className="flex gap-4 pt-4"><button type="submit" className="btn-primary flex-1 py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-primary-500/20" disabled={createMutation.isPending || updateMutation.isPending}>{editingExpense ? 'حفظ التغييرات' : 'تسجيل المصروف'}</button><button type="button" onClick={handleCloseModal} className="btn-secondary px-8 font-bold">إلغاء</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const BudgetsSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'budgets' | 'workflows'>('budgets');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ name: '', category: '', amount: 0, period: 'monthly' as 'monthly' | 'quarterly' | 'yearly', startDate: '', endDate: '' });
  const [workflowForm, setWorkflowForm] = useState({ name: '', minAmount: 0, maxAmount: 0, requiredLevel: 'manager' as 'manager' | 'admin' });

  const { data: budgets } = useQuery({ queryKey: ['budgets'], queryFn: () => wailsApp.GetBudgets() });
  const { data: workflows } = useQuery({ queryKey: ['approvalWorkflows'], queryFn: () => wailsApp.GetApprovalWorkflows() });

  const createBudgetMutation = useMutation({
    mutationFn: (b: Budget) => wailsApp.CreateBudget(getToken() || '', b),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['budgets'] }); notify('تم إنشاء الميزانية', 'success'); setShowBudgetModal(false); },
    onError: () => notify('فشل في إنشاء الميزانية', 'error'),
  });

  const createWorkflowMutation = useMutation({
    mutationFn: (w: ApprovalWorkflow) => wailsApp.CreateApprovalWorkflow(getToken() || '', w),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['approvalWorkflows'] }); notify('تم إنشاء سير الموافقة', 'success'); setShowWorkflowModal(false); },
    onError: () => notify('فشل في إنشاء سير الموافقة', 'error'),
  });

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setActiveSubTab('budgets')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'budgets' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>الميزانيات</button>
          <button onClick={() => setActiveSubTab('workflows')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'workflows' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>سير الموافقات</button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowWorkflowModal(true)} variant="secondary" className="flex items-center gap-2"><Plus size={16} /> سير موافقة</Button>
          <Button onClick={() => setShowBudgetModal(true)} className="flex items-center gap-2"><Plus size={16} /> ميزانية جديدة</Button>
        </div>
      </div>

      {activeSubTab === 'budgets' && (
        <div className="grid gap-3">
          {(budgets || []).map((b: Budget) => {
            const pct = b.amount > 0 ? (b.spentAmount / b.amount) * 100 : 0;
            const isOver = pct > 100;
            return (
              <div key={b.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 p-4">
                <div className="flex items-center justify-between mb-2"><p className="font-semibold text-sm">{b.name}</p><div className="flex items-center gap-2"><span className="text-xs text-brand-accent/40">{b.category} • {b.period}</span>{isOver && <AlertTriangle size={14} className="text-red-500" />}</div></div>
                <div className="flex items-center justify-between text-xs mb-1"><span className={isOver ? 'text-red-500 font-bold' : ''}>{b.spentAmount.toLocaleString()} / {b.amount.toLocaleString()}</span><span className="text-brand-accent/40">{pct.toFixed(0)}%</span></div>
                <div className="h-2 bg-brand-surface dark:bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === 'workflows' && (
        <div className="grid gap-3">
          {(workflows || []).map((w: ApprovalWorkflow) => (
            <div key={w.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 p-4 flex items-center justify-between">
              <div><p className="font-semibold text-sm">{w.name}</p><p className="text-xs text-brand-accent/40">{w.minAmount.toLocaleString()} - {w.maxAmount > 0 ? w.maxAmount.toLocaleString() : '∞'} • مستوى: {w.requiredLevel}</p></div>
              <CheckCircle size={16} className="text-emerald-500" />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="ميزانية جديدة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={budgetForm.name} onChange={e => setBudgetForm({ ...budgetForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الفئة</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={budgetForm.category} onChange={e => setBudgetForm({ ...budgetForm, category: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">المبلغ</label><input type="number" className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={budgetForm.amount} onChange={e => setBudgetForm({ ...budgetForm, amount: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الفترة</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={budgetForm.period} onChange={e => setBudgetForm({ ...budgetForm, period: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}><option value="monthly">شهري</option><option value="quarterly">ربع سنوي</option><option value="yearly">سنوي</option></select></div>
          <Button onClick={() => createBudgetMutation.mutate({ ...budgetForm, id: '', spentAmount: 0, isActive: true, createdAt: '', updatedAt: '' } as Budget)} className="w-full">إنشاء الميزانية</Button>
        </div>
      </Modal>

      <Modal isOpen={showWorkflowModal} onClose={() => setShowWorkflowModal(false)} title="سير موافقة جديد">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={workflowForm.name} onChange={e => setWorkflowForm({ ...workflowForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الحد الأدنى للمبلغ</label><input type="number" className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={workflowForm.minAmount} onChange={e => setWorkflowForm({ ...workflowForm, minAmount: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الحد الأقصى (0 = بلا حدود)</label><input type="number" className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={workflowForm.maxAmount} onChange={e => setWorkflowForm({ ...workflowForm, maxAmount: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">مستوى الموافقة</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={workflowForm.requiredLevel} onChange={e => setWorkflowForm({ ...workflowForm, requiredLevel: e.target.value as 'manager' | 'admin' })}><option value="manager">مدير</option><option value="admin">مدير النظام</option></select></div>
          <Button onClick={() => createWorkflowMutation.mutate({ ...workflowForm, id: '', isActive: true, createdAt: '', updatedAt: '' } as ApprovalWorkflow)} className="w-full">إنشاء سير الموافقة</Button>
        </div>
      </Modal>
    </div>
  );
};

const TaxesSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', rate: 0, type: 'sales', isDefault: false, isCompound: false });

  const { data: taxRates } = useQuery({ queryKey: ['taxRates'], queryFn: () => wailsApp.GetTaxRates() });

  const createMutation = useMutation({
    mutationFn: (r: TaxRate) => wailsApp.CreateTaxRate(getToken() || '', r),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['taxRates'] }); notify('تم إنشاء الضريبة', 'success'); setShowModal(false); },
    onError: () => notify('فشل في إنشاء الضريبة', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wailsApp.DeleteTaxRate(getToken() || '', id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['taxRates'] }); notify('تم حذف الضريبة', 'success'); },
    onError: () => notify('فشل في حذف الضريبة', 'error'),
  });

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Receipt size={20} className="text-red-500" /></div><div><h1 className="text-xl font-bold">إدارة الضرائب</h1><p className="text-xs text-brand-accent/40">إعداد معدلات الضرائب والتقارير الضريبية</p></div></div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2"><Plus size={16} /> ضريبة جديدة</Button>
      </div>

      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border/10"><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">الاسم</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">الرمز</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">المعدل</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">النوع</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">الافتراضية</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">إجراءات</th></tr></thead>
          <tbody>
            {(taxRates || []).map((r: TaxRate) => (
              <tr key={r.id} className="border-b border-brand-border/5 hover:bg-brand-surface/30">
                <td className="px-4 py-3 font-semibold">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                <td className="px-4 py-3"><span className="flex items-center gap-1"><Percent size={12} />{r.rate}</span></td>
                <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-500">{r.type}</span></td>
                <td className="px-4 py-3">{r.isDefault ? '✓' : ''}</td>
                <td className="px-4 py-3"><button onClick={() => deleteMutation.mutate(r.id)} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button></td>
              </tr>
            ))}
            {(!taxRates || taxRates.length === 0) && <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-accent/30">لا توجد ضرائب مسجلة</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="ضريبة جديدة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="ضريبة القيمة المضافة" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الرمز</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="VAT" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">المعدل %</label><input type="number" step="0.1" className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={form.rate} onChange={e => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">النوع</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="sales">مبيعات</option><option value="purchase">مشتريات</option><option value="withholding">خصم</option></select></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} /><label className="text-sm">الضريبة الافتراضية</label></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isCompound} onChange={e => setForm({ ...form, isCompound: e.target.checked })} /><label className="text-sm">ضريبة مركبة</label></div>
          <Button onClick={() => createMutation.mutate({ ...form, id: '', isActive: true, createdAt: '', updatedAt: '' } as TaxRate)} className="w-full">إنشاء الضريبة</Button>
        </div>
      </Modal>
    </div>
  );
};

const CurrenciesSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', symbol: '', exchangeRate: 1, isBase: false });
  const [convertForm, setConvertForm] = useState({ fromCode: '', toCode: '', amount: 0 });
  const [convertResult, setConvertResult] = useState<number | null>(null);

  const { data: currencies } = useQuery({ queryKey: ['currencies'], queryFn: () => wailsApp.GetCurrencies() });

  const createMutation = useMutation({
    mutationFn: (c: Currency) => wailsApp.CreateCurrency(getToken() || '', c),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['currencies'] }); notify('تم إنشاء العملة بنجاح', 'success'); setShowModal(false); },
    onError: () => notify('فشل في إنشاء العملة', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wailsApp.DeleteCurrency(getToken() || '', id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['currencies'] }); notify('تم حذف العملة', 'success'); },
    onError: () => notify('فشل في حذف العملة', 'error'),
  });

  const convertMutation = useMutation({
    mutationFn: () => wailsApp.ConvertCurrency(convertForm.amount, convertForm.fromCode, convertForm.toCode),
    onSuccess: (result: number) => { setConvertResult(result); notify('تم التحويل بنجاح', 'success'); },
    onError: () => notify('فشل في التحويل', 'error'),
  });

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Coins size={20} className="text-amber-500" /></div><div><h1 className="text-xl font-bold">العملات والصرف</h1><p className="text-xs text-brand-accent/40">إدارة العملات وأسعار الصرف</p></div></div>
        <div className="flex gap-2">
          <Button onClick={() => setShowConvertModal(true)} variant="secondary" className="flex items-center gap-2"><ArrowRightLeft size={16} /> تحويل عملة</Button>
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2"><Plus size={16} /> عملة جديدة</Button>
        </div>
      </div>

      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border/10"><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">الرمز</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">الاسم</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">الرمز</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">سعر الصرف</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">الأساسية</th><th className="text-right px-4 py-3 font-semibold text-brand-accent/50">إجراءات</th></tr></thead>
          <tbody>
            {(currencies || []).map((c: Currency) => (
              <tr key={c.id} className="border-b border-brand-border/5 hover:bg-brand-surface/30">
                <td className="px-4 py-3 font-mono font-bold text-amber-500">{c.code}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.symbol}</td>
                <td className="px-4 py-3 font-mono">{c.exchangeRate}</td>
                <td className="px-4 py-3">{c.isBase ? '✓' : ''}</td>
                <td className="px-4 py-3">{!c.isBase && (<button onClick={() => deleteMutation.mutate(c.id)} className="text-red-500/50 hover:text-red-500"><Trash2 size={14} /></button>)}</td>
              </tr>
            ))}
            {(!currencies || currencies.length === 0) && <tr><td colSpan={6} className="px-4 py-8 text-center text-brand-accent/30">لا توجد عملات مسجلة</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="عملة جديدة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الرمز</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="USD" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="دولار أمريكي" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الرمز</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="$" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">سعر الصرف</label><input type="number" step="0.01" className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={form.exchangeRate} onChange={e => setForm({ ...form, exchangeRate: parseFloat(e.target.value) || 0 })} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isBase} onChange={e => setForm({ ...form, isBase: e.target.checked })} /><label className="text-sm">العملة الأساسية</label></div>
          <Button onClick={() => createMutation.mutate({ ...form, id: '', isActive: true, createdAt: '', updatedAt: '' } as Currency)} className="w-full">إنشاء العملة</Button>
        </div>
      </Modal>

      <Modal isOpen={showConvertModal} onClose={() => { setShowConvertModal(false); setConvertResult(null); }} title="تحويل عملة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">من عملة</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="USD" value={convertForm.fromCode} onChange={e => setConvertForm({ ...convertForm, fromCode: e.target.value.toUpperCase() })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">إلى عملة</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" placeholder="IQD" value={convertForm.toCode} onChange={e => setConvertForm({ ...convertForm, toCode: e.target.value.toUpperCase() })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">المبلغ</label><input type="number" className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={convertForm.amount} onChange={e => setConvertForm({ ...convertForm, amount: parseFloat(e.target.value) || 0 })} /></div>
          {convertResult !== null && (<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center"><span className="text-lg font-bold text-emerald-500">{convertResult.toFixed(2)}</span></div>)}
          <Button onClick={() => convertMutation.mutate()} className="w-full flex items-center justify-center gap-2"><RefreshCw size={16} /> تحويل</Button>
        </div>
      </Modal>
    </div>
  );
};

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('expenses');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 p-2 px-6 bg-brand-surface/30 border-b border-brand-border/15">
        {TAB_ITEMS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50 hover:text-brand-accent/70'}`}>{tab.icon}{tab.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'expenses' && <ExpensesSubTab />}
        {activeTab === 'budgets' && <BudgetsSubTab />}
        {activeTab === 'taxes' && <TaxesSubTab />}
        {activeTab === 'currencies' && <CurrenciesSubTab />}
      </div>
    </div>
  );
};

export default Finance;
