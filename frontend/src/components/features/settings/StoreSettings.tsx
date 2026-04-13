import React from 'react';
import { Store, Database, Lock } from 'lucide-react';
import { AppPreferences } from '@/types';
import Button from '@/components/ui/Button';

interface StoreSettingsProps {
  formData: Partial<AppPreferences>;
  setFormData: (data: Partial<AppPreferences>) => void;
  onSave: () => void;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ formData, setFormData, onSave }) => {
  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <div>
        <h3 className="text-xl font-black dark:text-white text-gray-900 mb-6 flex items-center gap-3">
          <Store className="text-primary-400" />
          بيانات الهوية التجارية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">اسم المتجر</label>
            <input type="text" value={formData.storeName || ''} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="input py-3" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">رقم هاتف التواصل</label>
            <input type="text" value={formData.storePhone || ''} onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })} className="input py-3 font-mono" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">عنوان المتجر (يظهر في الفاتورة)</label>
            <input type="text" value={formData.storeAddress || ''} onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })} className="input py-3" />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-brand-border/30">
        <h3 className="text-xl font-black dark:text-white text-gray-900 mb-6 flex items-center gap-3">
          <Database className="text-primary-400" />
          إعدادات العمليات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">رمز العملة</label>
            <input type="text" value={formData.currency || ''} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} className="input py-3" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">نسبة الضريبة %</label>
            <input type="number" value={formData.taxRate || 0} onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })} className="input py-3" min="0" max="100" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">منبه المخزون المنخفض</label>
            <input type="number" value={formData.lowStockTrigger || 5} onChange={(e) => setFormData({ ...formData, lowStockTrigger: Number(e.target.value) })} className="input py-3" min="0" />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-brand-border/30 space-y-4">
        <div className="flex items-center justify-between p-6 bg-brand-dark/35 rounded-2xl border border-brand-border/35">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-sm font-bold dark:text-white text-gray-900">إلزامية تسجيل الشفت</p>
              <p className="text-xs text-brand-muted/60 font-medium">منع عمليات البيع بدون شفت مفتوح</p>
            </div>
          </div>
          <button
            onClick={() => setFormData({ ...formData, requireShift: !formData.requireShift })}
            className={`w-14 h-7 rounded-full transition-all duration-300 relative ${formData.requireShift ? 'bg-primary-500 shadow-lg shadow-primary-500/30' : 'bg-brand-dark'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 ${formData.requireShift ? 'right-8' : 'right-1'}`} />
          </button>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={onSave}>حفظ جميع التغييرات</Button>
      </div>
    </div>
  );
};

export default StoreSettings;
