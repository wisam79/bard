import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Printer } from 'lucide-react';

interface PaymentModalProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  confirmSale: () => void;
  isPending: boolean;
  customerName: string;
  setCustomerName: (name: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  discount: number;
  setDiscount: (discount: number) => void;
  subtotal: number;
  total: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  confirmSale,
  isPending,
  customerName,
  setCustomerName,
  paymentMethod,
  setPaymentMethod,
  discount,
  setDiscount,
  subtotal,
  total,
}) => {
  return (
    <Modal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      title="إتمام عملية البيع"
      size="md"
      footer={
        <>
          <Button onClick={() => setShowPaymentModal(false)} variant="secondary">
            إلغاء
          </Button>
          <Button
            onClick={confirmSale}
            loading={isPending}
            variant="success"
            icon={<Printer size={18} />}
          >
            تأكيد وطباعة
          </Button>
        </>
      }
    >
      <div className="space-y-8 py-4">
        {/* Customer Name */}
        <div>
          <label className="block text-[11px] font-black text-brand-accent/40 uppercase tracking-widest mb-2 px-1">
            اسم العميل (اختياري)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="اتركه فارغاً للعميل النقدي"
            className="w-full px-5 py-4 rounded-2xl border border-brand-border/40 bg-brand-surface/20 dark:bg-brand-dark/20 text-brand-accent placeholder:text-brand-accent/10 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none font-bold"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-[11px] font-black text-brand-accent/40 uppercase tracking-widest mb-3 px-1">
            طريقة الدفع
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'cash', label: 'نقداً', icon: '💵' },
              { value: 'card', label: 'بطاقة', icon: '💳' },
              { value: 'credit', label: 'آجل', icon: '📝' },
            ].map((method) => (
              <button
                key={method.value}
                onClick={() => setPaymentMethod(method.value)}
                className={`group p-5 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${
                  paymentMethod === method.value
                    ? 'border-primary-600 dark:border-primary-500 bg-primary-500/5 text-primary-600 dark:text-primary-400 shadow-lg shadow-primary-500/10'
                    : 'border-brand-border/30 dark:border-brand-border/20 hover:border-brand-border bg-transparent text-brand-accent/40'
                }`}
              >
                <div className={`text-3xl transition-transform group-hover:scale-110 duration-300 ${paymentMethod === method.value ? 'grayscale-0' : 'grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0'}`}>
                  {method.icon}
                </div>
                <p className="text-[13px] font-black uppercase tracking-tight">{method.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Discount */}
          <div>
            <label className="block text-[11px] font-black text-brand-accent/40 uppercase tracking-widest mb-2 px-1">
              الخصم (د.ع)
            </label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.min(Number(e.target.value), subtotal))}
              min="0"
              max={subtotal}
              className="w-full px-5 py-4 rounded-2xl border border-brand-border/40 bg-brand-surface/20 dark:bg-brand-dark/20 text-brand-accent focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none font-black text-lg"
            />
          </div>

          {/* Total Display */}
          <div className="flex flex-col justify-end">
            <div className="bg-brand-surface dark:bg-brand-dark/60 p-5 rounded-2xl border border-brand-border/40 shadow-inner group transition-all hover:border-primary-500/20">
              <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-[0.2em] mb-1">الإجمالي النهائي</p>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-primary-600 dark:text-primary-400 tracking-tighter transition-all">
                  {total.toLocaleString('ar-IQ')}
                </span>
                <span className="text-[10px] font-bold text-brand-accent/20">د.ع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
