import type { Customer } from '@/types';
import { wailsApp } from '@/lib/wails';

export const customerService = {
  async getAll(page = 1, limit = 20, search = ''): Promise<[Customer[], number]> {
    return wailsApp.GetCustomers(page, limit, search);
  },

  async getById(id: string): Promise<Customer> {
    return wailsApp.GetCustomer(id);
  },

  async create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newCustomer: Customer = {
      ...customer,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return wailsApp.CreateCustomer(newCustomer);
  },

  async update(customer: Customer): Promise<void> {
    return wailsApp.UpdateCustomer(customer);
  },

  async delete(id: string): Promise<void> {
    return wailsApp.DeleteCustomer(id);
  },

  async searchByPhone(phone: string): Promise<Customer | null> {
    try {
      return await wailsApp.SearchCustomerByPhone(phone);
    } catch {
      return null;
    }
  },
};
