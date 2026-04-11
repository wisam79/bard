import type { Expense, Payment } from '@/types';
import { wailsApp } from '@/lib/wails';
import { useAuthStore } from '@/store/authStore';

export const financeService = {
  async getExpenses(
    page = 1,
    limit = 20,
    category = ''
  ): Promise<[Expense[], number]> {
    return wailsApp.GetExpenses(page, limit, category);
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    const newExpense: Expense = {
      ...expense,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return wailsApp.CreateExpense(token, newExpense);
  },

  async updateExpense(expense: Expense): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.UpdateExpense(token, expense);
  },

  async deleteExpense(id: string): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.DeleteExpense(token, id);
  },

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<void> {
    const newPayment: Payment = {
      ...payment,
      id: 0,
      createdAt: '',
    };
    return wailsApp.CreatePayment(newPayment);
  },

  async getPayments(saleID: string): Promise<Payment[]> {
    return wailsApp.GetPayments(saleID);
  },
};
