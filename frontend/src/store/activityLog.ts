import { create } from 'zustand';

// ─── Activity types ──────────────────────────────────────────────────────────
export type ActivityAction =
  | 'sale:create'
  | 'sale:return'
  | 'sale:partial-return'
  | 'product:create'
  | 'product:update'
  | 'product:delete'
  | 'customer:create'
  | 'customer:update'
  | 'customer:delete'
  | 'expense:create'
  | 'settings:update'
  | 'auth:login'
  | 'auth:logout'
  | 'shift:open'
  | 'shift:close';

export interface ActivityEntry {
  id: string;
  action: ActivityAction;
  label: string;
  detail?: string;
  staffName: string;
  timestamp: number;
}

interface ActivityLogState {
  entries: ActivityEntry[];
  maxEntries: number;

  log: (action: ActivityAction, label: string, detail?: string) => void;
  clear: () => void;
  getRecent: (count?: number) => ActivityEntry[];
}

let counter = 0;

// ─── Store ───────────────────────────────────────────────────────────────────
export const useActivityLog = create<ActivityLogState>((set, get) => ({
  entries: [],
  maxEntries: 200,

  log: (action, label, detail) => {
    const entry: ActivityEntry = {
      id: `act-${Date.now()}-${++counter}`,
      action,
      label,
      detail,
      staffName: 'المستخدم الحالي', // Will be overridden by components
      timestamp: Date.now(),
    };

    set((state) => {
      const updated = [entry, ...state.entries];
      if (updated.length > state.maxEntries) {
        updated.length = state.maxEntries;
      }
      return { entries: updated };
    });
  },

  clear: () => set({ entries: [] }),

  getRecent: (count = 20) => {
    return get().entries.slice(0, count);
  },
}));

// ─── Utility: readable action labels ─────────────────────────────────────────
const ACTION_LABELS: Record<ActivityAction, string> = {
  'sale:create':         'إنشاء فاتورة',
  'sale:return':         'إرجاع كامل',
  'sale:partial-return': 'إرجاع جزئي',
  'product:create':      'إضافة منتج',
  'product:update':      'تعديل منتج',
  'product:delete':      'حذف منتج',
  'customer:create':     'إضافة عميل',
  'customer:update':     'تعديل عميل',
  'customer:delete':     'حذف عميل',
  'expense:create':      'إضافة مصروف',
  'settings:update':     'تحديث الإعدادات',
  'auth:login':          'تسجيل دخول',
  'auth:logout':         'تسجيل خروج',
  'shift:open':          'فتح وردية',
  'shift:close':         'إغلاق وردية',
};

export function getActionLabel(action: ActivityAction): string {
  return ACTION_LABELS[action] ?? action;
}

// ─── Utility: action category color ──────────────────────────────────────────
type ActionCategory = 'sale' | 'product' | 'customer' | 'expense' | 'settings' | 'auth' | 'shift';

const CATEGORY_COLORS: Record<ActionCategory, string> = {
  sale:     'text-green-400',
  product:  'text-blue-400',
  customer: 'text-purple-400',
  expense:  'text-orange-400',
  settings: 'text-gray-400',
  auth:     'text-yellow-400',
  shift:    'text-cyan-400',
};

export function getActionColor(action: ActivityAction): string {
  const category = action.split(':')[0] as ActionCategory;
  return CATEGORY_COLORS[category] ?? 'text-brand-accent/50';
}
