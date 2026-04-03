import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, LayoutDashboard, ShoppingCart, Package,
  Users, DollarSign, BarChart3, Settings, X,
  ArrowRight, Keyboard,
} from 'lucide-react';
import { useAppStore } from '@/store';

// ─── Command definitions ────────────────────────────────────────────────────
type ViewName = 'dashboard' | 'sales' | 'products' | 'customers' | 'finance' | 'reports' | 'settings';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  view?: ViewName;
  action?: () => void;
  category: string;
}

const useCommands = (onClose: () => void): Command[] => {
  const { setActiveView } = useAppStore();

  const navigate = (view: ViewName) => {
    setActiveView(view);
    onClose();
  };

  return [
    // ── Navigation ──
    {
      id: 'nav-dashboard',
      label: 'لوحة التحكم',
      description: 'نظرة عامة على المبيعات والإحصائيات',
      icon: <LayoutDashboard size={18} />,
      shortcut: 'F1',
      view: 'dashboard',
      action: () => navigate('dashboard'),
      category: 'التنقل',
    },
    {
      id: 'nav-sales',
      label: 'نقطة البيع',
      description: 'إنشاء فواتير وإتمام المبيعات',
      icon: <ShoppingCart size={18} />,
      shortcut: 'F2',
      view: 'sales',
      action: () => navigate('sales'),
      category: 'التنقل',
    },
    {
      id: 'nav-products',
      label: 'المنتجات',
      description: 'إدارة المخزون وإضافة منتجات',
      icon: <Package size={18} />,
      shortcut: 'F3',
      view: 'products',
      action: () => navigate('products'),
      category: 'التنقل',
    },
    {
      id: 'nav-customers',
      label: 'العملاء',
      description: 'إدارة بيانات العملاء والديون',
      icon: <Users size={18} />,
      shortcut: 'F4',
      view: 'customers',
      action: () => navigate('customers'),
      category: 'التنقل',
    },
    {
      id: 'nav-finance',
      label: 'المالية',
      description: 'المصروفات والخزينة والمدفوعات',
      icon: <DollarSign size={18} />,
      view: 'finance',
      action: () => navigate('finance'),
      category: 'التنقل',
    },
    {
      id: 'nav-reports',
      label: 'التقارير',
      description: 'تحليلات المبيعات والأداء',
      icon: <BarChart3 size={18} />,
      shortcut: 'F8',
      view: 'reports',
      action: () => navigate('reports'),
      category: 'التنقل',
    },
    {
      id: 'nav-settings',
      label: 'الإعدادات',
      description: 'إعدادات المتجر والطباعة والمظهر',
      icon: <Settings size={18} />,
      shortcut: 'F10',
      view: 'settings',
      action: () => navigate('settings'),
      category: 'التنقل',
    },
  ];
};

// ─── CommandPalette Component ───────────────────────────────────────────────
interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useCommands(onClose);

  // Filter commands
  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.includes(query) ||
          (c.description || '').includes(query) ||
          c.category.includes(query),
      )
    : commands;

  // Group by category
  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        filtered[selectedIndex]?.action?.();
      }
    },
    [filtered, selectedIndex, onClose],
  );

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-fade-in"
        onClick={onClose}
      />

      {/* Palette */}
      <div
        className="fixed inset-x-0 top-[10%] mx-auto w-full max-w-xl z-[201] animate-fade-in"
        style={{ animationDuration: '0.15s' }}
      >
        <div className="bg-brand-surface border border-brand-border/50 rounded-3xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-brand-border/20">
            <Search size={20} className="text-brand-accent/40 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="ابحث عن أمر أو صفحة..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-brand-accent placeholder-brand-accent/30 outline-none text-base font-bold"
              dir="rtl"
            />
            <button
              onClick={onClose}
              className="text-brand-accent/30 hover:text-brand-accent/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-brand-accent/30 font-bold text-sm">
                  لا توجد نتائج لـ &quot;{query}&quot;
                </p>
              </div>
            ) : (
              Object.entries(grouped).map(([category, cmds]) => (
                <div key={category}>
                  <p className="px-5 py-2 text-[10px] font-black text-brand-accent/30 uppercase tracking-widest">
                    {category}
                  </p>
                  {cmds.map((cmd) => {
                    const idx = flatIndex++;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        data-index={idx}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-4 px-5 py-3 transition-all text-right ${
                          isSelected
                            ? 'bg-primary-500/15 text-primary-400'
                            : 'text-brand-accent hover:bg-brand-dark/20'
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary-500/20 text-primary-400'
                              : 'bg-brand-dark/30 text-brand-accent/50'
                          }`}
                        >
                          {cmd.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm leading-tight">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-[11px] text-brand-accent/40 mt-0.5 truncate">
                              {cmd.description}
                            </p>
                          )}
                        </div>

                        {/* Shortcut badge */}
                        {cmd.shortcut && (
                          <span className="px-2 py-1 rounded-lg bg-brand-dark/40 border border-brand-border/30 text-[10px] font-black text-brand-accent/40 flex-shrink-0">
                            {cmd.shortcut}
                          </span>
                        )}

                        {/* Arrow */}
                        {isSelected && (
                          <ArrowRight size={14} className="text-primary-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center gap-4 px-5 py-3 border-t border-brand-border/15 text-[10px] font-black text-brand-accent/25">
            <span className="flex items-center gap-1.5">
              <Keyboard size={11} />
              <span>↑↓ للتنقل</span>
            </span>
            <span>↵ للتنفيذ</span>
            <span>Esc للإغلاق</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommandPalette;
