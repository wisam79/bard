import React, { useState, useMemo } from 'react';
import { useAppStore, useAuthStore } from '@/store';
import { View, BusinessMode } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
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
  Bell,
} from 'lucide-react';

const getNavItems = (mode: BusinessMode): { view: View; label: string; icon: React.ReactNode; shortcut?: string }[] => {
  const items: { view: View; label: string; icon: React.ReactNode; shortcut?: string }[] = [
    { view: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} />, shortcut: '1' },
    { view: 'sales', label: 'المبيعات', icon: <ShoppingCart size={20} />, shortcut: '2' },
    { view: 'products', label: 'المنتجات والمخزون', icon: <Package size={20} />, shortcut: '3' },
    { view: 'customers', label: 'العملاء والتسويق', icon: <Users size={20} />, shortcut: '4' },
    { view: 'finance', label: 'المالية', icon: <Wallet size={20} />, shortcut: '5' },
  ];

  if (mode === 'restaurant') {
    items.push({ view: 'operations', label: 'العمليات', icon: <UtensilsCrossed size={20} />, shortcut: '6' });
  } else {
    items.push({ view: 'operations', label: 'العمليات', icon: <Cog size={20} />, shortcut: '6' });
  }

  items.push(
    { view: 'reports', label: 'التقارير والتحليلات', icon: <BarChart3 size={20} />, shortcut: '7' },
    { view: 'settings', label: 'الإعدادات', icon: <Settings size={20} />, shortcut: '8' },
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
  const { logout, user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navItems = useMemo(() => getNavItems(businessMode), [businessMode]);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-brand-surface/60 dark:bg-[#161930]/90 backdrop-blur-2xl border-l border-brand-border/40 dark:border-white/[0.08] flex flex-col h-full relative z-20 overflow-hidden"
    >
      {/* Logo Section */}
      <div className="py-5 px-3 flex items-center gap-3 border-b border-brand-border/30 dark:border-white/[0.06]">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl premium-gradient-bg flex items-center justify-center shadow-lg shadow-primary-500/25 shrink-0 border border-white/10 cursor-pointer"
        >
          <span className="text-base font-black text-white">ب</span>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: -10, width: 0 }}
              className="whitespace-nowrap overflow-hidden"
            >
              <h2 className="text-sm font-black text-brand-accent dark:text-white tracking-tight">بيدر</h2>
              <p className="text-[9px] font-semibold text-brand-muted/60 dark:text-primary-400/60">نظام إدارة المبيعات</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <motion.button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              onHoverStart={() => setHoveredItem(item.view)}
              onHoverEnd={() => setHoveredItem(null)}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 relative ${
                collapsed ? 'px-0 justify-center' : 'px-3'
              } h-11 rounded-lg transition-all duration-normal group`}
            >
              {/* Active Background */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary-500/12 dark:bg-primary-500/15 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-l-full"
                />
              )}

              {/* Icon */}
              <motion.div
                className={`shrink-0 relative ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-brand-muted/70 dark:text-white/50'}`}
                whileHover={{ scale: 1.1 }}
              >
                {item.icon}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 text-primary-500"
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.icon}
                  </motion.div>
                )}
              </motion.div>

              {/* Label */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className={`text-sm font-semibold whitespace-nowrap ${
                      isActive ? 'text-primary-600 dark:text-primary-400' : 'text-brand-muted/80 dark:text-white/60'
                    }`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Shortcut Key */}
              {!collapsed && item.shortcut && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredItem === item.view ? 1 : 0.4 }}
                  className="mr-auto text-[9px] font-mono font-semibold text-brand-muted/50 dark:text-white/30 bg-brand-surface/50 dark:bg-white/5 px-1.5 py-0.5 rounded border border-brand-border/30 dark:border-white/10"
                >
                  {item.shortcut}
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-2 py-3 border-t border-brand-border/30 dark:border-white/[0.06] space-y-2">
        {/* Business Mode */}
        <div
          className={`flex items-center gap-2 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-9 rounded-lg bg-primary-500/[0.08] border border-primary-500/15 text-primary-600 dark:text-primary-400`}
          title={`وضع ${MODE_LABELS[businessMode].label}`}
        >
          <div className="shrink-0">{MODE_LABELS[businessMode].icon}</div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-semibold whitespace-nowrap"
            >
              {MODE_LABELS[businessMode].label}
            </motion.span>
          )}
        </div>

        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center gap-3 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-9 rounded-lg text-brand-muted/70 dark:text-white/50 hover:text-brand-accent dark:hover:text-white/80 hover:bg-brand-border/20 dark:hover:bg-white/[0.06] transition-all`}
          title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          {!collapsed && (
            <span className="text-xs font-medium whitespace-nowrap">
              {theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح'}
            </span>
          )}
        </motion.button>

        {/* Collapse Toggle */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center gap-3 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-8 rounded-lg text-brand-muted/50 dark:text-white/30 hover:text-brand-muted dark:hover:text-white/50 hover:bg-brand-border/15 dark:hover:bg-white/[0.03] transition-all`}
        >
          {collapsed ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
          {!collapsed && <span className="text-[10px] font-medium whitespace-nowrap">تصغير</span>}
        </motion.button>

        {/* User Profile */}
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 p-2.5 rounded-lg bg-brand-surface/50 dark:bg-white/5 border border-brand-border/30 dark:border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0) || 'م'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-accent dark:text-white truncate">
                {user?.name || 'مستخدم'}
              </p>
              <p className="text-[9px] text-brand-muted/60 dark:text-white/40">
                {user?.role || 'مدير'}
              </p>
            </div>
          </motion.div>
        )}

        {/* Logout */}
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center gap-3 ${collapsed ? 'px-0 justify-center' : 'px-3'} h-9 rounded-lg text-error/60 hover:text-error hover:bg-error/10 transition-all`}
          title="تسجيل الخروج"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-xs font-medium whitespace-nowrap">تسجيل الخروج</span>}
        </motion.button>
      </div>
    </motion.aside>
  );
};
