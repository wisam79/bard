import { useState } from 'react';
import { Banknote, CreditCard, Split } from 'lucide-react';
import { Modal } from '@/components/ui';

const formatCurrency = (amount: number) => amount.toLocaleString('ar-IQ');

interface SplitPaymentModalProps {
  total: number;
  onClose: () => void;
  onConfirm: (cash: number, card: number) => void;
}

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({ total, onClose, onConfirm }) => {
  const [cash, setCash] = useState(total);
  const card = total - cash;

  return (
    <Modal isOpen={true} title="دفع مجزأ (Split Payment)" onClose={onClose} size="sm">
      <div className="space-y-6 pt-2">
        <div className="bg-brand-dark/20 dark:bg-white/[0.03] p-4 rounded-2xl border border-brand-border/15 dark:border-white/[0.05] text-center">
          <p className="text-brand-accent/25 dark:text-white/15 text-xs font-bold mb-1 uppercase">إجمالي المبلغ</p>
          <p className="text-3xl font-black text-brand-accent dark:text-white">{formatCurrency(total)} <span className="text-[10px] text-brand-accent/15 dark:text-white/10">د.ع</span></p>
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold text-brand-accent/30 dark:text-white/20 mb-2"><span>نقدي (Cash)</span><span className="text-brand-accent dark:text-white font-mono">{formatCurrency(cash)}</span></label>
          <input type="range" min="0" max={total} step="250" value={cash} onChange={e => setCash(Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
        </div>

        <div>
          <label className="flex justify-between text-xs font-bold text-brand-accent/30 dark:text-white/20 mb-2"><span>بطاقة (Card)</span><span className="text-brand-accent dark:text-white font-mono">{formatCurrency(card)}</span></label>
          <input type="range" min="0" max={total} step="250" value={card} onChange={e => setCash(total - Number(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center">
            <Banknote className="mx-auto mb-1 text-emerald-500" size={20} />
            <p className="font-bold text-brand-accent dark:text-white text-lg">{formatCurrency(cash)}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-center">
            <CreditCard className="mx-auto mb-1 text-blue-500" size={20} />
            <p className="font-bold text-brand-accent dark:text-white text-lg">{formatCurrency(card)}</p>
          </div>
        </div>

        <button onClick={() => onConfirm(cash, card)} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black py-4 rounded-xl shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2">
          <Split size={18} /> تأكيد الدفع
        </button>
      </div>
    </Modal>
  );
};
