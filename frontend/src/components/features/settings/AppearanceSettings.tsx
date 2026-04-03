import React from 'react';
import { useAppStore } from '@/store';
import { Palette, Moon, Bell } from 'lucide-react';
import { AppPreferences } from '@/types';
import Button from '@/components/ui/Button';

interface AppearanceSettingsProps {
  formData: Partial<AppPreferences>;
  setFormData: (data: Partial<AppPreferences>) => void;
  onSave: () => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ formData, setFormData, onSave }) => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in dark:text-white text-gray-900">
      <h3 className="text-xl font-black dark:text-white text-gray-900 mb-6 flex items-center gap-3">
        <Palette className="text-primary-400" />
        تخصيص الواجهة
      </h3>
      
      <div className="space-y-4">
        {[
          { id: 'theme', label: 'الوضع الداكن (Dark Mode)', icon: <Moon size={20} />, active: theme === 'dark', action: toggleTheme },
          { id: 'sound', label: 'المؤثرات الصوتية (Alerts)', icon: <Bell size={20} />, active: formData.enableSound, action: () => setFormData({ ...formData, enableSound: !formData.enableSound }) },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between p-6 bg-brand-dark/20 rounded-2xl border border-brand-border/20 hover:border-brand-border transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border/30 flex items-center justify-center text-brand-accent/60">
                {item.icon}
              </div>
              <span className="text-sm font-bold dark:text-white text-gray-900">{item.label}</span>
            </div>
            <button
              onClick={item.action}
              className={`w-14 h-7 rounded-full transition-all duration-300 relative ${item.active ? 'bg-primary-500 shadow-lg shadow-primary-500/30' : 'bg-brand-dark'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 ${item.active ? 'right-8' : 'right-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-brand-border/30 space-y-2">
        <label className="text-xs font-black text-brand-accent/40 uppercase tracking-widest mr-1">حجم خط النظام</label>
        <div className="flex gap-2">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              onClick={() => setFormData({ ...formData, fontSize: size })}
              className={`flex-1 py-3 rounded-xl text-xs font-black border-2 transition-all ${
                formData.fontSize === size
                  ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-brand-dark/20 border-brand-border/20 text-brand-accent/40 hover:border-brand-border'
              }`}
            >
              {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={onSave}>حفظ إعدادات المظهر</Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
