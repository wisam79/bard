import { create } from 'zustand';
import type { PurchaseOrder } from '@/types';
import { useActivityLog } from './activityLog';
import { wailsApp } from '@/lib/wails';

interface PurchaseOrderState {
  orders: PurchaseOrder[];
  total: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;

  fetchOrders: (page: number, limit: number, status?: string) => Promise<void>;
  createOrder: (order: Partial<PurchaseOrder>) => Promise<void>;
  updateOrder: (order: PurchaseOrder) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  receiveOrder: (id: string) => Promise<void>;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>((set, get) => ({
  orders: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,
  error: null,

  fetchOrders: async (page, limit, status = '') => {
    set({ loading: true, error: null });
    try {
      const res = await wailsApp.GetPurchaseOrders(page, limit, status);
      set({
        orders: res.data || [],
        total: res.total || 0,
        totalPages: res.totalPages || 1,
        currentPage: res.page || 1,
        loading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'فشل في تحميل أوامر الشراء', loading: false });
    }
  },

  createOrder: async (order) => {
    set({ loading: true, error: null });
    try {
      if (!order.items) order.items = [];
      await wailsApp.CreatePurchaseOrder(order as PurchaseOrder);
      useActivityLog.getState().log('expense:create', `إنشاء أمر شراء لمورد`, `${order.supplierName} - ${order.total} د.ع`);
      await get().fetchOrders(1, 20); // Refresh list
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل في إنشاء أمر الشراء';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  updateOrder: async (order) => {
    set({ loading: true, error: null });
    try {
      await wailsApp.UpdatePurchaseOrder(order);
      useActivityLog.getState().log('expense:create', `تحديث أمر شراء`, `${order.id.slice(0, 8)} - ${order.total} د.ع`);
      await get().fetchOrders(get().currentPage, 20);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل في تحديث أمر الشراء';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await wailsApp.DeletePurchaseOrder(id);
      useActivityLog.getState().log('expense:create', `حذف أمر شراء`, `معرف ${id.slice(0, 8)}`);
      await get().fetchOrders(get().currentPage, 20);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل في حذف أمر الشراء';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  receiveOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await wailsApp.ReceivePurchaseOrder(id);
      useActivityLog.getState().log('product:create', `استلام أمر شراء`, `معرف ${id.slice(0, 8)}`);
      await get().fetchOrders(get().currentPage, 20);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل في استلام أمر الشراء';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },
}));
