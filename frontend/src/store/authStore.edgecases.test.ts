import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import type { Staff } from '@/types';

const mockApp = (
  window as typeof window & {
    go: { handler: { App: Record<string, unknown> } };
  }
).go.handler.App;

const mockStaff: Staff = {
  id: 'staff-1',
  username: 'admin',
  name: 'المدير',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const setUser = (role: string) => {
  useAuthStore.setState({
    currentUser: { ...mockStaff, role } as unknown as Staff,
    isAuthenticated: true,
    sessionStartedAt: Date.now(),
    isLoading: false,
  });
};

const resetStore = () => {
  useAuthStore.setState({
    currentUser: null,
    isAuthenticated: false,
    isLoading: false,
    sessionStartedAt: null,
  });
};

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
});

describe('authStore - Additional Edge Cases', () => {
  describe('session timeout with null values', () => {
    it('handles null lastActivityAt gracefully', () => {
      useAuthStore.setState({
        currentUser: mockStaff,
        isAuthenticated: true,
        sessionStartedAt: Date.now(),
        lastActivityAt: null,
      });

      // Should not throw
      expect(() => {
        useAuthStore.getState().checkSessionTimeout();
      }).not.toThrow();
    });

    it('handles null sessionStartedAt gracefully', () => {
      useAuthStore.setState({
        currentUser: mockStaff,
        isAuthenticated: true,
        sessionStartedAt: null,
        lastActivityAt: Date.now(),
      });

      // Should not throw
      expect(() => {
        useAuthStore.getState().checkSessionTimeout();
      }).not.toThrow();
    });

    it('does nothing when not authenticated', () => {
      resetStore();

      expect(() => {
        useAuthStore.getState().checkSessionTimeout();
      }).not.toThrow();
    });
  });

  describe('activity tracking edge cases', () => {
    it('handles session timeout check with all null values', () => {
      useAuthStore.setState({
        currentUser: mockStaff,
        isAuthenticated: true,
        sessionStartedAt: null,
        lastActivityAt: null,
      });

      expect(() => {
        useAuthStore.getState().checkSessionTimeout();
      }).not.toThrow();
    });
  });

  describe('role-based permissions edge cases', () => {
    it('handles empty role', () => {
      useAuthStore.setState({
        currentUser: { ...mockStaff, role: '' } as unknown as Staff,
        isAuthenticated: true,
      });

      expect(useAuthStore.getState().can('view:dashboard')).toBe(false);
      expect(useAuthStore.getState().canManageProducts()).toBe(false);
      expect(useAuthStore.getState().canManageStaff()).toBe(false);
    });

    it('handles null currentUser', () => {
      resetStore();

      expect(useAuthStore.getState().can('view:dashboard')).toBe(false);
      expect(useAuthStore.getState().canManageProducts()).toBe(false);
      expect(useAuthStore.getState().isAdmin()).toBe(false);
    });

    it('manager has correct permissions', () => {
      setUser('manager');

      expect(useAuthStore.getState().canManageProducts()).toBe(true);
      expect(useAuthStore.getState().canViewReports()).toBe(true);
      expect(useAuthStore.getState().canManageStaff()).toBe(false);
      expect(useAuthStore.getState().isManager()).toBe(true);
      expect(useAuthStore.getState().isAdmin()).toBe(false);
    });

    it('viewer has limited permissions', () => {
      setUser('viewer');

      expect(useAuthStore.getState().canViewReports()).toBe(true);
      expect(useAuthStore.getState().canCreateSale()).toBe(false);
      expect(useAuthStore.getState().canManageProducts()).toBe(false);
      expect(useAuthStore.getState().canManageStaff()).toBe(false);
    });
  });

  describe('login error handling', () => {
    it('handles API returning undefined', async () => {
      mockApp.Login = vi.fn().mockResolvedValue(undefined);

      const result = await useAuthStore.getState().login('admin', 'password');

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('handles API throwing error', async () => {
      mockApp.Login = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await useAuthStore.getState().login('admin', 'password');

      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('handles API returning null', async () => {
      mockApp.Login = vi.fn().mockResolvedValue(null);

      const result = await useAuthStore.getState().login('admin', 'password');

      expect(result).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout behavior', () => {
    it('clears all session data', () => {
      setUser('admin');

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.currentUser).toBeNull();
      expect(state.sessionStartedAt).toBeNull();
      expect(state.lastActivityAt).toBeNull();
      expect(state.showSessionWarning).toBe(false);
    });

    it('can logout when already logged out', () => {
      resetStore();

      expect(() => {
        useAuthStore.getState().logout();
      }).not.toThrow();
    });
  });

  describe('session warning', () => {
    it('dismisses session warning', () => {
      useAuthStore.setState({ showSessionWarning: true });

      useAuthStore.getState().dismissSessionWarning();

      expect(useAuthStore.getState().showSessionWarning).toBe(false);
    });

    it('can dismiss warning when not shown', () => {
      useAuthStore.setState({ showSessionWarning: false });

      expect(() => {
        useAuthStore.getState().dismissSessionWarning();
      }).not.toThrow();
    });
  });

  describe('permission methods with special characters', () => {
    it('handles permission with special characters', () => {
      setUser('admin');

      expect(useAuthStore.getState().can('view:dashboard')).toBe(true);
      expect(useAuthStore.getState().can('')).toBe(false);
      expect(useAuthStore.getState().can('invalid_permission')).toBe(false);
      expect(useAuthStore.getState().can('VIEW:DASHBOARD')).toBe(false); // case sensitive
    });
  });

  describe('concurrent state updates', () => {
    it('handles rapid state updates', () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        Promise.resolve().then(() => {
          useAuthStore.setState({
            currentUser: { ...mockStaff, role: `role-${i}` } as unknown as Staff,
          });
        })
      );

      return Promise.all(promises).then(() => {
        const state = useAuthStore.getState();
        expect(state.currentUser).toBeDefined();
      });
    });
  });
});
