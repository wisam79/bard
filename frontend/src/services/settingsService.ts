import type { AppPreferences, DatabaseExport } from '@/types';
import { wailsApp } from '@/lib/wails';

export const settingsService = {
  async getPreferences(): Promise<AppPreferences> {
    return wailsApp.GetPreferences();
  },

  async updatePreferences(prefs: AppPreferences): Promise<void> {
    return wailsApp.UpdatePreferences(prefs);
  },

  async resetDatabase(): Promise<void> {
    return wailsApp.ResetDatabase();
  },

  async exportDatabase(): Promise<DatabaseExport> {
    return wailsApp.ExportDatabase();
  },

  async importDatabase(data: DatabaseExport): Promise<void> {
    return wailsApp.ImportDatabase(data);
  },
};
