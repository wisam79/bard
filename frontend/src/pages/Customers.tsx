import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Customer, LoyaltyTier, LoyaltyRule, LoyaltyTransaction, GiftCard, Voucher, CustomerSegment, Campaign } from '@/types';
import { Search, Plus, Pencil, Trash2, Users, Wallet, Eye, UserPlus, Star, Clock, Crown, Gift, CreditCard, Tag, DollarSign, Megaphone, Zap, Trash2 as Trash2Icon, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

type CustomersTab = 'customers' | 'loyalty' | 'giftcards' | 'segments';

const TAB_ITEMS: { id: CustomersTab; label: string; icon: React.ReactNode }[] = [
  { id: 'customers', label: 'العملاء', icon: <Users size={16} /> },
  { id: 'loyalty', label: 'الولاء', icon: <Crown size={16} /> },
  { id: 'giftcards', label: 'بطاقات الهدايا', icon: <Gift size={16} /> },
  { id: 'segments', label: 'الشرائح', icon: <Megaphone size={16} /> },
];

const CustomersSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' });

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); notify('تم إضافة العميل بنجاح', 'success'); handleCloseModal(); },
    onError: () => notify('فشل في إضافة العميل', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (customer: Partial<Customer>) => wailsApp.UpdateCustomer(customer as Customer),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); notify('تم تحديث العميل بنجاح', 'success'); handleCloseModal(); },
    onError: () => notify('فشل في تحديث العميل', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => wailsApp.DeleteCustomer(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); notify('تم حذف العميل', 'success'); },
    onError: () => notify('فشل في حذف العميل', 'error'),
  });

  const handleCloseModal = () => { setShowModal(false); setEditingCustomer(null); setViewingCustomer(null); setFormData({ name: '', phone: '', notes: '' }); };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) { setEditingCustomer(customer); setFormData({ name: customer.name, phone: customer.phone, notes: customer.notes || '' }); }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) { notify('يرجى ملء الحقول المطلوبة', 'error'); return; }
    if (editingCustomer) { updateMutation.mutate({ ...editingCustomer, ...formData }); } else { createMutation.mutate(formData); }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3"><Users className="text-primary-400" /> قاعدة بيانات العملاء</h1>
          <p className="text-brand-accent/50 font-medium mt-1">إدارة بيانات العملاء، الديون ونقاط الولاء</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 px-6 shadow-xl shadow-primary-500/20"><UserPlus size={20} /><span className="font-bold">إضافة عميل جديد</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'إجمالي العملاء', value: totalCustomers, icon: <Users size={20} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'إجمالي الديون', value: totalDebt.toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <Wallet size={20} />, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'العملاء المميزون', value: customers.filter((c: Customer) => c.points > 100).length, icon: <Star size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border/30 rounded-3xl p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} border border-white/5`}>{stat.icon}</div>
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
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="input pr-12 py-3 bg-brand-dark/20 border-brand-border/20 focus:bg-brand-dark/40" placeholder="بحث باسم العميل، رقم الهاتف..." />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-brand-accent/30 space-y-4"><Users className="w-10 h-10 opacity-50" /><p className="font-bold">لم يتم العثور على عملاء</p></div>
          ) : (
            <table className="w-full text-right">
              <thead><tr className="bg-brand-dark/30 border-b border-brand-border/30">
                <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">معلومات العميل</th>
                <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">رقم الهاتف</th>
                <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">الدين المستحق</th>
                <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">النقاط</th>
                <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-brand-border/10">
                {customers.map((customer: Customer) => (
                  <tr key={customer.id} className="hover:bg-brand-dark/20 transition-colors group">
                    <td className="py-4 px-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-black text-xs">{customer.name.charAt(0)}</div><div><p className="text-sm font-bold dark:text-white text-gray-900 leading-none mb-1 group-hover:text-primary-400 transition-colors">{customer.name}</p><p className="text-[10px] text-brand-accent/40 font-medium truncate max-w-[150px]">{customer.notes || 'لا توجد ملاحظات'}</p></div></div></td>
                    <td className="py-4 px-6"><span className="text-xs font-mono font-bold text-brand-accent/70 bg-brand-dark/40 px-3 py-1 rounded-lg border border-brand-border/20">{customer.phone}</span></td>
                    <td className="py-4 px-6"><div className="flex flex-col"><span className={`text-sm font-black ${(customer.debt + customer.installmentDebt) > 0 ? 'text-red-400' : 'text-green-500'}`}>{(customer.debt + customer.installmentDebt).toLocaleString('ar-IQ')} <span className="text-[10px]">د.ع</span></span>{customer.installmentDebt > 0 && <span className="text-[9px] font-bold text-yellow-500/70">منها أقساط: {customer.installmentDebt.toLocaleString('ar-IQ')}</span>}</div></td>
                    <td className="py-4 px-6 text-center"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-[10px] font-black border border-primary-500/20"><Star size={10} fill="currentColor" />{customer.points}</span></td>
                    <td className="py-4 px-6"><div className="flex items-center justify-center gap-2">
                      <button onClick={() => setViewingCustomer(customer)} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all"><Eye size={16} /></button>
                      <button onClick={() => handleOpenModal(customer)} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all"><Pencil size={16} /></button>
                      <button onClick={() => { if ((customer.debt + customer.installmentDebt) > 0) { notify('لا يمكن حذف عميل عليه ديون', 'error'); return; } if (confirm('هل أنت متأكد من حذف هذا العميل؟')) deleteMutation.mutate(customer.id); }} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 transition-all"><Trash2 size={16} /></button>
                    </div></td>
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
                  <div className="w-20 h-20 rounded-3xl bg-primary-500/10 flex items-center justify-center text-primary-400 font-black text-3xl mb-4 border border-primary-500/20">{viewingCustomer.name.charAt(0)}</div>
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
                    <div className="bg-brand-dark/30 rounded-2xl p-4 border border-brand-border/30"><p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">المشتريات</p><p className="text-base font-black dark:text-white text-gray-900 truncate">{viewingCustomer.totalPurchases.toLocaleString('ar-IQ')}</p></div>
                    <div className="bg-brand-dark/30 rounded-2xl p-4 border border-brand-border/30 text-center"><p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">نقاط الولاء</p><p className="text-base font-black text-primary-400">{viewingCustomer.points}</p></div>
                  </div>
                  {viewingCustomer.lastVisit && <div className="flex items-center gap-2 text-[10px] font-bold text-brand-accent/40 justify-center"><Clock size={12} />آخر زيارة: {viewingCustomer.lastVisit}</div>}
                </div>
                <button onClick={handleCloseModal} className="btn-secondary w-full mt-8 py-3 font-bold">إغلاق النافذة</button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black dark:text-white text-gray-900 flex items-center gap-3"><div className="p-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">{editingCustomer ? <Pencil size={20} /> : <UserPlus size={20} />}</div>{editingCustomer ? 'تعديل العميل' : 'إضافة عميل'}</h2>
                  <button onClick={handleCloseModal} className="text-brand-accent/30 hover:dark:text-white text-gray-900 transition-colors"><Plus className="rotate-45" size={32} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2"><label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">اسم العميل بالكامل *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input py-3" placeholder="أدخل اسم العميل..." required /></div>
                  <div className="space-y-2"><label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">رقم الهاتف *</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input py-3 font-mono" placeholder="07XXXXXXXX..." required /></div>
                  <div className="space-y-2"><label className="text-xs font-black text-brand-accent/50 uppercase tracking-widest mr-1">ملاحظات العميل</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input resize-none py-3 h-24" placeholder="عنوان، تفاصيل إضافية..." /></div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="btn-primary flex-1 py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-primary-500/20" disabled={createMutation.isPending || updateMutation.isPending}>{editingCustomer ? 'حفظ التعديلات' : 'إضافة للقاعدة'}</button>
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

const LoyaltySubTab: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'tiers' | 'rules' | 'history'>('tiers');
  const [showTierModal, setShowTierModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);
  const [editingRule, setEditingRule] = useState<LoyaltyRule | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [tierForm, setTierForm] = useState({ name: '', minPoints: 0, pointsRate: 1, discountPct: 0, color: '#6366f1' });
  const [ruleForm, setRuleForm] = useState({ name: '', pointsPerAmount: 1, minPurchase: 0, isActive: true });

  const { data: tiers } = useQuery<LoyaltyTier[]>({ queryKey: ['loyaltyTiers'], queryFn: () => wailsApp.GetLoyaltyTiers() });
  const { data: rules } = useQuery<LoyaltyRule[]>({ queryKey: ['loyaltyRules'], queryFn: () => wailsApp.GetLoyaltyRules() });
  const { data: transactions } = useQuery<LoyaltyTransaction[]>({ queryKey: ['loyaltyTransactions', selectedCustomer], queryFn: () => selectedCustomer ? wailsApp.GetLoyaltyTransactions(selectedCustomer) : Promise.resolve([]), enabled: !!selectedCustomer });

  const createTierMutation = useMutation({
    mutationFn: (tier: LoyaltyTier) => wailsApp.CreateLoyaltyTier(tier),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loyaltyTiers'] }); notify('تم إضافة المستوى بنجاح', 'success'); setShowTierModal(false); },
    onError: () => notify('فشل في إضافة المستوى', 'error'),
  });

  const createRuleMutation = useMutation({
    mutationFn: (rule: LoyaltyRule) => wailsApp.CreateLoyaltyRule(rule),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loyaltyRules'] }); notify('تم إضافة القاعدة بنجاح', 'success'); setShowRuleModal(false); },
    onError: () => notify('فشل في إضافة القاعدة', 'error'),
  });

  const subTabs = [{ id: 'tiers' as const, label: 'المستويات', icon: Crown }, { id: 'rules' as const, label: 'القواعد', icon: Star }, { id: 'history' as const, label: 'السجل', icon: Clock }];

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center gap-2">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
        ))}
      </div>

      {activeSubTab === 'tiers' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => { setEditingTier(null); setTierForm({ name: '', minPoints: 0, pointsRate: 1, discountPct: 0, color: '#6366f1' }); setShowTierModal(true); }}><Plus className="w-4 h-4 ml-1" /> مستوى جديد</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers?.map((tier) => (
              <div key={tier.id} className="bg-brand-surface rounded-xl p-4 border border-brand-border/20">
                <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tier.color }}><Crown className="w-4 h-4 text-white" /></div><div><h3 className="font-bold">{tier.name}</h3><p className="text-xs text-brand-accent/50">{tier.minPoints} نقطة كحد أدنى</p></div></div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-brand-bg/50 rounded-lg p-2 text-center"><p className="text-brand-accent/40 text-[10px]">معدل النقاط</p><p className="font-bold text-primary-500">{tier.pointsRate}x</p></div>
                  <div className="bg-brand-bg/50 rounded-lg p-2 text-center"><p className="text-brand-accent/40 text-[10px]">خصم</p><p className="font-bold text-primary-500">{tier.discountPct}%</p></div>
                </div>
              </div>
            ))}
            {(!tiers || tiers.length === 0) && <div className="col-span-full text-center py-12 text-brand-accent/40"><Crown className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد مستويات ولاء بعد</p></div>}
          </div>
        </div>
      )}

      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => { setEditingRule(null); setRuleForm({ name: '', pointsPerAmount: 1, minPurchase: 0, isActive: true }); setShowRuleModal(true); }}><Plus className="w-4 h-4 ml-1" /> قاعدة جديدة</Button></div>
          <div className="space-y-3">
            {rules?.map((rule) => (
              <div key={rule.id} className="bg-brand-surface rounded-xl p-4 border border-brand-border/20 flex items-center justify-between">
                <div><h3 className="font-bold">{rule.name}</h3><p className="text-sm text-brand-accent/50">نقطة واحدة لكل {rule.pointsPerAmount} من المبلغ | الحد الأدنى: {rule.minPurchase}</p></div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${rule.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{rule.isActive ? 'مفعلة' : 'معطلة'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <input type="text" placeholder="أدخل معرف العميل لعرض السجل..." value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full bg-brand-surface border border-brand-border/20 rounded-xl px-4 py-3 text-sm" />
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">{transactions.map((tx) => (
              <div key={tx.id} className="bg-brand-surface rounded-xl p-3 border border-brand-border/20 flex items-center justify-between">
                <div><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'earn' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{tx.type === 'earn' ? <Star className="w-3 h-3" /> : <Gift className="w-3 h-3" />}{tx.type === 'earn' ? 'كسب' : 'استبدال'}</span><p className="text-sm mt-1">{tx.description}</p></div>
                <span className={`font-bold ${tx.points > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{tx.points > 0 ? '+' : ''}{tx.points}</span>
              </div>
            ))}</div>
          ) : selectedCustomer ? <p className="text-center text-brand-accent/40 py-8">لا توجد معاملات</p> : <p className="text-center text-brand-accent/40 py-8">أدخل معرف العميل لعرض السجل</p>}
        </div>
      )}

      {showTierModal && (
        <Modal isOpen={showTierModal} onClose={() => setShowTierModal(false)} title={editingTier ? 'تعديل المستوى' : 'مستوى جديد'}>
          <div className="space-y-4 p-4">
            <div><label className="text-sm text-brand-accent/60 mb-1 block">اسم المستوى</label><input className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={tierForm.name} onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الحد الأدنى من النقاط</label><input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={tierForm.minPoints} onChange={(e) => setTierForm({ ...tierForm, minPoints: Number(e.target.value) })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">معدل النقاط</label><input type="number" step="0.1" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={tierForm.pointsRate} onChange={(e) => setTierForm({ ...tierForm, pointsRate: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">نسبة الخصم %</label><input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={tierForm.discountPct} onChange={(e) => setTierForm({ ...tierForm, discountPct: Number(e.target.value) })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">اللون</label><input type="color" className="w-full h-10 bg-brand-bg border border-brand-border/20 rounded-lg" value={tierForm.color} onChange={(e) => setTierForm({ ...tierForm, color: e.target.value })} /></div>
            </div>
            <Button className="w-full" onClick={() => createTierMutation.mutate(tierForm as LoyaltyTier)}>{editingTier ? 'تحديث' : 'إضافة'}</Button>
          </div>
        </Modal>
      )}

      {showRuleModal && (
        <Modal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} title={editingRule ? 'تعديل القاعدة' : 'قاعدة جديدة'}>
          <div className="space-y-4 p-4">
            <div><label className="text-sm text-brand-accent/60 mb-1 block">اسم القاعدة</label><input className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">النقاط لكل وحدة مالية</label><input type="number" step="0.01" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={ruleForm.pointsPerAmount} onChange={(e) => setRuleForm({ ...ruleForm, pointsPerAmount: Number(e.target.value) })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الحد الأدنى للشراء</label><input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={ruleForm.minPurchase} onChange={(e) => setRuleForm({ ...ruleForm, minPurchase: Number(e.target.value) })} /></div>
            </div>
            <Button className="w-full" onClick={() => createRuleMutation.mutate(ruleForm as LoyaltyRule)}>{editingRule ? 'تحديث' : 'إضافة'}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const GiftCardsSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'vouchers'>('cards');
  const [showCardModal, setShowCardModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [cardForm, setCardForm] = useState({ initialBalance: 0, purchasedBy: '', code: '' });
  const [voucherForm, setVoucherForm] = useState({ code: '', name: '', type: 'percentage' as 'percentage' | 'fixed', value: 0, minPurchase: 0, maxUses: 0 });

  const { data: cardsData } = useQuery({ queryKey: ['giftCards', 1, 50], queryFn: () => wailsApp.GetGiftCards(1, 50) });
  const { data: vouchers } = useQuery<Voucher[]>({ queryKey: ['vouchers'], queryFn: () => wailsApp.GetVouchers() });
  const cards = cardsData?.data || cardsData?.[0] || [];

  const createCardMutation = useMutation({
    mutationFn: (card: GiftCard) => wailsApp.CreateGiftCard(card),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['giftCards'] }); notify('تم إنشاء البطاقة بنجاح', 'success'); setShowCardModal(false); },
    onError: () => notify('فشل في إنشاء البطاقة', 'error'),
  });

  const createVoucherMutation = useMutation({
    mutationFn: (v: Voucher) => wailsApp.CreateVoucher(v),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vouchers'] }); notify('تم إنشاء الكوبون بنجاح', 'success'); setShowVoucherModal(false); },
    onError: () => notify('فشل في إنشاء الكوبون', 'error'),
  });

  const subTabs = [{ id: 'cards' as const, label: 'بطاقات الهدايا', icon: CreditCard }, { id: 'vouchers' as const, label: 'كوبونات الخصم', icon: Tag }];

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center gap-2">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
        ))}
      </div>

      {activeSubTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input placeholder="كود البطاقة..." value={redeemCode} onChange={(e) => setRedeemCode(e.target.value)} className="bg-brand-surface border border-brand-border/20 rounded-lg px-3 py-2 text-sm w-48" />
              <input type="number" placeholder="المبلغ" value={redeemAmount || ''} onChange={(e) => setRedeemAmount(Number(e.target.value))} className="bg-brand-surface border border-brand-border/20 rounded-lg px-3 py-2 text-sm w-32" />
              <Button size="sm"><DollarSign className="w-3 h-3 ml-1" /> استبدال</Button>
            </div>
            <Button onClick={() => { setCardForm({ initialBalance: 0, purchasedBy: '', code: '' }); setShowCardModal(true); }}><Plus className="w-4 h-4 ml-1" /> بطاقة جديدة</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(cards) ? cards : []).map((card: GiftCard) => (
              <div key={card.id} className={`bg-brand-surface rounded-xl p-4 border ${card.isActive ? 'border-brand-border/20' : 'border-red-500/30 opacity-60'}`}>
                <div className="flex items-center justify-between mb-3"><div className="bg-gradient-to-br from-primary-600 to-violet-600 text-white px-3 py-1.5 rounded-lg font-mono text-sm font-bold tracking-wider">{card.code}</div><span className={`px-2 py-0.5 rounded text-xs ${card.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{card.isActive ? 'مفعلة' : 'معطلة'}</span></div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-brand-bg/50 rounded-lg p-2 text-center"><p className="text-[10px] text-brand-accent/40">الرصيد</p><p className="font-bold text-primary-500">{card.balance.toLocaleString()}</p></div>
                  <div className="bg-brand-bg/50 rounded-lg p-2 text-center"><p className="text-[10px] text-brand-accent/40">المبلغ الأولي</p><p className="font-bold">{card.initialBalance.toLocaleString()}</p></div>
                </div>
                {card.expiresAt && <p className="text-xs text-brand-accent/40 mt-2">تنتهي: {new Date(card.expiresAt).toLocaleDateString('ar-IQ')}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => { setVoucherForm({ code: '', name: '', type: 'percentage', value: 0, minPurchase: 0, maxUses: 0 }); setShowVoucherModal(true); }}><Plus className="w-4 h-4 ml-1" /> كوبون جديد</Button></div>
          <div className="space-y-3">
            {vouchers?.map((v) => (
              <div key={v.id} className="bg-brand-surface rounded-xl p-4 border border-brand-border/20 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center"><Tag className="w-5 h-5 text-primary-400" /></div><div><h3 className="font-bold">{v.name}</h3><p className="text-sm text-brand-accent/50">{v.code} | {v.type === 'percentage' ? `${v.value}% خصم` : `${v.value} خصم ثابت`}{v.minPurchase > 0 && ` | الحد الأدنى: ${v.minPurchase}`}</p></div></div>
                <div className="flex items-center gap-3"><span className="text-sm text-brand-accent/50">{v.usedCount}/{v.maxUses || '∞'}</span><span className={`px-2 py-0.5 rounded text-xs ${v.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{v.isActive ? 'مفعّل' : 'معطّل'}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCardModal && (
        <Modal isOpen={showCardModal} onClose={() => setShowCardModal(false)} title="بطاقة هدايا جديدة">
          <div className="space-y-4 p-4">
            <div><label className="text-sm text-brand-accent/60 mb-1 block">المبلغ الأولي</label><input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={cardForm.initialBalance || ''} onChange={(e) => setCardForm({ ...cardForm, initialBalance: Number(e.target.value) })} /></div>
            <div><label className="text-sm text-brand-accent/60 mb-1 block">كود البطاقة (اختياري)</label><input className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={cardForm.code} onChange={(e) => setCardForm({ ...cardForm, code: e.target.value })} placeholder="سيتم توليده تلقائياً" /></div>
            <div><label className="text-sm text-brand-accent/60 mb-1 block">اسم المشتري</label><input className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={cardForm.purchasedBy} onChange={(e) => setCardForm({ ...cardForm, purchasedBy: e.target.value })} /></div>
            <Button className="w-full" onClick={() => createCardMutation.mutate(cardForm as GiftCard)}>إنشاء البطاقة</Button>
          </div>
        </Modal>
      )}

      {showVoucherModal && (
        <Modal isOpen={showVoucherModal} onClose={() => setShowVoucherModal(false)} title="كوبون خصم جديد">
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">اسم الكوبون</label><input className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={voucherForm.name} onChange={(e) => setVoucherForm({ ...voucherForm, name: e.target.value })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الكود</label><input className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={voucherForm.code} onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">النوع</label><select className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={voucherForm.type} onChange={(e) => setVoucherForm({ ...voucherForm, type: e.target.value as 'percentage' | 'fixed' })}><option value="percentage">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">القيمة</label><input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={voucherForm.value || ''} onChange={(e) => setVoucherForm({ ...voucherForm, value: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الحد الأدنى للشراء</label><input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={voucherForm.minPurchase || ''} onChange={(e) => setVoucherForm({ ...voucherForm, minPurchase: Number(e.target.value) })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الحد الأقصى للاستخدام</label><input type="number" className="w-full bg-brand-bg border border-brand-border/20 rounded-lg px-3 py-2" value={voucherForm.maxUses || ''} onChange={(e) => setVoucherForm({ ...voucherForm, maxUses: Number(e.target.value) })} /></div>
            </div>
            <Button className="w-full" onClick={() => createVoucherMutation.mutate(voucherForm as Voucher)}>إنشاء الكوبون</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const SegmentsSubTab: React.FC = () => {
  const { notify } = useAppStore();
  const { getToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'segments' | 'campaigns'>('segments');
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [segmentForm, setSegmentForm] = useState({ name: '', description: '', rules: '', color: '#6366f1' });
  const [campaignForm, setCampaignForm] = useState({ name: '', description: '', type: 'sms' as 'sms' | 'whatsapp' | 'voucher', segmentId: '' });

  const { data: segments } = useQuery({ queryKey: ['customerSegments'], queryFn: () => wailsApp.GetCustomerSegments() });
  const { data: campaigns } = useQuery({ queryKey: ['campaigns'], queryFn: () => wailsApp.GetCampaigns() });

  const createSegmentMutation = useMutation({
    mutationFn: (s: CustomerSegment) => wailsApp.CreateCustomerSegment(getToken() || '', s),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customerSegments'] }); notify('تم إنشاء الشريحة', 'success'); setShowSegmentModal(false); },
    onError: () => notify('فشل في إنشاء الشريحة', 'error'),
  });

  const autoSegmentMutation = useMutation({
    mutationFn: () => wailsApp.AutoSegmentCustomers(getToken() || ''),
    onSuccess: (count: number) => { queryClient.invalidateQueries({ queryKey: ['customerSegments'] }); notify(`تم تصنيف ${count} عميل`, 'success'); },
    onError: () => notify('فشل في التصنيف التلقائي', 'error'),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (c: Campaign) => wailsApp.CreateCampaign(getToken() || '', c),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); notify('تم إنشاء الحملة', 'success'); setShowCampaignModal(false); },
    onError: () => notify('فشل في إنشاء الحملة', 'error'),
  });

  const startCampaignMutation = useMutation({
    mutationFn: (id: string) => wailsApp.StartCampaign(getToken() || '', id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); notify('تم بدء الحملة', 'success'); },
    onError: () => notify('فشل في بدء الحملة', 'error'),
  });

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setActiveSubTab('segments')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'segments' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>الشرائح</button>
          <button onClick={() => setActiveSubTab('campaigns')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'campaigns' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30'}`}>الحملات</button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => autoSegmentMutation.mutate()} variant="secondary" className="flex items-center gap-2"><Zap size={16} /> تصنيف تلقائي</Button>
          <Button onClick={() => setShowSegmentModal(true)} className="flex items-center gap-2"><Plus size={16} /> شريحة جديدة</Button>
        </div>
      </div>

      {activeSubTab === 'segments' && (
        <div className="grid gap-3">
          {(segments || []).map((s: CustomerSegment) => (
            <div key={s.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} /><div><p className="font-semibold text-sm">{s.name}</p><p className="text-xs text-brand-accent/40">{s.description || s.rules}</p></div></div>
              <div className="flex items-center gap-2"><span className="text-xs text-brand-accent/40 flex items-center gap-1"><Users size={12} /> {s.customerCount}</span><button className="text-red-500/50 hover:text-red-500"><Trash2Icon size={14} /></button></div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'campaigns' && (
        <div className="grid gap-3">
          <Button onClick={() => setShowCampaignModal(true)} variant="secondary" className="flex items-center gap-2 self-start"><Plus size={16} /> حملة جديدة</Button>
          {(campaigns || []).map((c: Campaign) => (
            <div key={c.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/15 p-4 flex items-center justify-between">
              <div><p className="font-semibold text-sm">{c.name}</p><p className="text-xs text-brand-accent/40">{c.type} • {c.targetCount} مستهدف • {c.sentCount} مرسل</p></div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : c.status === 'draft' ? 'bg-amber-500/10 text-amber-500' : 'bg-gray-500/10 text-gray-500'}`}>{c.status}</span>
                {c.status === 'draft' && <Button onClick={() => startCampaignMutation.mutate(c.id)} size="sm" className="flex items-center gap-1"><Play size={12} /> بدء</Button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showSegmentModal} onClose={() => setShowSegmentModal(false)} title="شريحة عملاء جديدة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={segmentForm.name} onChange={e => setSegmentForm({ ...segmentForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الوصف</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={segmentForm.description} onChange={e => setSegmentForm({ ...segmentForm, description: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">القاعدة</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={segmentForm.rules} onChange={e => setSegmentForm({ ...segmentForm, rules: e.target.value })}><option value="high_value">عملاء ذوو قيمة عالية</option><option value="in_debt">عملاء مدينون</option><option value="new_customer">عملاء جدد</option></select></div>
          <Button onClick={() => createSegmentMutation.mutate({ ...segmentForm, id: '', customerCount: 0, isActive: true, createdAt: '', updatedAt: '' } as CustomerSegment)} className="w-full">إنشاء الشريحة</Button>
        </div>
      </Modal>

      <Modal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} title="حملة جديدة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={campaignForm.name} onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">النوع</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={campaignForm.type} onChange={e => setCampaignForm({ ...campaignForm, type: e.target.value as 'sms' | 'whatsapp' | 'voucher' })}><option value="sms">رسائل</option><option value="whatsapp">واتساب</option><option value="voucher">كوبون</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">الشريحة</label><select className="w-full bg-brand-surface/50 border border-brand-border/20 rounded-lg px-3 py-2 text-sm" value={campaignForm.segmentId} onChange={e => setCampaignForm({ ...campaignForm, segmentId: e.target.value })}><option value="">اختر الشريحة</option>{(segments || []).map((s: CustomerSegment) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <Button onClick={() => createCampaignMutation.mutate({ ...campaignForm, id: '', description: '', discountId: '', status: 'draft', targetCount: 0, sentCount: 0, responseCount: 0, createdAt: '', updatedAt: '' } as Campaign)} className="w-full">إنشاء الحملة</Button>
        </div>
      </Modal>
    </div>
  );
};

const Customers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CustomersTab>('customers');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 p-2 px-6 bg-brand-surface/30 border-b border-brand-border/15">
        {TAB_ITEMS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-accent/40 dark:text-white/30 hover:bg-brand-surface/50 hover:text-brand-accent/70'}`}>{tab.icon}{tab.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'customers' && <CustomersSubTab />}
        {activeTab === 'loyalty' && <LoyaltySubTab />}
        {activeTab === 'giftcards' && <GiftCardsSubTab />}
        {activeTab === 'segments' && <SegmentsSubTab />}
      </div>
    </div>
  );
};

export default Customers;
