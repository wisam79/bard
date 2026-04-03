import { create } from 'zustand';
import type { View, Notification } from '@/types';

interface AppState {
  activeView: View;
  setActiveView: (view: View) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  notifications: Notification[];
  notify: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: number) => void;

  onlineStatus: boolean;
  setOnlineStatus: (status: boolean) => void;

  appState: 'splash' | 'login' | 'app';
  setAppState: (state: 'splash' | 'login' | 'app') => void;
}

const recentNotifications = new Map<string, number>();

export const useAppStore = create<AppState>()((set, get) => ({
  activeView: 'dashboard',
  setActiveView: (view) => {
    set({ activeView: view });
  },

  theme: 'dark',
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

  notifications: [],
  notify: (message, type = 'info') => {
    const now = Date.now();
    const lastTime = recentNotifications.get(message);
    if (lastTime && now - lastTime < 2000) {
      return;
    }
    recentNotifications.set(message, now);

    set((state) => ({
      notifications: [
        ...state.notifications.filter((n) => n.message !== message),
        { id: now, message, type },
      ].slice(-3),
    }));
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  onlineStatus: true,
  setOnlineStatus: (status) => set({ onlineStatus: status }),

  appState: 'splash',
  setAppState: (appState) => set({ appState }),
}));
