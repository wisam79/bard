import React, { useRef, forwardRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import Button from './Button';
import { Printer } from 'lucide-react';

export interface ReceiptData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  receiptNo: string;
  date: string;
  cashier: string;
  customerName?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paidAmount?: number;
  change?: number;
  note?: string;
  footer?: string;
  barcode?: string;
}

interface PrintReceiptProps {
  data: ReceiptData | null;
  paperSize?: '58mm' | '80mm' | 'a4';
  className?: string;
  showPrintButton?: boolean;
  buttonText?: string;
  autoPrint?: boolean;
  onPrintComplete?: () => void;
}

const ReceiptTemplate = forwardRef<HTMLDivElement, { data: ReceiptData; paperSize: string }>(({ data, paperSize }, ref) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', minimumFractionDigits: 0 }).format(amount);
  };

  const getWidthClass = () => {
    switch (paperSize) {
      case '58mm': return 'max-w-[58mm]';
      case '80mm': return 'max-w-[80mm]';
      case 'a4': return 'max-w-[210mm]';
      default: return 'max-w-[80mm]';
    }
  };

  return (
    <div ref={ref} className={`${getWidthClass()} bg-white text-black p-4 font-mono text-sm print:p-0`} dir="rtl">
      {/* Header */}
      <div className="text-center mb-4 print:mb-2">
        <h2 className="text-xl font-bold print:font-normal">{data.storeName || 'Bard'}</h2>
        {data.storeAddress && <p className="text-xs">{data.storeAddress}</p>}
        {data.storePhone && <p className="text-xs">هاتف: {data.storePhone}</p>}
        <div className="border-b border-dashed border-black my-2 print:my-1"></div>
        <p className="text-xs">رقم الفاتورة: {data.receiptNo}</p>
        <p className="text-xs">التاريخ: {data.date}</p>
        {data.cashier && <p className="text-xs">الكاشير: {data.cashier}</p>}
      </div>

      {/* Customer */}
      {data.customerName && (
        <div className="text-xs mb-2 print:mb-1">
          <span>العميل: </span>
          <span className="font-semibold">{data.customerName}</span>
        </div>
      )}

      {/* Items */}
      <table className="w-full text-xs print:text-[10px]">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1 text-right">الصنف</th>
            <th className="py-1 text-center">الكمية</th>
            <th className="py-1 text-left">السعر</th>
            <th className="py-1 text-left">المجموع</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td className="py-1 text-right">{item.name}</td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-left">{formatCurrency(item.price)}</td>
              <td className="py-1 text-left">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-b border-dashed border-black my-2 print:my-1"></div>

      {/* Totals */}
      <div className="space-y-1 text-xs print:text-[10px]">
        <div className="flex justify-between">
          <span>المجموع الفرعي:</span>
          <span>{formatCurrency(data.subtotal)}</span>
        </div>
        {data.discount > 0 && (
          <div className="flex justify-between">
            <span>الخصم:</span>
            <span>-{formatCurrency(data.discount)}</span>
          </div>
        )}
        {data.tax > 0 && (
          <div className="flex justify-between">
            <span>الضريبة:</span>
            <span>{formatCurrency(data.tax)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm print:font-normal border-t border-black pt-1">
          <span>الإجمالي:</span>
          <span>{formatCurrency(data.total)}</span>
        </div>
        {data.paymentMethod && (
          <div className="flex justify-between">
            <span>طريقة الدفع:</span>
            <span>{data.paymentMethod}</span>
          </div>
        )}
      </div>

      {/* Note */}
      {data.note && (
        <div className="mt-2 text-xs print:text-[10px] border-t border-dashed border-black pt-2">
          <span>ملاحظة: </span>
          <span>{data.note}</span>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-3 print:mt-2 text-xs print:text-[10px] border-t border-dashed border-black pt-2">
        <p>{data.footer || 'شكراً لزيارتكم، نأمل أن نراكم مرة أخرى'}</p>
      </div>
    </div>
  );
});

ReceiptTemplate.displayName = 'ReceiptTemplate';

const PrintReceipt: React.FC<PrintReceiptProps> = ({
  data,
  paperSize = '80mm',
  className = '',
  showPrintButton = true,
  buttonText = 'طباعة الفاتورة',
  autoPrint = false,
  onPrintComplete,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    pageStyle: `
      @page {
        margin: 0;
        size: ${paperSize === 'a4' ? 'A4' : 'auto'};
      }
      body {
        margin: 0;
        padding: 0;
      }
    `,
    onAfterPrint: () => {
      onPrintComplete?.();
    },
  });

  useEffect(() => {
    if (autoPrint && data) {
      handlePrint();
    }
  }, [autoPrint, data, handlePrint]);

  if (!data) return null;

  return (
    <div className={className}>
      {showPrintButton && (
        <Button onClick={() => handlePrint()} icon={<Printer size={18} />}>
          {buttonText}
        </Button>
      )}

      {/* Hidden receipt for printing */}
      <div className="absolute left-0 -top-96 opacity-0 pointer-events-none print:opacity-100 print:relative print:top-0 print:opacity-100">
        <ReceiptTemplate data={data} paperSize={paperSize} ref={componentRef} />
      </div>
    </div>
  );
};

export default PrintReceipt;
