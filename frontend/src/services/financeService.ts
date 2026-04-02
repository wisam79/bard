import type { Expense, Payment } from '@/types';

export const financeService = {
  async getExpenses(
    page = 1,
    limit = 20,
    category = ''
  ): Promise<[Expense[], number]> {
    return window.go.main.App.GetExpenses(page, limit, category);
  },

  async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newExpense: Expense = {
      ...expense,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return window.go.main.App.CreateExpense(newExpense);
  },

  async updateExpense(expense: Expense): Promise<void> {
    return window.go.main.App.UpdateExpense(expense);
  },

  async deleteExpense(id: string): Promise<void> {
    return window.go.main.App.DeleteExpense(id);
  },

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Promise<void> {
    const newPayment: Payment = {
      ...payment,
      id: 0,
      createdAt: '',
    };
    return window.go.main.App.CreatePayment(newPayment);
  },

  async getPayments(saleID: string): Promise<Payment[]> {
    return window.go.main.App.GetPayments(saleID);
  },
};
