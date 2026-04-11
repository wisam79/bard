import type { AppPreferences, DatabaseExport } from '@/types';
import { wailsApp } from '@/lib/wails';
import { useAuthStore } from '@/store/authStore';

export const settingsService = {
  async getPreferences(): Promise<AppPreferences> {
    return wailsApp.GetPreferences();
  },

  async updatePreferences(prefs: AppPreferences): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.UpdatePreferences(token, prefs);
  },

  async resetDatabase(): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.ResetDatabase(token);
  },

  async exportDatabase(): Promise<DatabaseExport> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.ExportDatabase(token);
  },

  async importDatabase(data: DatabaseExport): Promise<void> {
    const token = useAuthStore.getState().getToken();
    if (!token) throw new Error('Not authenticated');
    return wailsApp.ImportDatabase(token, data);
  },
};
