import React, { useState, useMemo } from 'react';
import { useAppStore, useAuthStore } from '@/store';
import { View, BusinessMode } from '@/types';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  UtensilsCrossed,
  Store,
  Building2,
  Cog,
} from 'lucide-react';

const getNavItems = (mode: BusinessMode): { view: View; label: string; icon: React.ReactNode }[] => {
  const items: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
    { view: 'sales', label: 'المبيعات', icon: <ShoppingCart size={20} /> },
    { view: 'products', label: 'المنتجات والمخزون', icon: <Package size={20} /> },
    { view: 'customers', label: 'العملاء والتسويق', icon: <Users size={20} /> },
    { view: 'finance', label: 'المالية', icon: <Wallet size={20} /> },
  ];

  if (mode === 'restaurant') {
    items.push({ view: 'operations', label: 'العمليات', icon: <UtensilsCrossed size={20} /> });
  } else {
    items.push({ view: 'operations', label: 'العمليات', icon: <Cog size={20} /> });
  }

  items.push(
    { view: 'reports', label: 'التقارير والتحليلات', icon: <BarChart3 size={20} /> },
    { view: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
  );

  return items;
};

const MODE_LABELS: Record<BusinessMode, { label: string; icon: React.ReactNode; desc: string }> = {
  retail: { label: 'تجاري', icon: <Store size={14} />, desc: 'متجر / سوبرماركت' },
  restaurant: { label: 'مطعم', icon: <UtensilsCrossed size={14} />, desc: 'مطعم / كافيه' },
  wholesale: { label: 'جملة', icon: <Building2 size={14} />, desc: 'توزيع / جملة' },
};

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, theme, toggleTheme, businessMode } = useAppStore();
  const { logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = useMemo(() => getNavItems(businessMode), [businessMode]);

  return (
    <aside className={`${collapsed ? 'w-[72px]' : 'w-[220px]'} bg-brand-surface/30 dark:bg-[#252526]/80 backdrop-blur-2xl border-l border-brand-border/15 dark:border-white/[0.04] flex flex-col h-full relative z-20 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
      <div className="py-6 px-4 flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-xl premium-gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0 border border-white/10">
          <span className="text-base font-black text-white">B</span>
        </div>
        <div className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <h2 className="text-sm font-black text-brand-accent dark:text-white tracking-tight">Bard</h2>
          <p className="text-[8px] font-bold text-brand-accent/25 dark:text-white/15 uppercase tracking-[0.2em]">POS Engine</p>
        </div>
      </div>

      <div className="mx-3 h-px bg-brand-border/15 dark:bg-white/[0.04]" />

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              data-testid={`nav-${item.view}`}
              className={`w-full flex items-center gap-3 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-11 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-brand-accent/40 dark:text-white/30 hover:text-brand-accent dark:hover:text-white/70 hover:bg-brand-border/15 dark:hover:bg-white/[0.04]'
              }`}
            >
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary-500 rounded-l-full" />
              )}
              <div className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                {item.icon}
              </div>
              <span className={`text-[13px] font-semibold transition-all duration-500 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                {item.label}
              </span>
              {isActive && !collapsed && (
                <div className="mr-auto bg-primary-500/15 text-primary-500 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  نشط
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-2 py-3 mt-auto space-y-1">
        <div className="mx-1 h-px bg-brand-border/15 dark:bg-white/[0.04] mb-2" />

        <div className={`flex items-center gap-3 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-10 rounded-xl bg-primary-500/[0.06] border border-primary-500/10 text-primary-600 dark:text-primary-400`}>
          {MODE_LABELS[businessMode].icon}
          <div className={`transition-all duration-500 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <span className="text-[11px] font-semibold">وضع {MODE_LABELS[businessMode].label}</span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          title="تبديل المظهر"
          aria-label="تبديل المظهر"
          data-testid="theme-toggle"
          className={`w-full flex items-center gap-3 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-10 rounded-xl text-brand-accent/35 dark:text-white/25 hover:text-brand-accent dark:hover:text-white/60 hover:bg-brand-border/15 dark:hover:bg-white/[0.04] transition-all duration-300`}
        >
          {theme === 'dark' ? <Moon size={18} className="shrink-0" /> : <Sun size={18} className="shrink-0" />}
          <span className={`text-[11px] font-medium transition-all duration-500 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            {theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح'}
          </span>
        </button>

        <button
          onClick={logout}
          title="تسجيل الخروج"
          aria-label="تسجيل الخروج"
          data-testid="logout-button"
          className={`w-full flex items-center gap-3 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-10 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/[0.06] transition-all duration-300`}
        >
          <LogOut size={18} className="shrink-0" />
          <span className={`text-[11px] font-medium transition-all duration-500 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            تسجيل الخروج
          </span>
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
          className={`w-full flex items-center gap-3 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-9 rounded-xl text-brand-accent/20 dark:text-white/10 hover:text-brand-accent/40 dark:hover:text-white/25 hover:bg-brand-border/10 dark:hover:bg-white/[0.02] transition-all duration-300`}
        >
          {collapsed ? <ChevronsLeft size={16} className="shrink-0" /> : <ChevronsRight size={16} className="shrink-0" />}
          <span className={`text-[10px] font-medium transition-all duration-500 overflow-hidden whitespace-nowrap ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            تصغير
          </span>
        </button>
      </div>
    </aside>
  );
};
