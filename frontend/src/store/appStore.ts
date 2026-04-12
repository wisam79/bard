import { create } from 'zustand';
import type { View, Notification, BusinessMode } from '@/types';

export type AccentColor = 'indigo' | 'blue' | 'violet' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'orange' | 'teal' | 'pink';

interface AppState {
  activeView: View;
  setActiveView: (view: View) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;

  animationsEnabled: boolean;
  toggleAnimations: () => void;

  compactMode: boolean;
  toggleCompactMode: () => void;

  businessMode: BusinessMode;
  setBusinessMode: (mode: BusinessMode) => void;

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

const savedAccent = (localStorage.getItem('accent-color') as AccentColor) || 'indigo';
const savedAnimations = localStorage.getItem('animations-enabled') !== 'false';
const savedCompact = localStorage.getItem('compact-mode') === 'true';
const savedBusinessMode = (localStorage.getItem('business-mode') as BusinessMode) || 'retail';

if (savedAccent !== 'indigo') {
  document.documentElement.setAttribute('data-accent', savedAccent);
}
if (savedBusinessMode !== 'retail') {
  document.documentElement.setAttribute('data-mode', savedBusinessMode);
}

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

  accentColor: savedAccent,
  setAccentColor: (color) => {
    set({ accentColor: color });
    document.documentElement.setAttribute('data-accent', color);
    localStorage.setItem('accent-color', color);
  },

  animationsEnabled: savedAnimations,
  toggleAnimations: () => {
    const newVal = !get().animationsEnabled;
    set({ animationsEnabled: newVal });
    localStorage.setItem('animations-enabled', String(newVal));
    document.documentElement.classList.toggle('reduce-motion', !newVal);
  },

  compactMode: savedCompact,
  toggleCompactMode: () => {
    const newVal = !get().compactMode;
    set({ compactMode: newVal });
    localStorage.setItem('compact-mode', String(newVal));
    document.documentElement.classList.toggle('compact', newVal);
  },

  businessMode: savedBusinessMode,
  setBusinessMode: (mode) => {
    set({ businessMode: mode });
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('business-mode', mode);
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
