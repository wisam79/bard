import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { Customer, LoyaltyTier, LoyaltyRule, LoyaltyTransaction, GiftCard, Voucher, CustomerSegment, Campaign } from '@/types';
import { Search, Plus, Pencil, Trash2, Users, Wallet, Eye, UserPlus, Star, Clock, Crown, Gift, CreditCard, Tag, DollarSign, Megaphone, Zap, Trash2 as Trash2Icon, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { wailsApp } from '@/lib/wails';

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
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/35">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setActiveSubTab('segments')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'segments' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-muted/60 dark:text-white/30'}`}>الشرائح</button>
          <button onClick={() => setActiveSubTab('campaigns')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeSubTab === 'campaigns' ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-muted/60 dark:text-white/30'}`}>الحملات</button>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => autoSegmentMutation.mutate()} variant="secondary" className="flex items-center gap-2"><Zap size={16} /> تصنيف تلقائي</Button>
          <Button onClick={() => setShowSegmentModal(true)} className="flex items-center gap-2"><Plus size={16} /> شريحة جديدة</Button>
        </div>
      </div>

      {activeSubTab === 'segments' && (
        <div className="grid gap-3">
          {(segments || []).map((s: CustomerSegment) => (
            <div key={s.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} /><div><p className="font-semibold text-sm">{s.name}</p><p className="text-xs text-brand-muted/60">{s.description || s.rules}</p></div></div>
              <div className="flex items-center gap-2"><span className="text-xs text-brand-muted/60 flex items-center gap-1"><Users size={12} /> {s.customerCount}</span><button className="text-red-500/50 hover:text-red-500"><Trash2Icon size={14} /></button></div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'campaigns' && (
        <div className="grid gap-3">
          <Button onClick={() => setShowCampaignModal(true)} variant="secondary" className="flex items-center gap-2 self-start"><Plus size={16} /> حملة جديدة</Button>
          {(campaigns || []).map((c: Campaign) => (
            <div key={c.id} className="bg-brand-surface/50 dark:bg-[#1e1e1e]/50 rounded-xl border border-brand-border/30 p-4 flex items-center justify-between">
              <div><p className="font-semibold text-sm">{c.name}</p><p className="text-xs text-brand-muted/60">{c.type} • {c.targetCount} مستهدف • {c.sentCount} مرسل</p></div>
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
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/35 rounded-lg px-3 py-2 text-sm" value={segmentForm.name} onChange={e => setSegmentForm({ ...segmentForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">الوصف</label><input className="w-full bg-brand-surface/50 border border-brand-border/35 rounded-lg px-3 py-2 text-sm" value={segmentForm.description} onChange={e => setSegmentForm({ ...segmentForm, description: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">القاعدة</label><select className="w-full bg-brand-surface/50 border border-brand-border/35 rounded-lg px-3 py-2 text-sm" value={segmentForm.rules} onChange={e => setSegmentForm({ ...segmentForm, rules: e.target.value })}><option value="high_value">عملاء ذوو قيمة عالية</option><option value="in_debt">عملاء مدينون</option><option value="new_customer">عملاء جدد</option></select></div>
          <Button onClick={() => createSegmentMutation.mutate({ ...segmentForm, id: '', customerCount: 0, isActive: true, createdAt: '', updatedAt: '' } as CustomerSegment)} className="w-full">إنشاء الشريحة</Button>
        </div>
      </Modal>

      <Modal isOpen={showCampaignModal} onClose={() => setShowCampaignModal(false)} title="حملة جديدة">
        <div className="space-y-4 p-4">
          <div><label className="text-xs font-semibold mb-1 block">الاسم</label><input className="w-full bg-brand-surface/50 border border-brand-border/35 rounded-lg px-3 py-2 text-sm" value={campaignForm.name} onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold mb-1 block">النوع</label><select className="w-full bg-brand-surface/50 border border-brand-border/35 rounded-lg px-3 py-2 text-sm" value={campaignForm.type} onChange={e => setCampaignForm({ ...campaignForm, type: e.target.value as 'sms' | 'whatsapp' | 'voucher' })}><option value="sms">رسائل</option><option value="whatsapp">واتساب</option><option value="voucher">كوبون</option></select></div>
          <div><label className="text-xs font-semibold mb-1 block">الشريحة</label><select className="w-full bg-brand-surface/50 border border-brand-border/35 rounded-lg px-3 py-2 text-sm" value={campaignForm.segmentId} onChange={e => setCampaignForm({ ...campaignForm, segmentId: e.target.value })}><option value="">اختر الشريحة</option>{(segments || []).map((s: CustomerSegment) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <Button onClick={() => createCampaignMutation.mutate({ ...campaignForm, id: '', description: '', discountId: '', status: 'draft', targetCount: 0, sentCount: 0, responseCount: 0, createdAt: '', updatedAt: '' } as Campaign)} className="w-full">إنشاء الحملة</Button>
        </div>
      </Modal>
    </div>
  );
};

export default SegmentsSubTab;
