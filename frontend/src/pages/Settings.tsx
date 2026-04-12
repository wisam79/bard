import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { AppPreferences, Staff } from '@/types';
import { Settings as SettingsIcon, Store, Palette, Shield, Database, Printer, Wifi } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import StoreSettings from '../components/features/settings/StoreSettings';
import PrintSettings from '../components/features/settings/PrintSettings';
import AppearanceSettings from '../components/features/settings/AppearanceSettings';
import StaffSettings from '../components/features/settings/StaffSettings';
import DataSettings from '../components/features/settings/DataSettings';
import { LanSyncPanel } from '@/components/features/LanSyncPanel';
import { wailsApp } from '@/lib/wails';

const Settings: React.FC = () => {
  const { notify } = useAppStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'store' | 'appearance' | 'print' | 'staff' | 'data' | 'lan' | 'shifts'>('store');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState({ username: '', name: '', password: '', role: 'cashier' as 'cashier' | 'manager' | 'admin', phone: '' });
  const [formData, setFormData] = useState<Partial<AppPreferences>>({});
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const { data: prefs, isLoading } = useQuery<AppPreferences>({
    queryKey: ['preferences'],
    queryFn: () => wailsApp.GetPreferences(),
  });

  const { data: staffList } = useQuery<Staff[]>({
    queryKey: ['staff'],
    queryFn: () => wailsApp.GetStaff(),
  });

  useEffect(() => {
    if (prefs) setFormData(prefs);
  }, [prefs]);

  const updatePrefsMutation = useMutation({
    mutationFn: (p: Partial<AppPreferences>) => wailsApp.UpdatePreferences(p as AppPreferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      notify('تم حفظ الإعدادات بنجاح', 'success');
    },
    onError: () => notify('فشل في حفظ الإعدادات', 'error'),
  });

  const createStaffMutation = useMutation({
    mutationFn: (s: Partial<Staff>) => wailsApp.CreateStaff(s as Staff),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      notify('تم إضافة الموظف بنجاح', 'success');
      setShowStaffModal(false);
      setStaffForm({ username: '', name: '', password: '', role: 'cashier', phone: '' });
    },
    onError: () => notify('فشل في إضافة الموظف', 'error'),
  });

  const resetDbMutation = useMutation({
    mutationFn: () => wailsApp.ResetDatabase('confirm'),
    onSuccess: () => {
      queryClient.invalidateQueries();
      notify('تم إعادة تعيين قاعدة البيانات', 'success');
    },
    onError: () => notify('فشل في إعادة التعيين', 'error'),
  });

  const handleSavePrefs = () => {
    updatePrefsMutation.mutate(formData);
  };

  const handleCreateStaff = () => {
    if (!staffForm.username || !staffForm.name || !staffForm.password) {
      notify('يرجى ملء حقول الموظف المطلوبة', 'error');
      return;
    }
    createStaffMutation.mutate(staffForm);
  };

  const handleExport = async () => {
    try {
      const data = await wailsApp.ExportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bard-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      notify('تم تصدير البيانات بنجاح', 'success');
    } catch {
      notify('فشل في تصدير البيانات', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'store' as const, label: 'المتجر', icon: <Store size={18} />, color: 'text-blue-500' },
    { id: 'appearance' as const, label: 'المظهر', icon: <Palette size={18} />, color: 'text-violet-500' },
    { id: 'print' as const, label: 'الطباعة', icon: <Printer size={18} />, color: 'text-emerald-500' },
    { id: 'staff' as const, label: 'الموظفين', icon: <Shield size={18} />, color: 'text-amber-500' },
    { id: 'lan' as const, label: 'الشبكة', icon: <Wifi size={18} />, color: 'text-cyan-500' },
    { id: 'data' as const, label: 'البيانات', icon: <Database size={18} />, color: 'text-rose-500' },
  ];

  return (
    <div className="p-6 h-full flex flex-col gap-5 relative overflow-hidden animate-fade-in">
      <Modal isOpen={showPrintPreview} onClose={() => setShowPrintPreview(false)} title="معاينة الإيصال" size="sm">
        <div className="bg-white p-6 rounded-xl" id="receipt-preview">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold">{formData?.storeName || 'Bard'}</h2>
            <p className="text-xs text-gray-600">{formData?.storeAddress}</p>
            <p className="text-xs text-gray-600">هاتف: {formData?.storePhone}</p>
            <hr className="border-dashed my-2" />
            <p className="text-xs">رقم الفاتورة: #00001</p>
            <p className="text-xs">التاريخ: 01/04/2026</p>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="border-b"><th className="py-1 text-right">الصنف</th><th className="py-1 text-center">الكمية</th><th className="py-1 text-left">المجموع</th></tr></thead>
            <tbody><tr><td className="py-1">منتج تجريبي</td><td className="py-1 text-center">2</td><td className="py-1 text-left">5,000 د.ع</td></tr></tbody>
          </table>
          <hr className="border-dashed my-2" />
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span>المجموع الفرعي:</span><span>5,000 د.ع</span></div>
            <div className="flex justify-between font-bold border-t pt-1"><span>الإجمالي:</span><span>5,000 د.ع</span></div>
          </div>
          <hr className="border-dashed my-2" />
          <p className="text-center text-xs">{formData?.receiptFooter || 'شكراً لزيارتكم'}</p>
        </div>
      </Modal>

      <div className="flex items-center gap-4">
        <div className="w-1 h-8 bg-primary-500 rounded-full" />
        <div>
          <h1 className="text-2xl font-black text-brand-accent dark:text-white tracking-tight flex items-center gap-3">
            <SettingsIcon className="text-primary-500" size={24} />
            مركز الإعدادات
          </h1>
          <p className="text-[10px] text-brand-accent/20 dark:text-white/10 font-medium">تخصيص النظام وإدارة موارد متجرك</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 overflow-hidden">
        <div className="w-full lg:w-56 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-brand-surface/30 dark:bg-white/[0.02] text-brand-accent/30 dark:text-white/15 hover:text-brand-accent dark:hover:text-white/50 hover:bg-brand-surface/50 dark:hover:bg-white/[0.04] border border-brand-border/10 dark:border-white/[0.03]'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-white' : tab.color}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-brand-surface/20 dark:bg-white/[0.02] backdrop-blur-xl border border-brand-border/15 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm">
          {activeTab === 'store' && <StoreSettings formData={formData} setFormData={setFormData} onSave={handleSavePrefs} />}
          {activeTab === 'appearance' && <AppearanceSettings formData={formData} setFormData={setFormData} onSave={handleSavePrefs} />}
          {activeTab === 'print' && <PrintSettings formData={formData} setFormData={setFormData} onSave={handleSavePrefs} />}
          {activeTab === 'staff' && <StaffSettings staffs={staffList || []} setEditingStaff={setEditingStaff} setShowStaffModal={setShowStaffModal} isLoading={isLoading} />}
          {activeTab === 'lan' && <LanSyncPanel notify={notify} />}
          {activeTab === 'data' && (
            <DataSettings
              onExport={handleExport}
              onImport={() => notify('الاستيراد قيد التطوير', 'info')}
              onClearData={() => {
                if (confirm('هل أنت متأكد؟ سيتم مسح جميع البيانات!')) {
                  if (confirm('تحذير أخير: هذا الإجراء لا يمكن التراجع عنه!')) resetDbMutation.mutate();
                }
              }}
              isExporting={false}
              isImporting={false}
              isClearing={resetDbMutation.isPending}
            />
          )}
        </div>
      </div>

      <Modal isOpen={showStaffModal} onClose={() => setShowStaffModal(false)} title="إضافة موظف جديد" size="md" footer={
        <>
          <Button onClick={() => setShowStaffModal(false)} variant="secondary">إلغاء</Button>
          <Button onClick={handleCreateStaff} loading={createStaffMutation.isPending}>إضافة الموظف</Button>
        </>
      }>
        <form onSubmit={(e) => { e.preventDefault(); handleCreateStaff(); }} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.15em]">اسم المستخدم *</label>
            <input type="text" value={staffForm.username} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })} className="input py-3 font-mono" placeholder="username" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.15em]">الاسم الكامل *</label>
            <input type="text" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="input py-3" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.15em]">كلمة المرور *</label>
            <input type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} className="input py-3 font-mono" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.15em]">الصلاحية</label>
              <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as "cashier" | "manager" | "admin" })} className="input py-3">
                <option value="cashier">كاشير</option>
                <option value="manager">مدير فرع</option>
                <option value="admin">مدير نظام</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-accent/30 dark:text-white/15 uppercase tracking-[0.15em]">رقم الهاتف</label>
              <input type="text" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} className="input py-3 font-mono" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;
