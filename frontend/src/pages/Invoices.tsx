import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Sale, PaginatedSales, AppPreferences } from '@/types';
import { ReceiptData } from '@/types';
import { Search, Eye, RotateCcw, FileText, Printer, Filter, Calendar, CreditCard, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { PrintReceipt, BarcodeDisplay } from '@/components/ui';
import { wailsApp } from '@/lib/wails';

const Invoices: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [printData, setPrintData] = useState<ReceiptData | null>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const { data: preferences } = useQuery<AppPreferences>({
    queryKey: ['preferences'],
    queryFn: () => wailsApp.GetPreferences(),
  });

  const { data: salesData, isLoading } = useQuery<PaginatedSales>({
    queryKey: ['sales', page, 20, searchQuery, statusFilter],
    queryFn: () => wailsApp.GetSales(page, 20, searchQuery, statusFilter),
  });

  const returnMutation = useMutation({
    mutationFn: (saleId: string) => wailsApp.ProcessReturn(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      notify('تم إرجاع الفاتورة بنجاح', 'success');
      setViewingSale(null);
    },
    onError: () => notify('فشل في إرجاع الفاتورة', 'error'),
  });

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    completed: { label: 'مكتملة', color: 'text-green-400', bg: 'bg-green-500/10' },
    pending: { label: 'معلقة', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    return: { label: 'مرتجعة', color: 'text-red-400', bg: 'bg-red-500/10' },
    cancelled: { label: 'ملغاة', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  };

  const paymentMethodLabels: Record<string, string> = {
    cash: 'نقداً',
    card: 'بطاقة',
    credit: 'آجل',
    installment: 'أقساط',
  };

  const generateReceiptData = useCallback((sale: Sale): ReceiptData => {
    return {
      storeName: preferences?.storeName || 'Bard',
      storeAddress: preferences?.storeAddress || '',
      storePhone: preferences?.storePhone || '',
      receiptNo: `#${sale.id.slice(0, 8)}`,
      date: sale.date,
      cashier: sale.staffName || '',
      customerName: sale.customerName || 'عميل نقدي',
      items: sale.items?.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })) || [],
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.vat,
      total: sale.total,
      paymentMethod: paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod,
      note: sale.note || undefined,
      barcode: sale.id.slice(0, 8),
      footer: 'شكراً لزيارتكم، نأمل أن نراكم مرة أخرى',
    };
  }, [preferences]);

  const handlePrintInvoice = useCallback((sale: Sale) => {
    const data = generateReceiptData(sale);
    setPrintData(data);
  }, [generateReceiptData]);

  const handlePrintReport = useCallback(() => {
    notify('سيتم تنفيذ طباعة التقرير قريباً', 'info');
  }, [notify]);

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative overflow-hidden bg-brand-dark/20">
      {/* Print Receipt Component */}
      <PrintReceipt
        data={printData}
        paperSize={preferences?.thermalPaperSize as '58mm' | '80mm' || '80mm'}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3">
            <FileText className="text-primary-400" />
            سجل الفواتير
          </h1>
          <p className="text-brand-accent/50 font-medium mt-1">عرض، طباعة وإدارة جميع عمليات البيع السابقة</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handlePrintReport} variant="secondary" icon={<Printer size={18} />}>
            طباعة تقرير
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الفواتير', value: salesData?.stats?.count || 0, icon: <FileText size={20} />, color: 'text-blue-400' },
          { label: 'إجمالي المبيعات', value: (salesData?.stats?.total || 0).toLocaleString('ar-IQ'), suffix: 'د.ع', icon: <CreditCard size={20} />, color: 'text-primary-400' },
          { label: 'فواتير معلقة', value: salesData?.stats?.pending || 0, icon: <Calendar size={20} />, color: 'text-yellow-400' },
          { label: 'المرتجعات', value: salesData?.stats?.returns || 0, icon: <RotateCcw size={20} />, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-brand-surface border border-brand-border/30 rounded-2xl p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-brand-dark/40 flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-accent/40 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black dark:text-white text-gray-900">{stat.value} <span className="text-[10px] opacity-50">{stat.suffix}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-brand-surface border border-brand-border/30 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
        {/* Filters */}
        <div className="p-4 border-b border-brand-border/30 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-accent/30 group-focus-within:text-primary-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="input pr-10 bg-brand-dark/20 border-brand-border/20"
              placeholder="بحث برقم الفاتورة أو اسم العميل..."
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input bg-brand-dark/20 border-brand-border/20 w-full md:w-48 appearance-none pr-10"
            >
              <option value="">جميع الحالات</option>
              <option value="completed">مكتملة</option>
              <option value="pending">معلقة</option>
              <option value="return">مرتجعة</option>
              <option value="cancelled">ملغاة</option>
            </select>
            <button className="btn-secondary p-2.5">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : salesData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-brand-accent/30 space-y-4">
              <FileText size={48} className="opacity-20" />
              <p className="font-bold">لا توجد فواتير مطابقة للبحث</p>
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-dark/30 border-b border-brand-border/30">
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest">رقم الفاتورة / العميل</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">التاريخ</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">الإجمالي</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">الدفع</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">الحالة</th>
                  <th className="py-4 px-6 text-[10px] font-black text-brand-accent/40 uppercase tracking-widest text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/10">
                {salesData?.data?.map((sale: Sale) => (
                  <tr key={sale.id} className="hover:bg-brand-dark/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-dark/40 flex items-center justify-center border border-brand-border/30">
                          <FileText size={18} className="text-brand-accent/40" />
                        </div>
                        <div>
                          <p className="text-xs font-mono font-bold dark:text-white text-gray-900 leading-none mb-1">#{sale.id.slice(0, 8)}</p>
                          <p className="text-[10px] text-brand-accent/40 font-medium truncate max-w-[150px]">{sale.customerName || 'عميل نقدي'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-bold text-brand-accent/60">
                      {sale.date}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className={`text-sm font-black ${sale.status === 'return' ? 'text-red-400' : 'dark:text-white text-gray-900'}`}>
                        {sale.status === 'return' ? '-' : ''}{Math.abs(sale.total).toLocaleString('ar-IQ')} <span className="text-[10px]">د.ع</span>
                      </p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[10px] font-black text-brand-accent/60 bg-brand-dark/40 px-3 py-1 rounded-full border border-brand-border/20 uppercase">
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border border-white/5 ${statusLabels[sale.status]?.bg} ${statusLabels[sale.status]?.color}`}>
                        {statusLabels[sale.status]?.label || sale.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewingSale(sale)} className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/10 transition-all">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(sale)}
                          className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-green-400 hover:border-green-500/50 transition-all"
                          title="طباعة"
                        >
                          <Printer size={16} />
                        </button>
                        {sale.status === 'completed' && (
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من إرجاع هذه الفاتورة؟')) {
                                returnMutation.mutate(sale.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-brand-dark/40 border border-brand-border/30 text-brand-accent/40 hover:text-red-400 hover:border-red-500/50 transition-all"
                            title="إرجاع"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {salesData && salesData.totalPages > 1 && (
          <div className="p-4 bg-brand-dark/20 border-t border-brand-border/30 flex items-center justify-between">
            <p className="text-xs font-bold text-brand-accent/40">
              عرض صفحة <span className="dark:text-white text-gray-900">{page}</span> من أصل <span className="dark:text-white text-gray-900">{salesData.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                variant="ghost"
                size="sm"
                disabled={page === 1}
              >
                <ChevronRight size={18} />
              </Button>
              <Button
                onClick={() => setPage(p => Math.min(salesData.totalPages || 1, p + 1))}
                variant="ghost"
                size="sm"
                disabled={page === salesData.totalPages}
              >
                <ChevronLeft size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      <Modal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        title="تفاصيل الفاتورة"
        size="xl"
        footer={viewingSale && (
          <>
            <Button onClick={() => setViewingSale(null)} variant="secondary">إغلاق</Button>
            <Button onClick={() => viewingSale && handlePrintInvoice(viewingSale)} icon={<Printer size={18} />}>
              طباعة الفاتورة
            </Button>
            {viewingSale.status === 'completed' && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('هل أنت متأكد من إرجاع هذه الفاتورة بالكامل؟')) {
                    returnMutation.mutate(viewingSale.id);
                  }
                }}
                icon={<RotateCcw size={18} />}
              >
                إرجاع
              </Button>
            )}
          </>
        )}
      >
        {viewingSale && (
          <div className="space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">العميل</p>
                  <p className="text-sm font-bold dark:text-white text-gray-900">{viewingSale.customerName || 'عميل نقدي'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">البائع</p>
                  <p className="text-sm font-bold dark:text-white text-gray-900">{viewingSale.staffName || '-'}</p>
                </div>
              </div>
              <div className="space-y-3 text-left">
                <div>
                  <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">رقم الفاتورة</p>
                  <p className="text-sm font-mono font-bold dark:text-white text-gray-900">{viewingSale.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-brand-accent/30 uppercase tracking-widest mb-1">التاريخ</p>
                  <p className="text-sm font-bold dark:text-white text-gray-900">{viewingSale.date}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-brand-dark/30 rounded-2xl border border-brand-border/30 overflow-hidden">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-brand-dark/50 border-b border-brand-border/30">
                    <th className="py-3 px-4 text-[10px] font-black text-brand-accent/40">الصنف</th>
                    <th className="py-3 px-4 text-[10px] font-black text-brand-accent/40 text-center">الكمية</th>
                    <th className="py-3 px-4 text-[10px] font-black text-brand-accent/40 text-center">السعر</th>
                    <th className="py-3 px-4 text-[10px] font-black text-brand-accent/40 text-left">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/10">
                  {viewingSale.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 text-xs font-bold dark:text-white text-gray-900">{item.name}</td>
                      <td className="py-3 px-4 text-xs font-black dark:text-white text-gray-900 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-xs font-bold text-brand-accent/60 text-center">{item.price.toLocaleString('ar-IQ')}</td>
                      <td className="py-3 px-4 text-xs font-black dark:text-white text-gray-900 text-left">{item.total.toLocaleString('ar-IQ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex flex-col items-end gap-3 pt-4 border-t border-brand-border/30">
              <div className="flex justify-between w-full max-w-xs text-xs font-bold">
                <span className="text-brand-accent/50">المجموع الفرعي</span>
                <span className="dark:text-white text-gray-900">{viewingSale.subtotal.toLocaleString('ar-IQ')} د.ع</span>
              </div>
              {viewingSale.discount > 0 && (
                <div className="flex justify-between w-full max-w-xs text-xs font-bold">
                  <span className="text-brand-accent/50">الخصم</span>
                  <span className="text-red-400">-{viewingSale.discount.toLocaleString('ar-IQ')} د.ع</span>
                </div>
              )}
              {viewingSale.vat > 0 && (
                <div className="flex justify-between w-full max-w-xs text-xs font-bold">
                  <span className="text-brand-accent/50">الضريبة</span>
                  <span className="text-yellow-400">{viewingSale.vat.toLocaleString('ar-IQ')} د.ع</span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-xs pt-3 border-t border-brand-border/20">
                <span className="text-lg font-black dark:text-white text-gray-900">الإجمالي الكلي</span>
                <span className="text-2xl font-black text-primary-400">{viewingSale.total.toLocaleString('ar-IQ')} <span className="text-sm">د.ع</span></span>
              </div>
            </div>

            {/* Bar */}
            <div className="flex items-center gap-4 pt-4 border-t border-brand-border/30">
              <span className="text-xs text-brand-accent/50">باركود الفاتورة:</span>
              <button
                onClick={() => setShowBarcodeModal(true)}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                عرض الباركود
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Barcode Modal */}
      <Modal
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
        title="باركود الفاتورة"
        size="sm"
      >
        <div className="flex flex-col items-center gap-4">
          {viewingSale && (
            <BarcodeDisplay
              value={viewingSale.id.slice(0, 8)}
              format="CODE128"
              height={100}
            />
          )}
          <p className="text-sm text-brand-accent/60">يمكنك مسح هذا الباركود للبحث عن الفاتورة</p>
        </div>
      </Modal>
    </div>
  );
};

export default Invoices;
