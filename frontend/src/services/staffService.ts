import type { Staff } from '@/types';

export const staffService = {
  async login(username: string, password: string): Promise<Staff | null> {
    return window.go.main.App.Login(username, password);
  },

  async getAll(): Promise<Staff[]> {
    return window.go.main.App.GetStaff();
  },

  async create(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const newStaff: Staff = {
      ...staff,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return window.go.main.App.CreateStaff(newStaff);
  },

  async update(staff: Staff): Promise<void> {
    return window.go.main.App.UpdateStaff(staff);
  },

  async delete(id: string): Promise<void> {
    return window.go.main.App.DeleteStaff(id);
  },
};
