import type { Sale, PaginatedSales, ParkedSale, InstallmentPlan } from '@/types';
import { wailsApp } from '@/lib/wails';
import { useAuthStore } from '@/store/authStore';

export const salesService = {
  async getAll(page = 1, limit = 20, search = '', status = ''): Promise<PaginatedSales> {
    return wailsApp.GetSales(page, limit, search, status);
  },

  async getById(id: string): Promise<Sale> {
    return wailsApp.GetSale(id);
  },

  async create(sale: Sale): Promise<void> {
    return wailsApp.CreateSale(sale);
  },

  async processReturn(saleID: string): Promise<Sale> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.ProcessReturn(token, saleID);
  },

  async getRecent(limit = 10): Promise<Sale[]> {
    return wailsApp.GetRecentSales(limit);
  },

  async calculateInstallmentPlan(
    total: number,
    downPayment: number,
    months: number
  ): Promise<InstallmentPlan> {
    return wailsApp.CalculateInstallmentPlan(total, downPayment, months);
  },

  async getParkedSales(): Promise<ParkedSale[]> {
    return wailsApp.GetParkedSales();
  },

  async parkSale(parked: ParkedSale): Promise<void> {
    return wailsApp.ParkSale(parked);
  },

  async deleteParkedSale(id: number): Promise<void> {
    return wailsApp.DeleteParkedSale(id);
  },
};
