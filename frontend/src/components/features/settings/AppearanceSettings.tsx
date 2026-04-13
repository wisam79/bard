import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import type { AccentColor } from '@/store/appStore';
import type { BusinessMode } from '@/types';
import { Palette, Moon, Sun, Monitor, Zap, Eye, Maximize2, LayoutGrid, Volume2, VolumeX, RotateCcw, Sparkles, Check, Store, UtensilsCrossed, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { AppPreferences } from '@/types';

interface AppearanceSettingsProps {
  formData: Partial<AppPreferences>;
  setFormData: (data: Partial<AppPreferences>) => void;
  onSave: () => void;
}

const ACCENT_COLORS: { id: AccentColor; label: string; hex: string }[] = [
  { id: 'indigo',  label: 'نيلي',     hex: '#6366f1' },
  { id: 'blue',    label: 'أزرق',     hex: '#3b82f6' },
  { id: 'violet',  label: 'بنفسجي',   hex: '#8b5cf6' },
  { id: 'rose',    label: 'وردي',     hex: '#f43f5e' },
  { id: 'emerald', label: 'زمردي',    hex: '#10b981' },
  { id: 'amber',   label: 'عنبري',    hex: '#f59e0b' },
  { id: 'cyan',    label: 'سماوي',    hex: '#06b6d4' },
  { id: 'orange',  label: 'برتقالي',  hex: '#f97316' },
  { id: 'teal',    label: 'أخضر مزرق', hex: '#14b8a6' },
  { id: 'pink',    label: 'زهري',     hex: '#ec4899' },
];

const WALLPAPERS = [
  { id: 'none',      label: 'بدون خلفية',   preview: 'bg-transparent' },
  { id: 'mesh-1',    label: 'شبكة نيلي',     preview: 'bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10' },
  { id: 'mesh-2',    label: 'شبكة زمردي',    preview: 'bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10' },
  { id: 'mesh-3',    label: 'شبكة حمراء',    preview: 'bg-gradient-to-br from-rose-500/10 via-transparent to-amber-500/10' },
  { id: 'dots',      label: 'نقاط',          preview: 'bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.08)_1px,transparent_0)] bg-[length:24px_24px]' },
  { id: 'grid',      label: 'شبكة خطوط',     preview: 'bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[length:32px_32px]' },
];

const Toggle: React.FC<{ active: boolean; onToggle: () => void }> = ({ active, onToggle }) => (
  <button onClick={onToggle} className={`w-14 h-7 rounded-full transition-all duration-300 relative shrink-0 ${active ? 'bg-primary-500 shadow-lg shadow-primary-500/30' : 'bg-brand-border/30 dark:bg-white/[0.06]'}`}>
    <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 ${active ? 'right-8' : 'right-1'}`} />
  </button>
);

const SettingRow: React.FC<{ icon: React.ReactNode; title: string; desc: string; active: boolean; onToggle: () => void }> = ({ icon, title, desc, active, onToggle }) => (
  <div className="flex items-center justify-between p-5 bg-brand-dark/25 dark:bg-white/[0.01] rounded-2xl border border-brand-border/25 dark:border-white/[0.09] hover:border-brand-border/35 dark:hover:border-white/[0.09] transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary-500/[0.06] border border-primary-500/10 flex items-center justify-center text-primary-500/60">{icon}</div>
      <div>
        <p className="text-sm font-bold text-brand-accent dark:text-white/80">{title}</p>
        <p className="text-[10px] text-brand-muted/45 dark:text-white/30 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
    <Toggle active={active} onToggle={onToggle} />
  </div>
);

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ formData, setFormData, onSave }) => {
  const { theme, toggleTheme, accentColor, setAccentColor, animationsEnabled, toggleAnimations, compactMode, toggleCompactMode, businessMode, setBusinessMode } = useAppStore();
  const [wallpaper, setWallpaper] = useState(localStorage.getItem('wallpaper') || 'none');
  const [fontSize, setFontSize] = useState(formData.fontSize || 'medium');
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState(formData.autoLockTime || 0);
  const [language, setLanguage] = useState(formData.language || 'ar');

  useEffect(() => {
    localStorage.setItem('wallpaper', wallpaper);
    document.documentElement.setAttribute('data-wallpaper', wallpaper);
  }, [wallpaper]);

  useEffect(() => {
    setFontSize(formData.fontSize || 'medium');
  }, [formData.fontSize]);

  const handleResetAppearance = () => {
    setAccentColor('indigo');
    setWallpaper('none');
    setFontSize('medium');
    setAutoLockTime(0);
    setLanguage('ar');
    setFormData({
      ...formData,
      fontSize: 'medium',
      autoLockTime: 0,
      language: 'ar',
      enableSound: true,
      accentColor: 'indigo',
    });
    localStorage.removeItem('wallpaper');
    localStorage.removeItem('accent-color');
    document.documentElement.removeAttribute('data-accent');
    document.documentElement.removeAttribute('data-wallpaper');
  };

  const updateFontSize = (size: string) => {
    setFontSize(size);
    setFormData({ ...formData, fontSize: size });
    document.documentElement.setAttribute('data-font-size', size);
    localStorage.setItem('font-size', size);
  };

  const updateAutoLock = (minutes: number) => {
    setAutoLockTime(minutes);
    setFormData({ ...formData, autoLockTime: minutes });
  };

  const updateLanguage = (lang: string) => {
    setLanguage(lang);
    setFormData({ ...formData, language: lang });
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in">
      <h3 className="text-xl font-black text-brand-accent dark:text-white flex items-center gap-3">
        <Palette className="text-primary-500" />
        تخصيص الواجهة والهوية البصرية
      </h3>

      {/* Feature 1: Theme Mode */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">1. وضع العرض</h4>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { if (theme === 'light') toggleTheme(); }} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${theme === 'dark' ? 'border-primary-500 bg-primary-500/[0.06] shadow-lg shadow-primary-500/10' : 'border-brand-border/35 bg-brand-dark/25'}`}>
            <Moon size={20} className={theme === 'dark' ? 'text-primary-500' : 'text-brand-muted/45'} />
            <div className="text-right"><p className="text-sm font-bold text-brand-accent dark:text-white">داكن</p><p className="text-[9px] text-brand-muted/40 dark:text-white/25">مريح للعيون</p></div>
          </button>
          <button onClick={() => { if (theme === 'dark') toggleTheme(); }} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${theme === 'light' ? 'border-primary-500 bg-primary-500/[0.06] shadow-lg shadow-primary-500/10' : 'border-brand-border/35 bg-brand-dark/25'}`}>
            <Sun size={20} className={theme === 'light' ? 'text-primary-500' : 'text-brand-muted/45'} />
            <div className="text-right"><p className="text-sm font-bold text-brand-accent dark:text-white">فاتح</p><p className="text-[9px] text-brand-muted/40 dark:text-white/25">إضاءة نهارية</p></div>
          </button>
        </div>
      </div>

      {/* Feature 2: Accent Color */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">2. اللون الأساسي</h4>
          <button onClick={() => setShowAccentPicker(!showAccentPicker)} className="flex items-center gap-2 text-[10px] font-bold text-primary-500/60 hover:text-primary-500 transition-colors">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ACCENT_COLORS.find(c => c.id === accentColor)?.hex }} />
            {ACCENT_COLORS.find(c => c.id === accentColor)?.label}
          </button>
        </div>
        <div className={`grid grid-cols-5 gap-2 transition-all duration-300 ${showAccentPicker ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {ACCENT_COLORS.map((color) => (
            <button key={color.id} onClick={() => setAccentColor(color.id)} className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${accentColor === color.id ? 'border-current scale-105 shadow-lg bg-white/5' : 'border-brand-border/25 dark:border-white/[0.07] hover:border-brand-border/30 dark:hover:border-white/[0.08]'}`} style={{ borderColor: accentColor === color.id ? color.hex : undefined }}>
              <div className="w-8 h-8 rounded-xl shadow-inner" style={{ backgroundColor: color.hex, boxShadow: accentColor === color.id ? `0 4px 15px ${color.hex}40` : undefined }} />
              <span className="text-[9px] font-bold text-brand-muted/50 dark:text-white/30">{color.label}</span>
              {accentColor === color.id && <Check size={12} style={{ color: color.hex }} className="mt-0.5" />}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map((color) => (
            <button key={color.id} onClick={() => setAccentColor(color.id)} className={`w-8 h-8 rounded-xl transition-all ${accentColor === color.id ? 'ring-2 ring-offset-2 ring-offset-brand-dark scale-110' : 'hover:scale-105 opacity-50 hover:opacity-80'}`} style={{ backgroundColor: color.hex }} />
          ))}
        </div>
      </div>

      {/* Feature 3: Wallpaper/Background */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">3. خلفية التطبيق</h4>
        <div className="grid grid-cols-3 gap-2">
          {WALLPAPERS.map((wp) => (
            <button key={wp.id} onClick={() => setWallpaper(wp.id)} className={`h-20 rounded-xl border-2 transition-all flex items-center justify-center ${wp.preview} ${wallpaper === wp.id ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-brand-border/25 dark:border-white/[0.07] hover:border-brand-border/30'}`}>
              <span className="text-[9px] font-bold text-brand-muted/45 dark:text-white/30">{wp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature 4: Font Size */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">4. حجم الخط</h4>
        <div className="flex gap-2">
          {[
            { id: 'small', label: 'صغير', size: 'text-xs' },
            { id: 'medium', label: 'متوسط', size: 'text-sm' },
            { id: 'large', label: 'كبير', size: 'text-base' },
          ].map((s) => (
            <button key={s.id} onClick={() => updateFontSize(s.id)} className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all ${fontSize === s.id ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-brand-dark/25 border-brand-border/25 text-brand-muted/50 dark:text-white/30 hover:border-brand-border/30'}`}>
              <span className={s.size}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feature 5: Animations */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">5. الحركات والتأثيرات</h4>
        <SettingRow icon={<Zap size={18} />} title="الحركات والانتقالات" desc="تأثيرات الانزلاق والتلاشي والنبض" active={animationsEnabled} onToggle={toggleAnimations} />
      </div>

      {/* Feature 6: Sound */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">6. المؤثرات الصوتية</h4>
        <SettingRow icon={formData.enableSound ? <Volume2 size={18} /> : <VolumeX size={18} />} title="تنبيهات صوتية" desc="صوت عند البيع، الخطأ، والتنبيهات" active={formData.enableSound || false} onToggle={() => setFormData({ ...formData, enableSound: !formData.enableSound })} />
      </div>

      {/* Feature 7: Compact Mode */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">7. وضع العرض المضغوط</h4>
        <SettingRow icon={<Maximize2 size={18} />} title="الوضع المضغوط" desc="تقليل المسافات وزيادة كثافة المعلومات" active={compactMode} onToggle={toggleCompactMode} />
      </div>

      {/* Feature 8: Auto Lock */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">8. القفل التلقائي</h4>
        <div className="p-5 bg-brand-dark/25 dark:bg-white/[0.01] rounded-2xl border border-brand-border/25 dark:border-white/[0.09]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/[0.06] border border-amber-500/10 flex items-center justify-center text-amber-500/60"><Monitor size={18} /></div>
              <div>
                <p className="text-sm font-bold text-brand-accent dark:text-white/80">قفل الشاشة بعد عدم النشاط</p>
                <p className="text-[10px] text-brand-muted/45 dark:text-white/30 font-medium mt-0.5">0 = معطل</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {[
              { mins: 0, label: 'معطل' },
              { mins: 5, label: '5 دقائق' },
              { mins: 10, label: '10 دقائق' },
              { mins: 15, label: '15 دقيقة' },
              { mins: 30, label: '30 دقيقة' },
            ].map((opt) => (
              <button key={opt.mins} onClick={() => updateAutoLock(opt.mins)} className={`flex-1 py-2 rounded-lg text-[9px] font-bold border transition-all ${autoLockTime === opt.mins ? 'bg-primary-500 border-primary-500 text-white' : 'bg-brand-dark/25 border-brand-border/25 text-brand-muted/45 dark:text-white/30 hover:border-brand-border/30'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature 9: Language */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">9. لغة الواجهة</h4>
        <div className="flex gap-2">
          {[
            { id: 'ar', label: 'العربية', desc: 'من اليمين لليسار' },
            { id: 'en', label: 'English', desc: 'Left to Right' },
          ].map((lang) => (
            <button key={lang.id} onClick={() => updateLanguage(lang.id)} className={`flex-1 p-4 rounded-2xl border-2 transition-all text-right ${language === lang.id ? 'border-primary-500 bg-primary-500/[0.06] shadow-lg shadow-primary-500/10' : 'border-brand-border/25 bg-brand-dark/25 hover:border-brand-border/30'}`}>
              <p className="text-sm font-bold text-brand-accent dark:text-white">{lang.label}</p>
              <p className="text-[9px] text-brand-muted/40 dark:text-white/25">{lang.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature 10: Quick Sell / Accessibility */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">10. إعدادات إمكانية الوصول</h4>
        <div className="space-y-2">
          <SettingRow icon={<Eye size={18} />} title="البيع السريع (Quick Sell)" desc="إتمام البيع بخطوة واحدة بدون تأكيد" active={formData.quickSell || false} onToggle={() => setFormData({ ...formData, quickSell: !formData.quickSell })} />
          <SettingRow icon={<LayoutGrid size={18} />} title="عرض الباركود في المنتجات" desc="إظهار رمز الباركود في بطاقات المنتجات" active={formData.showBarcode || false} onToggle={() => setFormData({ ...formData, showBarcode: !formData.showBarcode })} />
          <SettingRow icon={<Sparkles size={18} />} title="عرض الشعار في الفاتورة" desc="طباعة شعار المتجر في الإيصال" active={formData.showLogo || false} onToggle={() => setFormData({ ...formData, showLogo: !formData.showLogo })} />
        </div>
      </div>

      {/* Feature 11: Business Mode */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-brand-muted/45 dark:text-white/30 uppercase tracking-[0.2em]">11. نوع النشاط التجاري</h4>
        <div className="grid grid-cols-3 gap-3">
          {([
            { id: 'retail' as BusinessMode, label: 'تجاري', desc: 'متجر / سوبرماركت / صيدلية', icon: <Store size={24} />, color: 'primary' },
            { id: 'restaurant' as BusinessMode, label: 'مطعم', desc: 'مطعم / كافيه / وجبات سريعة', icon: <UtensilsCrossed size={24} />, color: 'amber' },
            { id: 'wholesale' as BusinessMode, label: 'جملة', desc: 'توزيع / بيع جملة / مستودع', icon: <Building2 size={24} />, color: 'emerald' },
          ]).map((mode) => (
            <button key={mode.id} onClick={() => setBusinessMode(mode.id)} className={`p-5 rounded-2xl border-2 transition-all text-center ${businessMode === mode.id ? 'border-primary-500 bg-primary-500/[0.06] shadow-lg shadow-primary-500/10' : 'border-brand-border/25 bg-brand-dark/25 hover:border-brand-border/30'}`}>
              <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${businessMode === mode.id ? `bg-${mode.color}-500/15 text-${mode.color}-500` : 'bg-brand-surface/30 text-brand-muted/40 dark:text-white/25'}`}>
                {mode.icon}
              </div>
              <p className="text-sm font-black text-brand-accent dark:text-white mb-1">{mode.label}</p>
              <p className="text-[9px] text-brand-muted/40 dark:text-white/25 leading-relaxed">{mode.desc}</p>
              {businessMode === mode.id && <div className="mt-2"><Check size={14} className="text-primary-500 mx-auto" /></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-brand-border/30 dark:border-white/[0.07]">
        <button onClick={handleResetAppearance} className="flex items-center gap-2 text-xs font-bold text-brand-muted/45 dark:text-white/30 hover:text-red-500 transition-colors">
          <RotateCcw size={14} /> إعادة تعيين الافتراضي
        </button>
        <Button onClick={onSave}>حفظ إعدادات المظهر</Button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
