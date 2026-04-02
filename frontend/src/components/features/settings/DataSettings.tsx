import React from 'react';
import { Shield, Database, Upload, Trash2, Download } from 'lucide-react';
import Button from '@/components/ui/Button';

interface DataSettingsProps {
  onExport: () => void;
  onImport: () => void;
  onClearData: () => void;
  isExporting: boolean;
  isImporting: boolean;
  isClearing: boolean;
}

const DataSettings: React.FC<DataSettingsProps> = ({ 
  onExport, 
  onImport, 
  onClearData, 
  isExporting, 
  isImporting, 
  isClearing 
}) => {
  return (
    <div className="max-w-3xl space-y-8 animate-fade-in dark:text-white text-gray-900">
      <div>
        <h3 className="text-xl font-black dark:text-white text-gray-900 mb-6 flex items-center gap-3">
          <Database className="text-primary-400" />
          إدارة النسخ الاحتياطية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-dark/20 p-6 rounded-2xl border border-brand-border/20 space-y-4">
            <div className="flex items-center gap-3 text-primary-400">
              <Download size={24} />
              <h4 className="font-bold dark:text-white text-gray-900">تصدير قاعدة البيانات</h4>
            </div>
            <p className="text-sm text-brand-accent/60 h-10">
              احتفظ بنسخة من جميع بياناتك الحالية (منتجات، مبيعات، عملاء، إعدادات)
            </p>
            <Button
              onClick={onExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2"
            >
              {isExporting ? 'جاري التصدير...' : 'تصدير الآن'}
              <Download size={18} />
            </Button>
          </div>

          <div className="bg-brand-dark/20 p-6 rounded-2xl border border-brand-border/20 space-y-4">
            <div className="flex items-center gap-3 text-blue-400">
              <Upload size={24} />
              <h4 className="font-bold dark:text-white text-gray-900">استيراد قاعدة البيانات</h4>
            </div>
            <p className="text-sm text-brand-accent/60 h-10">
              استعادة النظام من نسخة احتياطية سابقة. (سيتم دمج البيانات)
            </p>
            <Button
              onClick={onImport}
              disabled={isImporting}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              {isImporting ? 'جاري الاستيراد...' : 'استيراد نسخة'}
              <Upload size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-brand-border/30">
        <h3 className="text-xl font-black text-red-400 mb-6 flex items-center gap-3">
          <Shield className="text-red-500" />
          منطقة الخطر
        </h3>

        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-red-400 flex items-center gap-2 mb-2">
                مسح جميع البيانات <Trash2 size={16} />
              </h4>
              <p className="text-sm text-red-200/60 max-w-md">
                هذا الإجراء سيقوم بحذف جميع المنتجات، المبيعات، ومسح قاعدة البيانات بالكامل باستثناء بيانات الدخول. لا يمكن التراجع عن هذا الإجراء!
              </p>
            </div>
            <Button
              onClick={onClearData}
              disabled={isClearing}
              className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 px-8"
            >
              {isClearing ? 'جاري المسح...' : 'حذف البيانات'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSettings;
