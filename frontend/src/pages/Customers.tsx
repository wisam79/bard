import React, { useState } from 'react';
import { Users, Crown, Gift, Megaphone } from 'lucide-react';
import CustomersSubTab from '@/components/features/customers/CustomersSubTab';
import LoyaltySubTab from '@/components/features/customers/LoyaltySubTab';
import GiftCardsSubTab from '@/components/features/customers/GiftCardsSubTab';
import SegmentsSubTab from '@/components/features/customers/SegmentsSubTab';

type CustomersTab = 'customers' | 'loyalty' | 'giftcards' | 'segments';

const TAB_ITEMS: { id: CustomersTab; label: string; icon: React.ReactNode }[] = [
  { id: 'customers', label: 'العملاء', icon: <Users size={16} /> },
  { id: 'loyalty', label: 'الولاء', icon: <Crown size={16} /> },
  { id: 'giftcards', label: 'بطاقات الهدايا', icon: <Gift size={16} /> },
  { id: 'segments', label: 'الشرائح', icon: <Megaphone size={16} /> },
];

const Customers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CustomersTab>('customers');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 p-2 px-6 bg-brand-surface/30 border-b border-brand-border/30">
        {TAB_ITEMS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20' : 'text-brand-muted/60 dark:text-white/30 hover:bg-brand-surface/50 hover:text-brand-accent/70'}`}>{tab.icon}{tab.label}</button>
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
