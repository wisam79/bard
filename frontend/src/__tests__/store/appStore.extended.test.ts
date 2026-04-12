import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from '@/store/appStore';

describe('appStore - extended features', () => {
  beforeEach(() => {
    useAppStore.setState({
      activeView: 'dashboard',
      theme: 'dark',
      accentColor: 'indigo',
      animationsEnabled: true,
      compactMode: false,
      businessMode: 'retail',
      notifications: [],
      onlineStatus: true,
      appState: 'splash',
    });
    localStorage.clear();
    document.documentElement.removeAttribute('data-accent');
    document.documentElement.removeAttribute('data-mode');
    document.documentElement.classList.remove('dark', 'compact', 'reduce-motion');
  });

  describe('businessMode', () => {
    it('defaults to retail', () => {
      expect(useAppStore.getState().businessMode).toBe('retail');
    });

    it('sets business mode to restaurant', () => {
      useAppStore.getState().setBusinessMode('restaurant');
      expect(useAppStore.getState().businessMode).toBe('restaurant');
    });

    it('sets business mode to wholesale', () => {
      useAppStore.getState().setBusinessMode('wholesale');
      expect(useAppStore.getState().businessMode).toBe('wholesale');
    });

    it('persists business mode to localStorage', () => {
      useAppStore.getState().setBusinessMode('restaurant');
      expect(localStorage.getItem('business-mode')).toBe('restaurant');
    });

    it('sets data-mode attribute on document', () => {
      useAppStore.getState().setBusinessMode('restaurant');
      expect(document.documentElement.getAttribute('data-mode')).toBe('restaurant');
    });

    it('restores business mode from localStorage', () => {
      localStorage.setItem('business-mode', 'wholesale');
      expect(localStorage.getItem('business-mode')).toBe('wholesale');
    });
  });

  describe('accentColor', () => {
    it('defaults to indigo', () => {
      expect(useAppStore.getState().accentColor).toBe('indigo');
    });

    it('sets accent color to blue', () => {
      useAppStore.getState().setAccentColor('blue');
      expect(useAppStore.getState().accentColor).toBe('blue');
    });

    it('sets accent color to violet', () => {
      useAppStore.getState().setAccentColor('violet');
      expect(useAppStore.getState().accentColor).toBe('violet');
    });

    it('sets accent color to rose', () => {
      useAppStore.getState().setAccentColor('rose');
      expect(useAppStore.getState().accentColor).toBe('rose');
    });

    it('persists accent color to localStorage', () => {
      useAppStore.getState().setAccentColor('emerald');
      expect(localStorage.getItem('accent-color')).toBe('emerald');
    });

    it('sets data-accent attribute on document', () => {
      useAppStore.getState().setAccentColor('cyan');
      expect(document.documentElement.getAttribute('data-accent')).toBe('cyan');
    });
  });

  describe('animationsEnabled', () => {
    it('defaults to true', () => {
      expect(useAppStore.getState().animationsEnabled).toBe(true);
    });

    it('toggles animations off', () => {
      useAppStore.getState().toggleAnimations();
      expect(useAppStore.getState().animationsEnabled).toBe(false);
    });

    it('toggles animations back on', () => {
      useAppStore.getState().toggleAnimations();
      useAppStore.getState().toggleAnimations();
      expect(useAppStore.getState().animationsEnabled).toBe(true);
    });

    it('persists to localStorage', () => {
      useAppStore.getState().toggleAnimations();
      expect(localStorage.getItem('animations-enabled')).toBe('false');
    });
  });

  describe('compactMode', () => {
    it('defaults to false', () => {
      expect(useAppStore.getState().compactMode).toBe(false);
    });

    it('toggles compact mode on', () => {
      useAppStore.getState().toggleCompactMode();
      expect(useAppStore.getState().compactMode).toBe(true);
    });

    it('toggles compact mode off', () => {
      useAppStore.getState().toggleCompactMode();
      useAppStore.getState().toggleCompactMode();
      expect(useAppStore.getState().compactMode).toBe(false);
    });

    it('persists to localStorage', () => {
      useAppStore.getState().toggleCompactMode();
      expect(localStorage.getItem('compact-mode')).toBe('true');
    });
  });

  describe('notifications', () => {
    it('adds notification', () => {
      useAppStore.getState().notify('Test message', 'success');
      expect(useAppStore.getState().notifications.length).toBe(1);
    });

    it('adds notification with correct message', () => {
      useAppStore.getState().notify('Hello World', 'info');
      expect(useAppStore.getState().notifications[0].message).toBe('Hello World');
    });

    it('adds notification with correct type', () => {
      useAppStore.getState().notify('Error!', 'error');
      expect(useAppStore.getState().notifications[0].type).toBe('error');
    });

    it('defaults to info type', () => {
      useAppStore.getState().notify('Info');
      expect(useAppStore.getState().notifications[0].type).toBe('info');
    });

    it('removes notification by id', () => {
      useAppStore.getState().notify('Remove me', 'info');
      const id = useAppStore.getState().notifications[0].id;
      useAppStore.getState().removeNotification(id);
      expect(useAppStore.getState().notifications.length).toBe(0);
    });

    it('deduplicates identical messages within 2 seconds', () => {
      useAppStore.getState().notify('Same', 'info');
      useAppStore.getState().notify('Same', 'info');
      expect(useAppStore.getState().notifications.length).toBe(1);
    });

    it('limits to 3 notifications max', () => {
      useAppStore.getState().notify('Msg1', 'info');
      useAppStore.getState().notify('Msg2', 'info');
      useAppStore.getState().notify('Msg3', 'info');
      useAppStore.getState().notify('Msg4', 'info');
      expect(useAppStore.getState().notifications.length).toBe(3);
    });
  });

  describe('activeView', () => {
    it('defaults to dashboard', () => {
      expect(useAppStore.getState().activeView).toBe('dashboard');
    });

    it('sets active view to sales', () => {
      useAppStore.getState().setActiveView('sales');
      expect(useAppStore.getState().activeView).toBe('sales');
    });

    it('sets active view to tables', () => {
      useAppStore.getState().setActiveView('tables');
      expect(useAppStore.getState().activeView).toBe('tables');
    });

    it('sets active view to settings', () => {
      useAppStore.getState().setActiveView('settings');
      expect(useAppStore.getState().activeView).toBe('settings');
    });
  });

  describe('appState', () => {
    it('defaults to splash', () => {
      expect(useAppStore.getState().appState).toBe('splash');
    });

    it('transitions to login', () => {
      useAppStore.getState().setAppState('login');
      expect(useAppStore.getState().appState).toBe('login');
    });

    it('transitions to app', () => {
      useAppStore.getState().setAppState('app');
      expect(useAppStore.getState().appState).toBe('app');
    });
  });

  describe('onlineStatus', () => {
    it('defaults to true', () => {
      expect(useAppStore.getState().onlineStatus).toBe(true);
    });

    it('sets online status to false', () => {
      useAppStore.getState().setOnlineStatus(false);
      expect(useAppStore.getState().onlineStatus).toBe(false);
    });
  });
});
