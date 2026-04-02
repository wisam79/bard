import type { Sale, PaginatedSales, ParkedSale, InstallmentPlan } from '@/types';

export const salesService = {
  async getAll(page = 1, limit = 20, search = '', status = ''): Promise<PaginatedSales> {
    return window.go.main.App.GetSales(page, limit, search, status);
  },

  async getById(id: string): Promise<Sale> {
    return window.go.main.App.GetSale(id);
  },

  async create(sale: Sale): Promise<void> {
    return window.go.main.App.CreateSale(sale);
  },

  async processReturn(saleID: string): Promise<Sale> {
    return window.go.main.App.ProcessReturn(saleID);
  },

  async getRecent(limit = 10): Promise<Sale[]> {
    return window.go.main.App.GetRecentSales(limit);
  },

  async calculateInstallmentPlan(
    total: number,
    downPayment: number,
    months: number
  ): Promise<InstallmentPlan> {
    return window.go.main.App.CalculateInstallmentPlan(total, downPayment, months);
  },

  async getParkedSales(): Promise<ParkedSale[]> {
    return window.go.main.App.GetParkedSales();
  },

  async parkSale(parked: ParkedSale): Promise<void> {
    return window.go.main.App.ParkSale(parked);
  },

  async deleteParkedSale(id: number): Promise<void> {
    return window.go.main.App.DeleteParkedSale(id);
  },
};
