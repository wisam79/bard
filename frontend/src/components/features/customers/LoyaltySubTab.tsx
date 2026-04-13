import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Customer, LoyaltyTier, LoyaltyRule, LoyaltyTransaction, GiftCard, Voucher, CustomerSegment, Campaign } from '@/types';
import { Search, Plus, Pencil, Trash2, Users, Wallet, Eye, UserPlus, Star, Clock, Crown, Gift, CreditCard, Tag, DollarSign, Megaphone, Zap, Trash2 as Trash2Icon, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

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
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/35">
      <div className="flex items-center gap-2">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-muted/60 dark:text-white/30 hover:bg-brand-surface/50'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
        ))}
      </div>

      {activeSubTab === 'tiers' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => { setEditingTier(null); setTierForm({ name: '', minPoints: 0, pointsRate: 1, discountPct: 0, color: '#6366f1' }); setShowTierModal(true); }}><Plus className="w-4 h-4 ml-1" /> مستوى جديد</Button></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers?.map((tier) => (
              <div key={tier.id} className="bg-brand-surface rounded-xl p-4 border border-brand-border/35">
                <div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tier.color }}><Crown className="w-4 h-4 text-white" /></div><div><h3 className="font-bold">{tier.name}</h3><p className="text-xs text-brand-accent/50">{tier.minPoints} نقطة كحد أدنى</p></div></div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-brand-bg/50 rounded-lg p-2 text-center"><p className="text-brand-muted/60 text-[10px]">معدل النقاط</p><p className="font-bold text-primary-500">{tier.pointsRate}x</p></div>
                  <div className="bg-brand-bg/50 rounded-lg p-2 text-center"><p className="text-brand-muted/60 text-[10px]">خصم</p><p className="font-bold text-primary-500">{tier.discountPct}%</p></div>
                </div>
              </div>
            ))}
            {(!tiers || tiers.length === 0) && <div className="col-span-full text-center py-12 text-brand-muted/60"><Crown className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>لا توجد مستويات ولاء بعد</p></div>}
          </div>
        </div>
      )}

      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-end"><Button onClick={() => { setEditingRule(null); setRuleForm({ name: '', pointsPerAmount: 1, minPurchase: 0, isActive: true }); setShowRuleModal(true); }}><Plus className="w-4 h-4 ml-1" /> قاعدة جديدة</Button></div>
          <div className="space-y-3">
            {rules?.map((rule) => (
              <div key={rule.id} className="bg-brand-surface rounded-xl p-4 border border-brand-border/35 flex items-center justify-between">
                <div><h3 className="font-bold">{rule.name}</h3><p className="text-sm text-brand-accent/50">نقطة واحدة لكل {rule.pointsPerAmount} من المبلغ | الحد الأدنى: {rule.minPurchase}</p></div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${rule.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{rule.isActive ? 'مفعلة' : 'معطلة'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="space-y-4">
          <input type="text" placeholder="أدخل معرف العميل لعرض السجل..." value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full bg-brand-surface border border-brand-border/35 rounded-xl px-4 py-3 text-sm" />
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">{transactions.map((tx) => (
              <div key={tx.id} className="bg-brand-surface rounded-xl p-3 border border-brand-border/35 flex items-center justify-between">
                <div><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'earn' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{tx.type === 'earn' ? <Star className="w-3 h-3" /> : <Gift className="w-3 h-3" />}{tx.type === 'earn' ? 'كسب' : 'استبدال'}</span><p className="text-sm mt-1">{tx.description}</p></div>
                <span className={`font-bold ${tx.points > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{tx.points > 0 ? '+' : ''}{tx.points}</span>
              </div>
            ))}</div>
          ) : selectedCustomer ? <p className="text-center text-brand-muted/60 py-8">لا توجد معاملات</p> : <p className="text-center text-brand-muted/60 py-8">أدخل معرف العميل لعرض السجل</p>}
        </div>
      )}

      {showTierModal && (
        <Modal isOpen={showTierModal} onClose={() => setShowTierModal(false)} title={editingTier ? 'تعديل المستوى' : 'مستوى جديد'}>
          <div className="space-y-4 p-4">
            <div><label className="text-sm text-brand-accent/60 mb-1 block">اسم المستوى</label><input className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={tierForm.name} onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الحد الأدنى من النقاط</label><input type="number" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={tierForm.minPoints} onChange={(e) => setTierForm({ ...tierForm, minPoints: Number(e.target.value) })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">معدل النقاط</label><input type="number" step="0.1" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={tierForm.pointsRate} onChange={(e) => setTierForm({ ...tierForm, pointsRate: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">نسبة الخصم %</label><input type="number" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={tierForm.discountPct} onChange={(e) => setTierForm({ ...tierForm, discountPct: Number(e.target.value) })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">اللون</label><input type="color" className="w-full h-10 bg-brand-bg border border-brand-border/35 rounded-lg" value={tierForm.color} onChange={(e) => setTierForm({ ...tierForm, color: e.target.value })} /></div>
            </div>
            <Button className="w-full" onClick={() => createTierMutation.mutate(tierForm as LoyaltyTier)}>{editingTier ? 'تحديث' : 'إضافة'}</Button>
          </div>
        </Modal>
      )}

      {showRuleModal && (
        <Modal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} title={editingRule ? 'تعديل القاعدة' : 'قاعدة جديدة'}>
          <div className="space-y-4 p-4">
            <div><label className="text-sm text-brand-accent/60 mb-1 block">اسم القاعدة</label><input className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">النقاط لكل وحدة مالية</label><input type="number" step="0.01" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={ruleForm.pointsPerAmount} onChange={(e) => setRuleForm({ ...ruleForm, pointsPerAmount: Number(e.target.value) })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الحد الأدنى للشراء</label><input type="number" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={ruleForm.minPurchase} onChange={(e) => setRuleForm({ ...ruleForm, minPurchase: Number(e.target.value) })} /></div>
            </div>
            <Button className="w-full" onClick={() => createRuleMutation.mutate(ruleForm as LoyaltyRule)}>{editingRule ? 'تحديث' : 'إضافة'}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LoyaltySubTab;
