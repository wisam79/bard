import React from 'react';
import { useAppStore, useAuthStore } from '@/store';
import { View } from '@/types';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  FileText,
  BarChart3,
  Settings,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  PackageSearch,
} from 'lucide-react';

const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} /> },
  { view: 'sales', label: 'المبيعات', icon: <ShoppingCart size={20} /> },
  { view: 'products', label: 'المنتجات', icon: <Package size={20} /> },
  { view: 'customers', label: 'العملاء', icon: <Users size={20} /> },
  { view: 'inventory', label: 'المخزون والشراء', icon: <PackageSearch size={20} /> },
  { view: 'finance', label: 'المالية', icon: <Wallet size={20} /> },
  { view: 'invoices', label: 'الفواتير', icon: <FileText size={20} /> },
  { view: 'reports', label: 'التقارير', icon: <BarChart3 size={20} /> },
  { view: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, theme, toggleTheme } = useAppStore();
  const { logout } = useAuthStore();

  return (
    <aside className="w-20 bg-brand-surface/40 dark:bg-brand-dark/40 backdrop-blur-xl border-l border-brand-border/30 flex flex-col h-full relative z-20 overflow-hidden transition-all duration-300">
      {/* Logo Section - Icon Only */}
      <div className="py-8 flex justify-center relative">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/20">
          <span className="text-xl font-black text-white">B</span>
        </div>
      </div>

      {/* Nav List - Icons Only with Tooltip-like behavior via title */}
      <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto custom-scrollbar relative flex flex-col items-center">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              title={item.label}
              className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-150 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-brand-accent/60 dark:text-brand-accent/50 hover:text-brand-accent hover:bg-brand-border/20'
              }`}
            >
              <div className={isActive ? 'scale-110' : ''}>
                {item.icon}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions - Stacked Icons */}
      <div className="p-3 mt-auto space-y-3 relative flex flex-col items-center">
        <div className="w-10 h-px bg-brand-border/30 mb-2" />
        
        {/* User Status Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <ShieldCheck size={20} />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="تبديل المظهر"
          className="w-12 h-12 rounded-2xl bg-brand-surface/50 dark:bg-brand-dark/50 border border-brand-border/30 flex items-center justify-center text-brand-accent/60 hover:text-brand-accent transition-colors duration-150"
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          title="تسجيل الخروج"
          className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-500/60 hover:text-red-500 hover:bg-red-500/20 transition-colors duration-150"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};
