import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';

export type ShortcutAction =
  | 'go-dashboard'
  | 'go-sales'
  | 'go-products'
  | 'go-customers'
  | 'go-finance'
  | 'go-reports'
  | 'go-settings'
  | 'open-command-palette'
  | 'refresh'
  | 'escape';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  fn?: boolean; // F1-F12
  label: string;
  action: ShortcutAction;
  hint: string;
}

export const SHORTCUTS: ShortcutConfig[] = [
  { key: 'F1',  fn: true,  label: 'F1',       action: 'go-dashboard',          hint: 'لوحة التحكم' },
  { key: 'F2',  fn: true,  label: 'F2',       action: 'go-sales',              hint: 'نقطة البيع' },
  { key: 'F3',  fn: true,  label: 'F3',       action: 'go-products',           hint: 'المنتجات' },
  { key: 'F4',  fn: true,  label: 'F4',       action: 'go-customers',          hint: 'العملاء' },
  { key: 'F5',  fn: true,  label: 'F5',       action: 'refresh',               hint: 'تحديث' },
  { key: 'F8',  fn: true,  label: 'F8',       action: 'go-reports',            hint: 'التقارير' },
  { key: 'F10', fn: true,  label: 'F10',      action: 'go-settings',           hint: 'الإعدادات' },
  { key: 'k',   ctrl: true, label: 'Ctrl+K',  action: 'open-command-palette',  hint: 'لوحة الأوامر' },
  { key: 'Escape',          label: 'Escape',  action: 'escape',                hint: 'إغلاق' },
];

interface UseKeyboardShortcutsOptions {
  onCommandPalette: () => void;
  onEscape?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onCommandPalette,
  onEscape,
  disabled = false,
}: UseKeyboardShortcutsOptions) {
  const { setActiveView } = useAppStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      // Ignore when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key !== 'Escape') return;
      }

      const matched = SHORTCUTS.find((s) => {
        if (s.key.toLowerCase() !== e.key.toLowerCase()) return false;
        if (s.ctrl !== undefined && s.ctrl !== (e.ctrlKey || e.metaKey)) return false;
        if (s.shift !== undefined && s.shift !== e.shiftKey) return false;
        if (s.alt !== undefined && s.alt !== e.altKey) return false;
        return true;
      });

      if (!matched) return;

      // Prevent default for function keys and Ctrl combinations
      if (matched.fn || matched.ctrl || matched.alt) {
        e.preventDefault();
      }

      switch (matched.action) {
        case 'go-dashboard':   setActiveView('dashboard');  break;
        case 'go-sales':       setActiveView('sales');      break;
        case 'go-products':    setActiveView('products');   break;
        case 'go-customers':   setActiveView('customers');  break;
        case 'go-finance':     setActiveView('finance');    break;
        case 'go-reports':     setActiveView('reports');    break;
        case 'go-settings':    setActiveView('settings');   break;
        case 'open-command-palette': onCommandPalette();   break;
        case 'escape':         onEscape?.();               break;
        case 'refresh':
          window.location.reload();
          break;
      }
    },
    [disabled, setActiveView, onCommandPalette, onEscape],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
