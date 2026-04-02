import type { AppPreferences, DatabaseExport } from '@/types';

export const settingsService = {
  async getPreferences(): Promise<AppPreferences> {
    return window.go.main.App.GetPreferences();
  },

  async updatePreferences(prefs: AppPreferences): Promise<void> {
    return window.go.main.App.UpdatePreferences(prefs);
  },

  async resetDatabase(): Promise<void> {
    return window.go.main.App.ResetDatabase();
  },

  async exportDatabase(): Promise<DatabaseExport> {
    return window.go.main.App.ExportDatabase();
  },

  async importDatabase(data: DatabaseExport): Promise<void> {
    return window.go.main.App.ImportDatabase(data);
  },
};
