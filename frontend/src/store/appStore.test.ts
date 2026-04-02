import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './appStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      activeView: 'dashboard',
      theme: 'dark',
      isCommandPaletteOpen: false,
      notifications: [],
      onlineStatus: true,
      appState: 'splash',
    });
  });

  it('has correct initial state', () => {
    const state = useAppStore.getState();
    expect(state.activeView).toBe('dashboard');
    expect(state.theme).toBe('dark');
    expect(state.isCommandPaletteOpen).toBe(false);
    expect(state.notifications).toEqual([]);
    expect(state.onlineStatus).toBe(true);
    expect(state.appState).toBe('splash');
  });

  it('sets active view', () => {
    const { setActiveView } = useAppStore.getState();
    setActiveView('sales');
    expect(useAppStore.getState().activeView).toBe('sales');
  });

  it('toggles theme', () => {
    const { toggleTheme } = useAppStore.getState();
    toggleTheme();
    expect(useAppStore.getState().theme).toBe('light');
    toggleTheme();
    expect(useAppStore.getState().theme).toBe('dark');
  });

  it('sets command palette open', () => {
    const { setCommandPaletteOpen } = useAppStore.getState();
    setCommandPaletteOpen(true);
    expect(useAppStore.getState().isCommandPaletteOpen).toBe(true);
    setCommandPaletteOpen(false);
    expect(useAppStore.getState().isCommandPaletteOpen).toBe(false);
  });

  it('adds notification', () => {
    const { notify } = useAppStore.getState();
    notify('Test message', 'success');
    const notifications = useAppStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].message).toBe('Test message');
    expect(notifications[0].type).toBe('success');
  });

  it('limits notifications to 3', () => {
    const { notify } = useAppStore.getState();
    notify('Message 1', 'info');
    notify('Message 2', 'info');
    notify('Message 3', 'info');
    notify('Message 4', 'info');
    const notifications = useAppStore.getState().notifications;
    expect(notifications).toHaveLength(3);
    expect(notifications[0].message).toBe('Message 2');
  });

  it('deduplicates notifications with same message', () => {
    const { notify } = useAppStore.getState();
    notify('Same message', 'info');
    notify('Same message', 'info');
    const notifications = useAppStore.getState().notifications;
    expect(notifications).toHaveLength(1);
  });

  it('removes notification', () => {
    const { notify, removeNotification } = useAppStore.getState();
    notify('Test', 'info');
    const id = useAppStore.getState().notifications[0].id;
    removeNotification(id);
    expect(useAppStore.getState().notifications).toHaveLength(0);
  });

  it('sets online status', () => {
    const { setOnlineStatus } = useAppStore.getState();
    setOnlineStatus(false);
    expect(useAppStore.getState().onlineStatus).toBe(false);
    setOnlineStatus(true);
    expect(useAppStore.getState().onlineStatus).toBe(true);
  });

  it('sets app state', () => {
    const { setAppState } = useAppStore.getState();
    setAppState('login');
    expect(useAppStore.getState().appState).toBe('login');
    setAppState('app');
    expect(useAppStore.getState().appState).toBe('app');
  });
});
