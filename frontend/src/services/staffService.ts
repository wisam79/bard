import type { Staff } from '@/types';
import { wailsApp } from '@/lib/wails';
import { useAuthStore } from '@/store/authStore';

export const staffService = {
  async login(username: string, password: string): Promise<Staff | null> {
    return wailsApp.Login(username, password);
  },

  async getAll(): Promise<Staff[]> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.GetStaff(token);
  },

  async create(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    const newStaff: Staff = {
      ...staff,
      id: '',
      createdAt: '',
      updatedAt: '',
    };
    return wailsApp.CreateStaff(token, newStaff);
  },

  async update(staff: Staff): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.UpdateStaff(token, staff);
  },

  async delete(id: string): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.DeleteStaff(token, id);
  },
};
