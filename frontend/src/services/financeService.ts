import type { Expense, Payment } from '@/types';
import { wailsApp } from '@/lib/wails';

export const financeService = {
  async getExpenses(
    page = 1,
    limit = 20,
    category = ''
  ): Promise<[Expense[], number]> {
    return wailsApp.GetExpenses(page, limit, category);
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newExpense: Expense = {
      ...expense,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return wailsApp.CreateExpense(newExpense);
  },

  async updateExpense(expense: Expense): Promise<void> {
    return wailsApp.UpdateExpense(expense);
  },

  async deleteExpense(id: string): Promise<void> {
    return wailsApp.DeleteExpense(id);
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
