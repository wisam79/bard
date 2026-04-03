import type { Staff } from '@/types';
import { wailsApp } from '@/lib/wails';

export const staffService = {
  async login(username: string, password: string): Promise<Staff | null> {
    return wailsApp.Login(username, password);
  },

  async getAll(): Promise<Staff[]> {
    return wailsApp.GetStaff();
  },

  async create(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newStaff: Staff = {
      ...staff,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return wailsApp.CreateStaff(newStaff);
  },

  async update(staff: Staff): Promise<void> {
    return wailsApp.UpdateStaff(staff);
  },

  async delete(id: string): Promise<void> {
    return wailsApp.DeleteStaff(id);
  },
};
