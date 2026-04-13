import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Customer, LoyaltyTier, LoyaltyRule, LoyaltyTransaction, GiftCard, Voucher, CustomerSegment, Campaign } from '@/types';
import { Search, Plus, Pencil, Trash2, Users, Wallet, Eye, UserPlus, Star, Clock, Crown, Gift, CreditCard, Tag, DollarSign, Megaphone, Zap, Trash2 as Trash2Icon, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

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
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/35">
      <div className="flex items-center gap-2">
        {subTabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-muted/60 dark:text-white/30 hover:bg-brand-surface/50'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
        ))}
      </div>

      {activeSubTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input placeholder="كود البطاقة..." value={redeemCode} onChange={(e) => setRedeemCode(e.target.value)} className="bg-brand-surface border border-brand-border/35 rounded-lg px-3 py-2 text-sm w-48" />
              <input type="number" placeholder="المبلغ" value={redeemAmount || ''} onChange={(e) => setRedeemAmount(Number(e.target.value))} className="bg-brand-surface border border-brand-border/35 rounded-lg px-3 py-2 text-sm w-32" />
              <Button size="sm"><DollarSign className="w-3 h-3 ml-1" /> استبدال</Button>
            </div>
            <Button onClick={() => { setCardForm({ initialBalance: 0, purchasedBy: '', code: '' }); setShowCardModal(true); }}><Plus className="w-4 h-4 ml-1" /> بطاقة جديدة</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(cards) ? cards : []).map((card: GiftCard) => (
              <div key={card.id} className={`bg-brand-surface rounded-xl p-4 border ${card.isActive ? 'border-brand-border/35' : 'border-red-500/30 opacity-60'}`}>
                <div className="flex items-center justify-between mb-3"><div className="bg-gradient-to-br from-primary-600 to-violet-600 text-white px-3 py-1.5 rounded-lg font-mono text-sm font-bold tracking-wider">{card.code}</div><span className={`px-2 py-0.5 rounded text-xs ${card.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{card.isActive ? 'مفعلة' : 'معطلة'}</span></div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-brand-bg/50 rounded-lg p-2 text-center"><p className="text-[10px] text-brand-muted/60">الرصيد</p><p className="font-bold text-primary-500">{card.balance.toLocaleString()}</p></div>
                  <div className="bg-brand-bg/50 rounded-lg p-2 text-center"><p className="text-[10px] text-brand-muted/60">المبلغ الأولي</p><p className="font-bold">{card.initialBalance.toLocaleString()}</p></div>
                </div>
                {card.expiresAt && <p className="text-xs text-brand-muted/60 mt-2">تنتهي: {new Date(card.expiresAt).toLocaleDateString('ar-IQ')}</p>}
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
              <div key={v.id} className="bg-brand-surface rounded-xl p-4 border border-brand-border/35 flex items-center justify-between">
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
            <div><label className="text-sm text-brand-accent/60 mb-1 block">المبلغ الأولي</label><input type="number" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={cardForm.initialBalance || ''} onChange={(e) => setCardForm({ ...cardForm, initialBalance: Number(e.target.value) })} /></div>
            <div><label className="text-sm text-brand-accent/60 mb-1 block">كود البطاقة (اختياري)</label><input className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={cardForm.code} onChange={(e) => setCardForm({ ...cardForm, code: e.target.value })} placeholder="سيتم توليده تلقائياً" /></div>
            <div><label className="text-sm text-brand-accent/60 mb-1 block">اسم المشتري</label><input className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={cardForm.purchasedBy} onChange={(e) => setCardForm({ ...cardForm, purchasedBy: e.target.value })} /></div>
            <Button className="w-full" onClick={() => createCardMutation.mutate(cardForm as GiftCard)}>إنشاء البطاقة</Button>
          </div>
        </Modal>
      )}

      {showVoucherModal && (
        <Modal isOpen={showVoucherModal} onClose={() => setShowVoucherModal(false)} title="كوبون خصم جديد">
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">اسم الكوبون</label><input className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={voucherForm.name} onChange={(e) => setVoucherForm({ ...voucherForm, name: e.target.value })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الكود</label><input className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={voucherForm.code} onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">النوع</label><select className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={voucherForm.type} onChange={(e) => setVoucherForm({ ...voucherForm, type: e.target.value as 'percentage' | 'fixed' })}><option value="percentage">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">القيمة</label><input type="number" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={voucherForm.value || ''} onChange={(e) => setVoucherForm({ ...voucherForm, value: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الحد الأدنى للشراء</label><input type="number" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={voucherForm.minPurchase || ''} onChange={(e) => setVoucherForm({ ...voucherForm, minPurchase: Number(e.target.value) })} /></div>
              <div><label className="text-sm text-brand-accent/60 mb-1 block">الحد الأقصى للاستخدام</label><input type="number" className="w-full bg-brand-bg border border-brand-border/35 rounded-lg px-3 py-2" value={voucherForm.maxUses || ''} onChange={(e) => setVoucherForm({ ...voucherForm, maxUses: Number(e.target.value) })} /></div>
            </div>
            <Button className="w-full" onClick={() => createVoucherMutation.mutate(voucherForm as Voucher)}>إنشاء الكوبون</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GiftCardsSubTab;
