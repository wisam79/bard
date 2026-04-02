import type { Customer } from '@/types';

export const customerService = {
  async getAll(page = 1, limit = 20, search = ''): Promise<[Customer[], number]> {
    return window.go.main.App.GetCustomers(page, limit, search);
  },

  async getById(id: string): Promise<Customer> {
    return window.go.main.App.GetCustomer(id);
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newCustomer: Customer = {
      ...customer,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return window.go.main.App.CreateCustomer(newCustomer);
  },

  async update(customer: Customer): Promise<void> {
    return window.go.main.App.UpdateCustomer(customer);
  },

  async delete(id: string): Promise<void> {
    return window.go.main.App.DeleteCustomer(id);
  },

  async searchByPhone(phone: string): Promise<Customer | null> {
    try {
      return await window.go.main.App.SearchCustomerByPhone(phone);
    } catch {
      return null;
    }
  },
};
