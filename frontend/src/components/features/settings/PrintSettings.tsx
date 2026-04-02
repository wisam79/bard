import React from 'react';
import { Printer } from 'lucide-react';
import { AppPreferences } from '@/types';
import Button from '@/components/ui/Button';

interface PrintSettingsProps {
  formData: Partial<AppPreferences>;
  setFormData: (data: Partial<AppPreferences>) => void;
  onSave: () => void;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({ formData, setFormData, onSave }) => {
  return (
    <div className="max-w-2xl space-y-8 animate-fade-in dark:text-white text-gray-900">
      <div>
        <h3 className="text-xl font-black dark:text-white text-gray-900 mb-6 flex items-center gap-3">
          <Printer className="text-primary-400" />
          تخصيص الفواتير
        </h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">رسالة تذييل الفاتورة</label>
            <input
              type="text"
              value={formData.receiptFooter || ''}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              placeholder="مثال: شكراً لتسوقكم معنا"
              className="input py-3"
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-brand-dark/20 rounded-2xl border border-brand-border/20">
            <div>
              <p className="text-sm font-bold">الطباعة التلقائية (Web)</p>
              <p className="text-xs text-brand-accent/40 font-medium mt-1">فتح نافذة الطباعة مباشرة بعد البيع</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, autoPrint: !formData.autoPrint })}
              className={`w-14 h-7 rounded-full transition-all duration-300 relative ${formData.autoPrint ? 'bg-primary-500 shadow-lg shadow-primary-500/30' : 'bg-brand-dark'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 ${formData.autoPrint ? 'right-8' : 'right-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={onSave}>حفظ الإعدادات</Button>
      </div>
    </div>
  );
};

export default PrintSettings;
